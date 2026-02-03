import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  vote,
  removeVote,
  getMyVote,
  getVoteSummary,
} from "../controllers/voteController.js";

const router = express.Router();

router.get("/reports/:reportId/summary", getVoteSummary);
router.post("/reports/:reportId", authMiddleware, vote);
router.delete("/reports/:reportId", authMiddleware, removeVote);
router.get("/reports/:reportId/my-vote", authMiddleware, getMyVote);

export default router;
