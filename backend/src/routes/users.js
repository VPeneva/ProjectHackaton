import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

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
      reports,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

export default router;
