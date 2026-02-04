import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/notifications
 * List notifications for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error loading notifications:", err);
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ updated: result.count });
  } catch (err) {
    console.error("Error marking notifications read:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

export default router;
