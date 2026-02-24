import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { buildApp, generateToken } from './setup.js';

let app;
let prisma;
let token;

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = (await import('../src/db/client.js')).default;
  app = await buildApp();
  token = generateToken({ id: 1, email: 'user@test.com', role: 'USER' });
});

describe('POST /api/votes/reports/:reportId', () => {
  it('creates an upvote', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 1,
      createdAt: new Date(), // recent report
    });

    prisma.vote.upsert.mockResolvedValue({
      id: 1,
      type: 'UP',
      userId: 1,
      reportId: 1,
      reason: null,
    });

    const res = await request(app)
      .post('/api/votes/reports/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'UP' });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('UP');
  });

  it('upserts vote (changes UP to DOWN)', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 1,
      createdAt: new Date(),
    });

    prisma.vote.upsert.mockResolvedValue({
      id: 1,
      type: 'DOWN',
      userId: 1,
      reportId: 1,
      reason: null,
    });

    const res = await request(app)
      .post('/api/votes/reports/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'DOWN' });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('DOWN');
    expect(prisma.vote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_reportId: { userId: 1, reportId: 1 },
        },
      })
    );
  });

  it('rejects invalid vote type', async () => {
    const res = await request(app)
      .post('/api/votes/reports/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'INVALID' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid vote type');
  });
});

describe('DELETE /api/votes/reports/:reportId', () => {
  it('removes a vote', async () => {
    prisma.vote.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/votes/reports/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/votes/reports/:reportId/summary', () => {
  it('returns vote counts', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 1,
      createdAt: new Date(),
    });

    prisma.vote.findMany.mockResolvedValue([
      { id: 1, type: 'UP', userId: 1, reason: null },
      { id: 2, type: 'UP', userId: 2, reason: null },
      { id: 3, type: 'DOWN', userId: 3, reason: 'spam' },
    ]);

    const res = await request(app).get('/api/votes/reports/1/summary');

    expect(res.status).toBe(200);
    expect(res.body.upvotes).toBe(2);
    expect(res.body.downvotes).toBe(1);
    expect(res.body.total).toBe(3);
  });
});

describe('GET /api/votes/reports/:reportId/my-vote', () => {
  it("returns the user's vote", async () => {
    prisma.vote.findFirst.mockResolvedValue({
      id: 1,
      type: 'UP',
      userId: 1,
      reportId: 1,
    });

    const res = await request(app)
      .get('/api/votes/reports/1/my-vote')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('UP');
  });
});
