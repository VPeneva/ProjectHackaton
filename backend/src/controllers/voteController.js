import prisma from "../db/client.js";
import { sanitizeText } from "../utils/sanitize.js";
import { getUserStatsMap } from "../utils/gamification.js";
import { VOTE_EXPIRATION_DAYS, getVoteCutoff } from "../utils/votes.js";

const parseReportId = (value) => {
  const reportId = Number(value);
  return Number.isNaN(reportId) ? null : reportId;
};

export const vote = async (req, res) => {
  const reportId = parseReportId(req.params.reportId);
  const type = typeof req.body?.type === "string" ? req.body.type.toUpperCase() : "";
  const reasonProvided = req.body?.reason !== undefined;
  const reasonRaw = typeof req.body?.reason === "string" ? req.body.reason : "";
  const sanitizedReason = sanitizeText(reasonRaw);
  const reason =
    sanitizedReason && sanitizedReason.length > 0
      ? sanitizedReason.slice(0, 200)
      : null;

  if (!reportId) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  if (!["UP", "DOWN"].includes(type)) {
    return res.status(400).json({ error: "Invalid vote type" });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, createdAt: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const cutoff = getVoteCutoff();
    if (report.createdAt < cutoff) {
      return res.status(403).json({
        error: `Voting is closed for reports older than ${VOTE_EXPIRATION_DAYS} days.`,
      });
    }

    const updateData = reasonProvided ? { type, reason } : { type };
    const createData = {
      type,
      reason,
      userId: req.user.id,
      reportId,
    };

    const vote = await prisma.vote.upsert({
      where: {
        userId_reportId: {
          userId: req.user.id,
          reportId,
        },
      },
      update: updateData,
      create: createData,
    });

    res.json(vote);
  } catch (err) {
    console.error("Error voting on report:", err);
    res.status(500).json({ error: "Failed to submit vote" });
  }
};

export const removeVote = async (req, res) => {
  const reportId = parseReportId(req.params.reportId);

  if (!reportId) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    await prisma.vote.deleteMany({
      where: {
        reportId,
        userId: req.user.id,
      },
    });

    res.json({ success: true, message: "Vote removed" });
  } catch (err) {
    console.error("Error removing vote:", err);
    res.status(500).json({ error: "Failed to remove vote" });
  }
};

export const getMyVote = async (req, res) => {
  const reportId = parseReportId(req.params.reportId);

  if (!reportId) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const cutoff = getVoteCutoff();
    const vote = await prisma.vote.findFirst({
      where: {
        reportId,
        userId: req.user.id,
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(vote);
  } catch (err) {
    console.error("Error fetching vote:", err);
    res.status(500).json({ error: "Failed to fetch vote" });
  }
};

export const getVoteSummary = async (req, res) => {
  const reportId = parseReportId(req.params.reportId);

  if (!reportId) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, createdAt: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const cutoff = getVoteCutoff();
    const votes = await prisma.vote.findMany({
      where: { reportId, createdAt: { gte: cutoff } },
      select: { id: true, type: true, userId: true, reason: true },
    });

    const userIds = votes.map((vote) => vote.userId);
    const statsMap = await getUserStatsMap(prisma, userIds);

    let upvotes = 0;
    let downvotes = 0;
    let weightedUpvotes = 0;
    let weightedDownvotes = 0;
    const reasonCounts = new Map();

    for (const vote of votes) {
      if (vote.type === "UP") upvotes += 1;
      if (vote.type === "DOWN") downvotes += 1;

      const weight = statsMap.get(vote.userId)?.weight || 1;
      if (vote.type === "UP") weightedUpvotes += weight;
      if (vote.type === "DOWN") weightedDownvotes += weight;

      const reasonKey = vote.reason ? vote.reason.trim() : "";
      if (reasonKey) {
        reasonCounts.set(reasonKey, (reasonCounts.get(reasonKey) || 0) + 1);
      }
    }

    const reasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      upvotes,
      downvotes,
      total: upvotes + downvotes,
      weightedUpvotes: Number(weightedUpvotes.toFixed(2)),
      weightedDownvotes: Number(weightedDownvotes.toFixed(2)),
      weightedTotal: Number((weightedUpvotes + weightedDownvotes).toFixed(2)),
      reasons,
      votingClosed: report.createdAt < cutoff,
      votingClosedDays: VOTE_EXPIRATION_DAYS,
    });
  } catch (err) {
    console.error("Error fetching vote summary:", err);
    res.status(500).json({ error: "Failed to fetch vote summary" });
  }
};
