import Redis from "ioredis";
import logger from "../logger.js";

let redis = null;

export function getRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn("REDIS_URL not set — caching disabled");
    return null;
  }

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null; // stop retrying
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("connect", () => logger.info("Redis connected"));
  redis.on("error", (err) => logger.error({ err }, "Redis error"));

  return redis;
}

// Cache helpers
export async function cacheGet(key) {
  const client = getRedis();
  if (!client) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 60) {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // silent fail - cache is optional
  }
}

export async function cacheDel(pattern) {
  const client = getRedis();
  if (!client) return;
  try {
    if (pattern.includes("*")) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
  } catch {
    // silent fail
  }
}
