import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const addVoteCounts = async (reports = []) => {
  if (!reports.length) return reports;

  const reportIds = reports.map((report) => report.id);
  const groupedVotes = await prisma.vote.groupBy({
    by: ["reportId", "type"],
    where: { reportId: { in: reportIds } },
    _count: { _all: true },
  });

  const countsByReport = new Map();
  for (const row of groupedVotes) {
    const current = countsByReport.get(row.reportId) || { upvotes: 0, downvotes: 0 };
    if (row.type === "UP") current.upvotes = row._count._all;
    if (row.type === "DOWN") current.downvotes = row._count._all;
    countsByReport.set(row.reportId, current);
  }

  return reports.map((report) => {
    const counts = countsByReport.get(report.id) || { upvotes: 0, downvotes: 0 };
    return { ...report, ...counts };
  });
};

/**
 * GET всички репорти
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - mine: if "true", filter to authenticated user's reports only
 *   - status: filter by status (Pending, Sent, Finished)
 *   - institutionId: filter by institution
 *   - categoryId: filter by category
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, mine, status, institutionId, categoryId } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    // Filter by user's own reports (requires auth token in header)
    if (mine === "true") {
      // Try to get user from token if provided
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const jwt = await import("jsonwebtoken");
          const token = authHeader.split(" ")[1];
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "secret");
          where.userId = decoded.id;
        } catch {
          // Invalid token, ignore mine filter
        }
      }
    }

    // Filter by status
    if (status && ["Pending", "Sent", "Finished"].includes(status)) {
      where.status = status;
    }

    // Filter by institution
    if (institutionId) {
      where.institutionId = Number(institutionId);
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // Get total count for pagination
    const total = await prisma.report.count({ where });

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    const reportsWithVotes = await addVoteCounts(reports);

    res.json({
      data: reportsWithVotes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/**
 * POST създаване на репорт (задължително логнат)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      categoryId,
      lat,
      lng,
      institutionId,
      address,
    } = req.body;

    // Задължителни полета
    if (!title || !categoryId || !lat || !lng || !institutionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate coordinates
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        lat: latNum,
        lng: lngNum,
        address: address || null,
        categoryId: Number(categoryId),
        institutionId: Number(institutionId),
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
      },
    });

    res.json(report);
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// Static routes MUST come BEFORE /:id to avoid being caught by the param route

// GET /api/reports/active
router.get("/active", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: {
          in: ["Sent", "Pending"],
        },
      },
      include: {
        institution: true,
        category: true,
      },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error loading active reports:", err);
    res.status(500).json({ error: "Failed to load active reports" });
  }
});

// GET /api/reports/map
router.get("/map", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: { in: ["Pending", "Sent"] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
      },
    });

    res.json(reports);
  } catch (err) {
    console.error("MAP ERROR:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET /api/reports/stats
// If authenticated, returns user-specific stats. Otherwise, returns global stats.
router.get("/stats", async (req, res) => {
  try {
    // Try to get user from token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = await import("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "secret");
        userId = decoded.id;
      } catch {
        // Invalid token, return global stats
      }
    }

    const where = userId ? { userId } : {};

    const total = await prisma.report.count({ where });
    const pending = await prisma.report.count({ where: { ...where, status: "Pending" } });
    const sent = await prisma.report.count({ where: { ...where, status: "Sent" } });
    const finished = await prisma.report.count({ where: { ...where, status: "Finished" } });

    res.json({
      total,
      byStatus: {
        PENDING: pending,
        SENT: sent,
        FINISHED: finished,
      },
      // Keep old format for backward compatibility
      pending,
      sent,
      finished,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

/**
 * GET репорт по ID - This MUST come AFTER all static routes
 */
router.get("/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        institution: true,
        category: true,
      },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({ where: { reportId: report.id, type: "UP" } }),
      prisma.vote.count({ where: { reportId: report.id, type: "DOWN" } }),
    ]);

    res.json({ ...report, upvotes, downvotes });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

/**
 * DELETE репорт (само собственикът може да изтрие)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check ownership
    if (report.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this report" });
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
