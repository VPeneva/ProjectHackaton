import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { buildApp } from './setup.js';

let app;
let prisma;

beforeEach(async () => {
  // Reset all mocks between tests
  vi.clearAllMocks();

  // Get the mocked prisma client
  prisma = (await import('../src/db/client.js')).default;

  app = await buildApp();
});

describe('POST /api/auth/register', () => {
  it('registers a new user with valid data', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'new@test.com',
      name: 'New User',
      role: 'USER',
      institutionId: null,
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'new@test.com',
      password: 'StrongPass123!',
      name: 'New User',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.message).toBe('Registered successfully');
  });

  it('rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'existing@test.com',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'existing@test.com',
      password: 'StrongPass123!',
      name: 'Duplicate User',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already used');
  });

  it('creates admin user with valid adminKey', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 2,
      email: 'admin@test.com',
      name: 'Admin',
      role: 'ADMIN',
      institutionId: null,
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'admin@test.com',
      password: 'AdminPass123!',
      name: 'Admin',
      adminKey: 'admin-secret-123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    // Verify prisma.user.create was called with role ADMIN
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'ADMIN' }),
      })
    );
  });

  it('rejects invalid adminKey and creates regular user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 3,
      email: 'notadmin@test.com',
      name: 'Not Admin',
      role: 'USER',
      institutionId: null,
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'notadmin@test.com',
      password: 'SomePass123!',
      name: 'Not Admin',
      adminKey: 'wrong-key',
    });

    expect(res.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'USER' }),
      })
    );
  });
});

describe('POST /api/auth/login', () => {
  it('returns JWT token on valid credentials', async () => {
    // bcrypt hash of "CorrectPass123!"
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash('CorrectPass123!', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      password: hashed,
      name: 'Test User',
      role: 'USER',
      institutionId: null,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'CorrectPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  it('fails with wrong password', async () => {
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash('CorrectPass123!', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      password: hashed,
      role: 'USER',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('fails with non-existent email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'noone@test.com',
      password: 'Whatever123!',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('always returns success message (no email enumeration)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'If this email exists, a reset link has been sent.'
    );
  });

  it('generates reset token for existing user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
    });
    prisma.passwordResetToken.deleteMany.mockResolvedValue({});
    prisma.passwordResetToken.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'If this email exists, a reset link has been sent.'
    );
    // In test env, EXPOSE_RESET_TOKEN is true so the token is returned
    expect(res.body).toHaveProperty('resetToken');
  });
});

describe('POST /api/auth/reset-password', () => {
  it('resets password with valid token', async () => {
    const crypto = await import('crypto');
    const rawToken = 'valid-reset-token-abc123';
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      tokenHash,
      expiresAt: new Date(Date.now() + 3600000), // 1h in the future
    });
    prisma.$transaction.mockResolvedValue([{}, {}]);

    const res = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      password: 'NewStrongPass!123',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password reset successful');
  });

  it('fails with expired token', async () => {
    const crypto = await import('crypto');
    const rawToken = 'expired-token-xyz';
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 2,
      userId: 1,
      tokenHash,
      expiresAt: new Date(Date.now() - 3600000), // 1h in the past
    });
    prisma.passwordResetToken.delete.mockResolvedValue({});

    const res = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      password: 'NewPass!123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid or expired reset token');
  });
});
