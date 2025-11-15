import express from "express";
import prisma from "../db/client.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Връща всички институции
router.get("/", async (req, res) => {
  const institutions = await prisma.institution.findMany();
  res.json(institutions);
});

// Добавяне (админ)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  const { name } = req.body;
  const institution = await prisma.institution.create({
    data: { name },
  });
  res.json(institution);
});

// Триене (админ)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  await prisma.institution.delete({
    where: { id: parseInt(req.params.id) },
  });
  res.json({ success: true });
});

export default router;
