import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Not authorized" });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // user info
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
