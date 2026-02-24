/**
 * Test setup: configure environment and provide helpers.
 */
import { vi } from 'vitest';
import jwt from 'jsonwebtoken';

// ── Environment variables used across the app ──
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.ADMIN_REGISTER_KEY = 'admin-secret-123';
process.env.NODE_ENV = 'test';
process.env.VOTE_EXPIRATION_DAYS = '180';
process.env.RESET_TOKEN_TTL_MINUTES = '60';
process.env.EXPOSE_RESET_TOKEN = 'true';

// ── Prisma mock ──
// Every test file that imports ../src/db/client.js will receive this mock.
vi.mock('../src/db/client.js', () => {
  return {
    default: {
      user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      report: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      vote: {
        upsert: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        groupBy: vi.fn(),
        count: vi.fn(),
      },
      comment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      subscription: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      reportImage: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      passwordResetToken: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      notification: { create: vi.fn(), createMany: vi.fn() },
      $transaction: vi.fn((fns) => {
        if (Array.isArray(fns)) return Promise.all(fns);
        // Support callback-style transaction
        return fns({
          report: {
            findUnique: vi.fn(),
            update: vi.fn(),
          },
          reportImage: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
          },
        });
      }),
    },
  };
});

// ── Mock notifications utility (avoids DB writes during tests) ──
vi.mock('../src/utils/notifications.js', () => ({
  createNotifications: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock gamification utility ──
vi.mock('../src/utils/gamification.js', () => ({
  getUserStatsMap: vi.fn().mockResolvedValue(new Map()),
}));

// ── Token helpers ──
export function generateToken(payload = {}) {
  const defaults = {
    id: 1,
    email: 'user@test.com',
    role: 'USER',
    institutionId: null,
  };
  return jwt.sign({ ...defaults, ...payload }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

export function adminToken() {
  return generateToken({ id: 99, email: 'admin@test.com', role: 'ADMIN' });
}

export function institutionToken(institutionId = 1) {
  return generateToken({
    id: 50,
    email: 'inst@test.com',
    role: 'INSTITUTION',
    institutionId,
  });
}

// ── Express app builder (no listen) ──
export async function buildApp() {
  // Dynamic import so mocks are applied before modules load
  const express = (await import('express')).default;
  const app = express();
  app.use(express.json());

  const authRoutes = (await import('../src/routes/auth.js')).default;
  const reportRoutes = (await import('../src/routes/reports.js')).default;
  const voteRoutes = (await import('../src/routes/votes.js')).default;

  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/votes', voteRoutes);

  return app;
}
