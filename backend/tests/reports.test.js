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

describe('GET /api/reports', () => {
  it('returns paginated list of reports', async () => {
    const mockReports = [
      {
        id: 1,
        title: 'Broken streetlight',
        status: 'Pending',
        user: { id: 1, name: 'User' },
        institution: null,
        category: null,
        images: [],
      },
    ];

    prisma.report.count.mockResolvedValue(1);
    prisma.report.findMany.mockResolvedValue(mockReports);
    prisma.vote.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/reports');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(1);
  });

  it('filters by status', async () => {
    prisma.report.count.mockResolvedValue(0);
    prisma.report.findMany.mockResolvedValue([]);
    prisma.vote.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/reports?status=Finished');

    expect(res.status).toBe(200);
    // Verify findMany was called with status filter
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'Finished' }),
      })
    );
  });

  it('searches by text', async () => {
    prisma.report.count.mockResolvedValue(0);
    prisma.report.findMany.mockResolvedValue([]);
    prisma.vote.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/reports?search=pothole');

    expect(res.status).toBe(200);
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              title: { contains: 'pothole', mode: 'insensitive' },
            }),
          ]),
        }),
      })
    );
  });
});

describe('POST /api/reports', () => {
  it('creates a report when authenticated', async () => {
    const mockReport = {
      id: 10,
      title: 'Pothole on Main St',
      description: 'Large pothole',
      status: 'Pending',
      categoryId: 1,
      institutionId: 1,
      userId: 1,
      user: { id: 1, email: 'user@test.com', name: 'User', role: 'USER' },
      institution: { id: 1, name: 'Road Dept' },
      category: { id: 1, name: 'Roads' },
      images: [],
    };

    prisma.report.findMany.mockResolvedValue([]); // duplicate check
    prisma.report.create.mockResolvedValue(mockReport);

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Pothole on Main St',
        description: 'Large pothole',
        categoryId: 1,
        institutionId: 1,
        lat: 42.6977,
        lng: 23.3219,
        address: 'Main St 1',
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Pothole on Main St');
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/reports').send({
      title: 'Should fail',
      categoryId: 1,
      institutionId: 1,
    });

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/reports/:id', () => {
  it('updates own pending report', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 1,
      title: 'Old Title',
      status: 'Pending',
      userId: 1,
    });

    const updatedReport = {
      id: 1,
      title: 'New Title',
      status: 'Pending',
      userId: 1,
      user: { id: 1, email: 'user@test.com', name: 'User', role: 'USER' },
      institution: null,
      category: null,
      images: [],
    };

    prisma.$transaction.mockImplementation(async (fn) => {
      const tx = {
        report: {
          update: vi.fn().mockResolvedValue(updatedReport),
          findUnique: vi.fn().mockResolvedValue(updatedReport),
        },
        reportImage: {
          deleteMany: vi.fn().mockResolvedValue({}),
          createMany: vi.fn().mockResolvedValue({}),
        },
      };
      return fn(tx);
    });

    const res = await request(app)
      .patch('/api/reports/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Title' });

    expect(res.status).toBe(200);
  });

  it('rejects editing non-pending report', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 2,
      title: 'Sent Report',
      status: 'Sent',
      userId: 1,
    });

    const res = await request(app)
      .patch('/api/reports/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Only pending reports can be edited');
  });
});

describe('DELETE /api/reports/:id', () => {
  it('deletes own report', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      status: 'Pending',
    });
    prisma.report.delete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/reports/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects deleting another user\'s report', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 5,
      userId: 999, // different user
      status: 'Pending',
    });

    const res = await request(app)
      .delete('/api/reports/5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Not authorized to delete this report');
  });
});
