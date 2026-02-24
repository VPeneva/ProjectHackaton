import { config } from "../config.js";
import logger from "../logger.js";

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;

  const response = {
    error: err.message || "Internal server error",
  };

  // Only include stack trace in development
  if (config.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  if (status >= 500) {
    logger.error({ err, method: req.method, path: req.path, userId: req.user?.id }, "Server error");
  }

  res.status(status).json(response);
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
