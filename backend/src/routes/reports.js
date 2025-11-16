import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET всички репорти
 */
router.get("/", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: true,
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
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
    } = req.body;

    // Задължителни полета
    if (!title || !categoryId || !lat || !lng || !institutionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description: description || null, // optional
        imageUrl: imageUrl || null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        categoryId: Number(categoryId),
        institutionId: Number(institutionId),
        userId: req.user.id,
      },
      include: {
        user: true,
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

/**
 * GET репорт по ID
 */
router.get("/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        institution: true,
        category: true,
      },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// GET /api/reports/active
router.get("/active", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: {
          in: ["Sent", "Processing", "Pending"],
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

router.get("/map", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: { in: ["Pending", "Sent"] },
      },
      include: {
        user: true,
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

router.get("/stats", async (req, res) => {
  try {
    const total = await prisma.report.count();
    const pending = await prisma.report.count({ where: { status: "Pending" }});
    const sent = await prisma.report.count({ where: { status: "Sent" }});
    const resolved = await prisma.report.count({ where: { status: "Resolved" }});

    res.json({
      total,
      pending,
      sent,
      resolved
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.get("/reports/resolved", authMiddleware, isAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "FINISHED" },
      include: {
        user: true,
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching resolved reports:", err);
    res.status(500).json({ error: "Failed to fetch resolved reports" });
  }
});


export default router;
