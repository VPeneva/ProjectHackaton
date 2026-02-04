import prisma from "../db/client.js";

const parseReportId = (value) => {
  const reportId = Number(value);
  return Number.isNaN(reportId) ? null : reportId;
};

export const vote = async (req, res) => {
  const reportId = parseReportId(req.params.reportId);
  const type = typeof req.body?.type === "string" ? req.body.type.toUpperCase() : "";

  if (!reportId) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  if (!["UP", "DOWN"].includes(type)) {
    return res.status(400).json({ error: "Invalid vote type" });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const vote = await prisma.vote.upsert({
      where: {
        userId_reportId: {
          userId: req.user.id,
          reportId,
        },
      },
      update: { type },
      create: {
        type,
        userId: req.user.id,
        reportId,
      },
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
    const vote = await prisma.vote.findUnique({
      where: {
        userId_reportId: {
          userId: req.user.id,
          reportId,
        },
      },
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
      select: { id: true },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({
        where: { reportId, type: "UP" },
      }),
      prisma.vote.count({
        where: { reportId, type: "DOWN" },
      }),
    ]);

    res.json({ upvotes, downvotes, total: upvotes + downvotes });
  } catch (err) {
    console.error("Error fetching vote summary:", err);
    res.status(500).json({ error: "Failed to fetch vote summary" });
  }
};
