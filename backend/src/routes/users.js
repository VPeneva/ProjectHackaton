import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getUserStatsMap } from "../utils/gamification.js";

const router = express.Router();

/**
 * GET /api/users/me/subscriptions
 */
router.get("/me/subscriptions", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      include: {
        report: {
          include: {
            institution: true,
            category: true,
            images: { orderBy: { createdAt: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(subscriptions);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ error: "Failed to load subscriptions" });
  }
});

/**
 * GET /api/users/leaderboard
 * Public leaderboard of top contributors.
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true, createdAt: true },
    });

    const statsMap = await getUserStatsMap(
      prisma,
      users.map((user) => user.id)
    );

    const leaderboard = users
      .map((user) => {
        const data = statsMap.get(user.id) || {
          stats: { reports: 0, resolved: 0, comments: 0, votes: 0 },
          points: 0,
          badges: [],
        };
        return {
          user: {
            id: user.id,
            name: user.name,
            createdAt: user.createdAt,
          },
          points: data.points,
          badges: data.badges,
          stats: data.stats,
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

/**
 * GET /api/users/:id
 * Public profile with report history + stats
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [total, pending, sent, finished] = await Promise.all([
      prisma.report.count({ where: { userId } }),
      prisma.report.count({ where: { userId, status: "Pending" } }),
      prisma.report.count({ where: { userId, status: "Sent" } }),
      prisma.report.count({ where: { userId, status: "Finished" } }),
    ]);

    const statsMap = await getUserStatsMap(prisma, [userId]);
    const gamification = statsMap.get(userId) || {
      stats: { reports: total, resolved: finished, comments: 0, votes: 0 },
      points: 0,
      badges: [],
      weight: 1,
    };

    const reports = await prisma.report.findMany({
      where: { userId },
      include: {
        institution: true,
        category: true,
        images: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      user,
      stats: {
        total,
        pending,
        sent,
        finished,
      },
      gamification: {
        points: gamification.points,
        badges: gamification.badges,
        weight: gamification.weight,
        stats: gamification.stats,
      },
      reports,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

export default router;
