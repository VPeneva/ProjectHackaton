import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Shared user select to exclude password
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

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
 * GET /admin/reports
 * Всички НЕрешени репорти (Pending или Sent),
 * с възможност за филтър по institutionId
 */
router.get("/reports", authMiddleware, isAdmin, async (req, res) => {
  const { institutionId } = req.query;

  try {
    const reports = await prisma.report.findMany({
      where: {
        AND: [
          { status: { not: "Finished" } },
          institutionId ? { institutionId: Number(institutionId) } : {},
        ],
      },
      include: {
        user: { select: userSelect },
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reportsWithVotes = await addVoteCounts(reports);

    res.json(reportsWithVotes);
  } catch (err) {
    console.error("Error fetching admin reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * PATCH /admin/reports/:id/send
 * Изпраща репорт към институция + променя статус на "Sent"
 */
router.patch("/reports/:id/send", authMiddleware, isAdmin, async (req, res) => {
  const { institutionId } = req.body;

  if (!institutionId) {
    return res.status(400).json({ error: "institutionId is required" });
  }

  try {
    const updated = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data: {
        status: "Sent",
        institutionId: Number(institutionId),
      },
      include: {
        user: { select: userSelect },
        institution: true,
        category: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error sending report:", err);
    res.status(500).json({ error: "Failed to send report" });
  }
});

/**
 * PATCH /admin/reports/:id/resolve
 * Маркира репорт като Finished
 */
router.patch(
  "/reports/:id/resolve",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await prisma.report.update({
        where: { id: Number(req.params.id) },
        data: { status: "Finished" },
        include: {
          user: { select: userSelect },
          institution: true,
          category: true,
        },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error resolving report:", err);
      res.status(500).json({ error: "Failed to resolve report" });
    }
  }
);

/**
 * GET /admin/resolved
 * Всички репорти със статус Finished
 */
router.get("/resolved", authMiddleware, isAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "Finished" },
      include: {
        user: { select: userSelect },
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reportsWithVotes = await addVoteCounts(reports);

    res.json(reportsWithVotes);
  } catch (err) {
    console.error("Error fetching resolved reports:", err);
    res.status(500).json({ error: "Failed to fetch resolved reports" });
  }
});

/**
 * DELETE /admin/reports/:id/photo
 * Remove photo for a report (delete local file if uploaded to /uploads)
 */
router.delete(
  "/reports/:id/photo",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const report = await prisma.report.findUnique({ where: { id } });

      if (!report) return res.status(404).json({ error: "Report not found" });
      if (!report.imageUrl)
        return res.status(400).json({ error: "No image for this report" });

      // Attempt to delete local file if it points to /uploads
      try {
        const imgUrl = report.imageUrl;
        if (imgUrl.includes("/uploads/")) {
          // Handle both full URLs and relative paths
          let filename;
          if (imgUrl.startsWith("http")) {
            const parsed = new URL(imgUrl);
            filename = path.basename(parsed.pathname);
          } else {
            filename = path.basename(imgUrl);
          }
          const filePath = path.join(process.cwd(), "uploads", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("Failed to delete local image file:", err.message);
      }

      const updated = await prisma.report.update({
        where: { id },
        data: { imageUrl: null },
        include: {
          user: { select: userSelect },
          institution: true,
          category: true,
        },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error removing report photo:", err);
      res.status(500).json({ error: "Failed to remove photo" });
    }
  }
);

router.get("/vote-analytics", authMiddleware, isAdmin, async (req, res) => {
  try {
    const openReports = await prisma.report.findMany({
      where: { status: { in: ["Pending", "Sent"] } },
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const finishedReports = await prisma.report.findMany({
      where: { status: "Finished" },
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const [openWithVotes, finishedWithVotes] = await Promise.all([
      addVoteCounts(openReports),
      addVoteCounts(finishedReports),
    ]);

    const topUpvotedOpen = [...openWithVotes]
      .sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return b.downvotes - a.downvotes;
      })
      .slice(0, 5);

    const topDownvotedFinished = [...finishedWithVotes]
      .sort((a, b) => {
        if (b.downvotes !== a.downvotes) return b.downvotes - a.downvotes;
        return b.upvotes - a.upvotes;
      })
      .slice(0, 5);

    const statuses = ["Pending", "Sent", "Finished"];
    const ratiosByStatus = await Promise.all(
      statuses.map(async (status) => {
        const [upvotes, downvotes] = await Promise.all([
          prisma.vote.count({ where: { type: "UP", report: { status } } }),
          prisma.vote.count({ where: { type: "DOWN", report: { status } } }),
        ]);

        const total = upvotes + downvotes;
        return {
          status,
          upvotes,
          downvotes,
          total,
          ratio: total ? upvotes / total : 0,
        };
      })
    );

    res.json({ topUpvotedOpen, topDownvotedFinished, ratiosByStatus });
  } catch (err) {
    console.error("Error fetching vote analytics:", err);
    res.status(500).json({ error: "Failed to fetch vote analytics" });
  }
});

export default router;
