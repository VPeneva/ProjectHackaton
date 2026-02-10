import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";

// Config loads dotenv and validates all env vars at startup (fails fast if missing)
import { config } from "./config.js";
import logger from "./logger.js";
import { getRedis } from "./db/redis.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import institutionRoutes from "./routes/institutions.js";
import categoryRoutes from "./routes/categories.js";
import contactRoutes from "./routes/contact.js";
import uploadRoutes from "./routes/upload.js";
import voteRoutes from "./routes/votes.js";
import conversationRoutes from "./routes/conversations.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import institutionPortalRoutes from "./routes/institution.js";

const app = express();

// Request logging
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customProps: (req) => ({
    userId: req.user?.id || null,
  }),
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow serving uploaded files cross-origin
}));

// CORS - restrict to explicit origin
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Redis-backed rate limiting (falls back to in-memory if Redis unavailable)
const redisClient = getRedis();
const makeStore = (prefix) =>
  redisClient
    ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args), prefix: `rl:${prefix}:` })
    : undefined;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  store: makeStore("global"),
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later." },
  store: makeStore("auth"),
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads, please try again later." },
  store: makeStore("upload"),
});

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Backend endpoints
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institution", institutionPortalRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

app.listen(config.PORT, "0.0.0.0", () => {
  logger.info(`Backend running on port ${config.PORT} [${config.NODE_ENV}]`);
});
