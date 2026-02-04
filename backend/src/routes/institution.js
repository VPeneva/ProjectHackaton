import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isInstitution } from "../middleware/isInstitution.js";
import { createNotifications } from "../utils/notifications.js";
import { getVoteCutoff } from "../utils/votes.js";

const router = express.Router();

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
  const voteCutoff = getVoteCutoff();
  const groupedVotes = await prisma.vote.groupBy({
    by: ["reportId", "type"],
    where: { reportId: { in: reportIds }, createdAt: { gte: voteCutoff } },
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

const getInstitutionId = async (req) => {
  if (req.user?.institutionId) return req.user.institutionId;
  const institutionUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { institutionId: true },
  });
  return institutionUser?.institutionId || null;
};

/**
 * GET /api/institution/reports
 * Lists reports assigned to the institution.
 */
router.get("/reports", authMiddleware, isInstitution, async (req, res) => {
  try {
    const institutionId = await getInstitutionId(req);
    if (!institutionId) {
      return res.status(400).json({ error: "Institution not linked to user" });
    }

    const reports = await prisma.report.findMany({
      where: { institutionId },
      include: {
        user: { select: userSelect },
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const reportsWithVotes = await addVoteCounts(reports);
    res.json(reportsWithVotes);
  } catch (err) {
    console.error("Error fetching institution reports:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/**
 * PATCH /api/institution/reports/:id/resolve
 * Mark report as resolved (Finished).
 */
router.patch("/reports/:id/resolve", authMiddleware, isInstitution, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (Number.isNaN(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const institutionId = await getInstitutionId(req);
    if (!institutionId) {
      return res.status(400).json({ error: "Institution not linked to user" });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, institutionId: true, title: true, userId: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (report.institutionId !== institutionId) {
      return res.status(403).json({ error: "Not authorized to resolve this report" });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status: "Finished" },
      include: {
        user: { select: userSelect },
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
    });

    const subscribers = await prisma.subscription.findMany({
      where: { reportId: updated.id },
      select: { userId: true },
    });

    const recipientIds = new Set(subscribers.map((sub) => sub.userId));
    recipientIds.add(updated.userId);

    await createNotifications(
      Array.from(recipientIds).map((userId) => ({
        userId,
        title: "Report marked as resolved",
        body: updated.title,
        type: "REPORT_STATUS",
        reportId: updated.id,
      }))
    );

    res.json(updated);
  } catch (err) {
    console.error("Error resolving institution report:", err);
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

export default router;
