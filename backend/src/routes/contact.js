import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

/**
 * Submit contact message (PUBLIC)
 */
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    res.json({ success: true, saved });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Admin: get all messages
 */
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
