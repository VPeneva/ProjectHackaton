import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../src/middleware/authMiddleware.js';
import { isAdmin } from '../src/middleware/isAdmin.js';
import { isInstitution } from '../src/middleware/isInstitution.js';

// Helper to create mock req/res/next
function createMocks(overrides = {}) {
  const req = {
    headers: {},
    user: null,
    ...overrides,
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, wasNextCalled: () => nextCalled };
}

describe('authMiddleware', () => {
  it('passes with a valid JWT', () => {
    const token = jwt.sign(
      { id: 1, email: 'user@test.com', role: 'USER' },
      process.env.JWT_SECRET
    );
    const { req, res, next, wasNextCalled } = createMocks({
      headers: { authorization: `Bearer ${token}` },
    });

    authMiddleware(req, res, next);

    expect(wasNextCalled()).toBe(true);
    expect(req.user).toMatchObject({ id: 1, role: 'USER' });
  });

  it('rejects missing token with 401', () => {
    const { req, res, next, wasNextCalled } = createMocks();

    authMiddleware(req, res, next);

    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Not authorized');
  });

  it('rejects invalid token with 401', () => {
    const { req, res, next, wasNextCalled } = createMocks({
      headers: { authorization: 'Bearer totally-invalid-token' },
    });

    authMiddleware(req, res, next);

    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });
});

describe('isAdmin', () => {
  it('passes for ADMIN role', () => {
    const { req, res, next, wasNextCalled } = createMocks({
      user: { id: 1, role: 'ADMIN' },
    });

    isAdmin(req, res, next);

    expect(wasNextCalled()).toBe(true);
  });

  it('rejects USER role with 403', () => {
    const { req, res, next, wasNextCalled } = createMocks({
      user: { id: 2, role: 'USER' },
    });

    isAdmin(req, res, next);

    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });
});

describe('isInstitution', () => {
  it('passes for INSTITUTION role', () => {
    const { req, res, next, wasNextCalled } = createMocks({
      user: { id: 3, role: 'INSTITUTION', institutionId: 1 },
    });

    isInstitution(req, res, next);

    expect(wasNextCalled()).toBe(true);
  });

  it('rejects non-INSTITUTION role with 403', () => {
    const { req, res, next, wasNextCalled } = createMocks({
      user: { id: 4, role: 'USER' },
    });

    isInstitution(req, res, next);

    expect(wasNextCalled()).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Access denied');
  });
});
