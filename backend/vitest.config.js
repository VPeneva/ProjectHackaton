import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
      JWT_SECRET: 'test-jwt-secret-key-that-is-at-least-32-characters-long',
      ADMIN_REGISTER_KEY: 'admin-secret-123',
      EXPOSE_RESET_TOKEN: 'true',
      RESET_TOKEN_TTL_MINUTES: '60',
    },
  },
});
