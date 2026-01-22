import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Взима всички категории или категориите за дадена институция
router.get("/", async (req, res) => {
  try {
    const { institutionId } = req.query;

    const categories = await prisma.category.findMany({
      where: institutionId ? { institutionId: Number(institutionId) } : {},
      include: { institution: true },
    });

    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// Създаване на нова категория
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, institutionId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    if (!institutionId) {
      return res.status(400).json({ error: "Institution ID is required" });
    }

    // Verify institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: Number(institutionId) },
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), institutionId: Number(institutionId) },
    });

    res.json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Триене на категория
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Check if category has reports
    const reportCount = await prisma.report.count({
      where: { categoryId },
    });

    if (reportCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category with ${reportCount} existing report(s). Please reassign or delete the reports first.`,
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
