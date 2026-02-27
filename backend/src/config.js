import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env before validation
dotenv.config({ path: path.join(__dirname, "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  // Admin
  ADMIN_REGISTER_KEY: z.string().min(1, "ADMIN_REGISTER_KEY is required"),

  // CORS (comma-separated for multiple origins, e.g. "http://example.com,https://example.com")
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Password reset
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(60),
  EXPOSE_RESET_TOKEN: z
    .string()
    .transform((v) => v === "true")
    .default("false"),

  // Redis (optional in dev)
  REDIS_URL: z.string().optional(),

  // Upload
  UPLOAD_PROVIDER: z.enum(["local", "s3"]).default("local"),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment configuration:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const config = result.data;

  // Production safety checks
  if (config.NODE_ENV === "production") {
    if (config.EXPOSE_RESET_TOKEN) {
      console.error("EXPOSE_RESET_TOKEN must be false in production");
      process.exit(1);
    }
    if (config.JWT_SECRET.includes("change-in-production")) {
      console.error("JWT_SECRET must be changed from the default value in production");
      process.exit(1);
    }
  }

  return config;
}

export const config = loadConfig();
