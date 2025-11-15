import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Взимане на всички репорти (за потребителския интерфейс)
 * Включваме и user, и institution
 */
router.get("/", async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: true,
        institution: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/**
 * Създаване на нов репорт
 * Само логнат потребител може да го направи
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      lat,
      lng,
      institutionId, // може да е null
    } = req.body;

    if (!title || !description || !category || !lat || !lng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        institutionId: institutionId ? Number(institutionId) : null,
        userId: req.user.id,
      },
      include: {
        user: true,
        institution: true,
      },
    });

    res.json(report);
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

/**
 * Взимане на един репорт по ID
 */
router.get("/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        institution: true,
      },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

export default router;
