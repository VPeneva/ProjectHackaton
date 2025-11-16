import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Взима ВСИЧКИ категории или категориите за дадена институция
router.get("/", async (req, res) => {
  try {
    const { institutionId } = req.query;

    const categories = await prisma.category.findMany({
      where: institutionId
        ? { institutionId: Number(institutionId) }
        : {},
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// Създаване на нова категория
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  const { name, institutionId } = req.body;

  if (!name || !institutionId) {
    return res.status(400).json({ error: "Missing name or institutionId" });
  }

  const category = await prisma.category.create({
    data: { name, institutionId: Number(institutionId) }
  });

  res.json(category);
});

export default router;
