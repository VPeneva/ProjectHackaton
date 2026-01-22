import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Връща всички институции
router.get("/", async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany();
    res.json(institutions);
  } catch (err) {
    console.error("Error fetching institutions:", err);
    res.status(500).json({ error: "Failed to load institutions" });
  }
});

// Добавяне (админ)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Institution name is required" });
    }

    const institution = await prisma.institution.create({
      data: { name: name.trim() },
    });
    res.json(institution);
  } catch (err) {
    console.error("Error creating institution:", err);
    res.status(500).json({ error: "Failed to create institution" });
  }
});

// Триене (админ)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const institutionId = parseInt(req.params.id);

    // Check if institution has reports
    const reportCount = await prisma.report.count({
      where: { institutionId },
    });

    if (reportCount > 0) {
      return res.status(400).json({
        error: `Cannot delete institution with ${reportCount} existing report(s). Please reassign or delete the reports first.`,
      });
    }

    // Check if institution has categories
    const categoryCount = await prisma.category.count({
      where: { institutionId },
    });

    if (categoryCount > 0) {
      return res.status(400).json({
        error: `Cannot delete institution with ${categoryCount} existing category(ies). Please delete the categories first.`,
      });
    }

    await prisma.institution.delete({
      where: { id: institutionId },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting institution:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Institution not found" });
    }
    res.status(500).json({ error: "Failed to delete institution" });
  }
});

export default router;
