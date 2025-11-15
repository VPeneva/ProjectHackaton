import express from "express";
import { createReport, getReports } from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected
router.post("/", authMiddleware, createReport);

// Public
router.get("/", getReports);

export default router;
