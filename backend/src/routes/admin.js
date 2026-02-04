import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";
import fs from "fs";
import path from "path";
import { createNotifications } from "../utils/notifications.js";
import { getVoteCutoff } from "../utils/votes.js";
import { hashPassword } from "../utils/hash.js";
import { sanitizeText } from "../utils/sanitize.js";

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
        images: { orderBy: { createdAt: "asc" } },
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
        title: "Report sent to institution",
        body: updated.title,
        type: "REPORT_STATUS",
        reportId: updated.id,
      }))
    );

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
        images: { orderBy: { createdAt: "asc" } },
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
 * GET /admin/institutions/:id/users
 * List institution portal users for an institution.
 */
router.get("/institutions/:id/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const institutionId = Number(req.params.id);
    if (Number.isNaN(institutionId)) {
      return res.status(400).json({ error: "Invalid institution ID" });
    }

    const users = await prisma.user.findMany({
      where: { institutionId, role: "INSTITUTION" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error("Error fetching institution users:", err);
    res.status(500).json({ error: "Failed to load institution users" });
  }
});

/**
 * POST /admin/institutions/:id/users
 * Create an institution portal account.
 */
router.post("/institutions/:id/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const institutionId = Number(req.params.id);
    if (Number.isNaN(institutionId)) {
      return res.status(400).json({ error: "Invalid institution ID" });
    }

    const { name, email, password } = req.body;
    const sanitizedName = sanitizeText(name);
    if (!sanitizedName || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email,
        password: hashed,
        role: "INSTITUTION",
        institutionId,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.json(user);
  } catch (err) {
    console.error("Error creating institution user:", err);
    res.status(500).json({ error: "Failed to create institution user" });
  }
});

/**
 * DELETE /admin/institutions/:id/users/:userId
 * Remove an institution portal account.
 */
router.delete("/institutions/:id/users/:userId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const institutionId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (Number.isNaN(institutionId) || Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid institution or user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, institutionId: true, role: true },
    });

    if (!user || user.role !== "INSTITUTION" || user.institutionId !== institutionId) {
      return res.status(404).json({ error: "Institution user not found" });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting institution user:", err);
    res.status(500).json({ error: "Failed to delete institution user" });
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
      const report = await prisma.report.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!report) return res.status(404).json({ error: "Report not found" });
      const imageUrls = report.images?.length
        ? report.images.map((image) => image.url)
        : report.imageUrl
          ? [report.imageUrl]
          : [];

      if (!imageUrls.length) {
        return res.status(400).json({ error: "No image for this report" });
      }

      // Attempt to delete local file if it points to /uploads
      let localDeleteFailed = false;
      let localDeleteError = null;

      for (const imgUrl of imageUrls) {
        if (imgUrl.includes("/uploads/")) {
          try {
            // Handle both full URLs and relative paths
            let filename;
            if (imgUrl.startsWith("http")) {
              const parsed = new URL(imgUrl);
              filename = path.basename(parsed.pathname);
            } else {
              filename = path.basename(imgUrl);
            }
            const filePath = path.join(process.cwd(), "uploads", filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            localDeleteFailed = true;
            localDeleteError = err;
          }
        }
      }

      if (localDeleteFailed) {
        console.warn("Failed to delete local image file:", localDeleteError?.message);
        return res.status(500).json({ error: "Failed to delete image file. Report photo not removed." });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.reportImage.deleteMany({ where: { reportId: id } });
        await tx.report.update({
          where: { id },
          data: { imageUrl: null },
        });

        return tx.report.findUnique({
          where: { id },
          include: {
            user: { select: userSelect },
            institution: true,
            category: true,
            images: { orderBy: { createdAt: "asc" } },
          },
        });
      });

      res.json(updated);
    } catch (err) {
      console.error("Error removing report photo:", err);
      res.status(500).json({ error: "Failed to remove photo" });
    }
  }
);

/**
 * POST /admin/reports/bulk-send
 * Bulk send reports to institution
 */
router.post("/reports/bulk-send", authMiddleware, isAdmin, async (req, res) => {
  const { ids, institutionId } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Report IDs are required" });
  }

  if (!institutionId) {
    return res.status(400).json({ error: "institutionId is required" });
  }

  const reportIds = ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));

  try {
    const reports = await prisma.report.findMany({
      where: { id: { in: reportIds } },
      select: { id: true, title: true, userId: true },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { reportId: { in: reportIds } },
      select: { reportId: true, userId: true },
    });

    const subsByReport = new Map();
    for (const sub of subscriptions) {
      const list = subsByReport.get(sub.reportId) || [];
      list.push(sub.userId);
      subsByReport.set(sub.reportId, list);
    }

    const result = await prisma.report.updateMany({
      where: { id: { in: reportIds }, status: { in: ["Pending", "Sent"] } },
      data: { status: "Sent", institutionId: Number(institutionId) },
    });

    const notifications = reports.flatMap((report) => {
      const recipientIds = new Set([report.userId, ...(subsByReport.get(report.id) || [])]);
      return Array.from(recipientIds).map((userId) => ({
        userId,
        title: "Report sent to institution",
        body: report.title,
        type: "REPORT_STATUS",
        reportId: report.id,
      }));
    });

    await createNotifications(notifications);

    res.json({ updated: result.count });
  } catch (err) {
    console.error("Error bulk sending reports:", err);
    res.status(500).json({ error: "Failed to bulk send reports" });
  }
});

/**
 * POST /admin/reports/bulk-resolve
 * Bulk resolve reports
 */
router.post("/reports/bulk-resolve", authMiddleware, isAdmin, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Report IDs are required" });
  }

  const reportIds = ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));

  try {
    const reports = await prisma.report.findMany({
      where: { id: { in: reportIds } },
      select: { id: true, title: true, userId: true },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: { reportId: { in: reportIds } },
      select: { reportId: true, userId: true },
    });

    const subsByReport = new Map();
    for (const sub of subscriptions) {
      const list = subsByReport.get(sub.reportId) || [];
      list.push(sub.userId);
      subsByReport.set(sub.reportId, list);
    }

    const result = await prisma.report.updateMany({
      where: { id: { in: reportIds }, status: { in: ["Pending", "Sent"] } },
      data: { status: "Finished" },
    });

    const notifications = reports.flatMap((report) => {
      const recipientIds = new Set([report.userId, ...(subsByReport.get(report.id) || [])]);
      return Array.from(recipientIds).map((userId) => ({
        userId,
        title: "Report marked as resolved",
        body: report.title,
        type: "REPORT_STATUS",
        reportId: report.id,
      }));
    });

    await createNotifications(notifications);

    res.json({ updated: result.count });
  } catch (err) {
    console.error("Error bulk resolving reports:", err);
    res.status(500).json({ error: "Failed to bulk resolve reports" });
  }
});

/**
 * POST /admin/reports/merge
 * Merge duplicate reports by moving data from sourceId into targetId.
 */
router.post("/reports/merge", authMiddleware, isAdmin, async (req, res) => {
  const { sourceId, targetId } = req.body;
  const sourceReportId = Number(sourceId);
  const targetReportId = Number(targetId);

  if (Number.isNaN(sourceReportId) || Number.isNaN(targetReportId)) {
    return res.status(400).json({ error: "Invalid report IDs" });
  }

  if (sourceReportId === targetReportId) {
    return res.status(400).json({ error: "Source and target must be different" });
  }

  try {
    const reports = await prisma.report.findMany({
      where: { id: { in: [sourceReportId, targetReportId] } },
      include: { images: true },
    });

    const source = reports.find((report) => report.id === sourceReportId);
    const target = reports.find((report) => report.id === targetReportId);

    if (!source || !target) {
      return res.status(404).json({ error: "Report not found" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const targetVoteUsers = await tx.vote.findMany({
        where: { reportId: targetReportId },
        select: { userId: true },
      });
      const voteUserIds = targetVoteUsers.map((vote) => vote.userId);

      await tx.vote.updateMany({
        where: { reportId: sourceReportId, userId: { notIn: voteUserIds } },
        data: { reportId: targetReportId },
      });
      if (voteUserIds.length) {
        await tx.vote.deleteMany({
          where: { reportId: sourceReportId, userId: { in: voteUserIds } },
        });
      }

      const targetSubUsers = await tx.subscription.findMany({
        where: { reportId: targetReportId },
        select: { userId: true },
      });
      const subUserIds = targetSubUsers.map((sub) => sub.userId);

      await tx.subscription.updateMany({
        where: { reportId: sourceReportId, userId: { notIn: subUserIds } },
        data: { reportId: targetReportId },
      });
      if (subUserIds.length) {
        await tx.subscription.deleteMany({
          where: { reportId: sourceReportId, userId: { in: subUserIds } },
        });
      }

      await tx.comment.updateMany({
        where: { reportId: sourceReportId },
        data: { reportId: targetReportId },
      });

      await tx.reportImage.updateMany({
        where: { reportId: sourceReportId },
        data: { reportId: targetReportId },
      });

      await tx.notification.updateMany({
        where: { reportId: sourceReportId },
        data: { reportId: targetReportId },
      });

      const patch = {};
      if (!target.description && source.description) patch.description = source.description;
      if (!target.address && source.address) patch.address = source.address;
      if (target.lat === null && source.lat !== null) patch.lat = source.lat;
      if (target.lng === null && source.lng !== null) patch.lng = source.lng;
      if (!target.imageUrl && source.imageUrl) patch.imageUrl = source.imageUrl;
      if (!target.categoryId && source.categoryId) patch.categoryId = source.categoryId;
      if (!target.institutionId && source.institutionId)
        patch.institutionId = source.institutionId;

      if (Object.keys(patch).length) {
        await tx.report.update({
          where: { id: targetReportId },
          data: patch,
        });
      }

      await tx.report.delete({ where: { id: sourceReportId } });

      return tx.report.findUnique({
        where: { id: targetReportId },
        include: {
          user: { select: userSelect },
          institution: true,
          category: true,
          images: { orderBy: { createdAt: "asc" } },
        },
      });
    });

    const [withVotes] = await addVoteCounts([updated]);
    res.json(withVotes);
  } catch (err) {
    console.error("Error merging reports:", err);
    res.status(500).json({ error: "Failed to merge reports" });
  }
});

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
    const voteCutoff = getVoteCutoff();
    const ratiosByStatus = await Promise.all(
      statuses.map(async (status) => {
        const [upvotes, downvotes] = await Promise.all([
          prisma.vote.count({
            where: { type: "UP", report: { status }, createdAt: { gte: voteCutoff } },
          }),
          prisma.vote.count({
            where: { type: "DOWN", report: { status }, createdAt: { gte: voteCutoff } },
          }),
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

/**
 * GET /admin/analytics
 * Returns trend data and resolution metrics
 */
router.get("/analytics", authMiddleware, isAdmin, async (req, res) => {
  try {
    const days = Math.max(7, Number(req.query.days) || 30);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const reports = await prisma.report.findMany({
      where: {
        createdAt: { gte: start },
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
        lat: true,
        lng: true,
      },
    });

    const byDay = new Map();
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      byDay.set(key, { date: key, total: 0, pending: 0, sent: 0, finished: 0 });
    }

    const resolutionDays = [];
    const statusTotals = { Pending: 0, Sent: 0, Finished: 0 };

    for (const report of reports) {
      const key = report.createdAt.toISOString().slice(0, 10);
      const entry = byDay.get(key);
      if (entry) {
        entry.total += 1;
        if (report.status === "Pending") entry.pending += 1;
        if (report.status === "Sent") entry.sent += 1;
        if (report.status === "Finished") entry.finished += 1;
      }

      if (report.status === "Finished") {
        const diff = (report.updatedAt - report.createdAt) / (1000 * 60 * 60 * 24);
        resolutionDays.push(diff);
      }

      if (statusTotals[report.status] !== undefined) {
        statusTotals[report.status] += 1;
      }
    }

    const averageResolutionDays = resolutionDays.length
      ? resolutionDays.reduce((sum, value) => sum + value, 0) / resolutionDays.length
      : 0;

    const sortedResolution = [...resolutionDays].sort((a, b) => a - b);
    const medianResolutionDays = sortedResolution.length
      ? sortedResolution[Math.floor(sortedResolution.length / 2)]
      : 0;

    const heatmap = reports
      .filter((report) => report.lat !== null && report.lng !== null)
      .map((report) => ({
        lat: report.lat,
        lng: report.lng,
        status: report.status,
      }));

    res.json({
      days,
      trends: Array.from(byDay.values()),
      resolution: {
        averageDays: averageResolutionDays,
        medianDays: medianResolutionDays,
        sampleSize: resolutionDays.length,
      },
      statusTotals,
      heatmap,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
