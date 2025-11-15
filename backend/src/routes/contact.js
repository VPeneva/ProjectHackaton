import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// --- USER SENDS MESSAGE ---
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    res.json({ success: true, saved });
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- ADMIN GET ALL MESSAGES ---
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(messages);
  } catch (err) {
    console.error("Admin contact fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
