import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/**
 * GET /admin/reports
 * Всички НЕрешени репорти (Pending или Sent),
 * с възможност за филтър по institutionId
 */
router.get("/reports", authMiddleware, isAdmin, async (req, res) => {
  const { institutionId } = req.query;

  try {
    const reports = await prisma.report.findMany({
      where: {
        AND: [
          { status: { not: "FINISHED" } }, // ❗ показва само активни репорти
          institutionId ? { institutionId: Number(institutionId) } : {},
        ],
      },
      include: {
        user: true,
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching admin reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * PATCH /admin/reports/:id/send
 * Изпраща репорт към институция + променя статус на "SENT"
 */
router.patch("/reports/:id/send", authMiddleware, isAdmin, async (req, res) => {
  const { institutionId } = req.body;

  if (!institutionId) {
    return res.status(400).json({ error: "institutionId is required" });
  }

  try {
    const updated = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data: {
        status: "SENT",
        institutionId: Number(institutionId),
      },
      include: {
        user: true,
        institution: true,
        category: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error sending report:", err);
    res.status(500).json({ error: "Failed to send report" });
  }
});

/**
 * PATCH /admin/reports/:id/resolve
 * Маркира репорт като Finished
 */
router.patch(
  "/reports/:id/resolve",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await prisma.report.update({
        where: { id: Number(req.params.id) },
        data: { status: "FINISHED" },
        include: {
          user: true,
          institution: true,
          category: true,
        },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error resolving report:", err);
      res.status(500).json({ error: "Failed to resolve report" });
    }
  }
);

/**
 * GET /admin/resolved
 * Всички репорти със статус FINISHED
 */
router.get("/resolved", authMiddleware, isAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "FINISHED" },
      include: {
        user: true,
        institution: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching resolved reports:", err);
    res.status(500).json({ error: "Failed to fetch resolved reports" });
  }
});

/**
 * DELETE /admin/reports/:id/photo
 * Remove photo for a report (delete local file if uploaded to /uploads)
 */
router.delete(
  "/reports/:id/photo",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const report = await prisma.report.findUnique({ where: { id } });

      if (!report) return res.status(404).json({ error: "Report not found" });
      if (!report.imageUrl)
        return res.status(400).json({ error: "No image for this report" });

      // Attempt to delete local file if it points to /uploads
      try {
        const imgUrl = report.imageUrl;
        if (imgUrl.includes("/uploads/")) {
          // extract pathname and basename
          const parsed = new URL(imgUrl);
          const filename = path.basename(parsed.pathname);
          const filePath = path.join(process.cwd(), "uploads", filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("Failed to delete local image file:", err.message);
      }

      const updated = await prisma.report.update({
        where: { id },
        data: { imageUrl: null },
        include: { user: true, institution: true, category: true },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error removing report photo:", err);
      res.status(500).json({ error: "Failed to remove photo" });
    }
  }
);

export default router;
