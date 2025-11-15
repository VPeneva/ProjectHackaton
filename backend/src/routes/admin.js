import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";

const router = express.Router();

/**
 * Всички репорти, които НЕ са изпратени и НЕ са оправени
 * + ФИЛТЪР по institutionId (ако е подаден)
 */
router.get("/reports", authMiddleware, isAdmin, async (req, res) => {
  const { institutionId } = req.query;

  try {
    const reports = await prisma.report.findMany({
      where: {
        AND: [
          { status: { notIn: ["Sent", "Resolved"] } },
          institutionId ? { institutionId: Number(institutionId) } : {}
        ]
      },
      include: {
  user: true,
  institution: true,
  category: true,
},
      orderBy: { createdAt: "desc" }
    });

    res.json(reports);
  } catch (err) {
    console.error("Error fetching admin reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * Изпратени към институция
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
        status: "Sent",
        institutionId: Number(institutionId)
      },
      include: { user: true, institutionRecord: true }
    });

    res.json(updated);
  } catch (err) {
    console.error("Error sending report:", err);
    res.status(500).json({ error: "Failed to send report" });
  }
});

/**
 * Маркиране като оправен
 */
router.patch("/reports/:id/resolve", authMiddleware, isAdmin, async (req, res) => {
  try {
    const updated = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data: { status: "Resolved" },
      include: { user: true, institutionRecord: true }
    });

    res.json(updated);
  } catch (err) {
    console.error("Error resolving report:", err);
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

export default router;
