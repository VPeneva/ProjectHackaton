import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import prisma from "../db/client.js";

const router = express.Router();

// Взимане на всички репорти
router.get("/reports", authMiddleware, isAdmin, async (req, res) => {
  const reports = await prisma.report.findMany({
    include: { user: true }
  });
  res.json(reports);
});

// Смяна на статус
router.patch("/reports/:id/status", authMiddleware, isAdmin, async (req, res) => {
  const { status } = req.body;

  const updated = await prisma.report.update({
    where: { id: parseInt(req.params.id) },
    data: { status }
  });

  res.json(updated);
});

export default router;
