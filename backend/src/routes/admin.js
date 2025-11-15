import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";

const router = express.Router();

/**
 * Всички репорти, които НЕ са изпратени и НЕ са оправени
 * Тоест статусът им не е "Sent" и не е "Resolved"
 */
router.get("/reports", authMiddleware, isAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { status: null },
          { status: { notIn: ["Sent", "Resolved"] } }, // Pending и др.
        ],
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching admin reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * Всички ОПРАВЕНИ репорти
 */
router.get("/reports/resolved", authMiddleware, isAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "Resolved" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching resolved reports:", err);
    res.status(500).json({ error: "Failed to fetch resolved reports" });
  }
});

/**
 * Изпращане към институция → статус става "Sent"
 */
router.patch(
  "/reports/:id/send",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    const { institution } = req.body;

    if (!institution) {
      return res.status(400).json({ error: "Institution is required" });
    }

    try {
      const updated = await prisma.report.update({
        where: { id: parseInt(req.params.id, 10) },
        data: {
          status: "Sent",
          institution,
        },
        include: { user: true },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error sending report:", err);
      res.status(500).json({ error: "Failed to send report" });
    }
  }
);

/**
 * Маркиране като оправен → статус "Resolved"
 */
router.patch(
  "/reports/:id/resolve",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await prisma.report.update({
        where: { id: parseInt(req.params.id, 10) },
        data: {
          status: "Resolved",
        },
        include: { user: true },
      });

      res.json(updated);
    } catch (err) {
      console.error("Error resolving report:", err);
      res.status(500).json({ error: "Failed to resolve report" });
    }
  }
);

export default router;
