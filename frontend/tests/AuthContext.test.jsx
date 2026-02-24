import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Helper component that exposes auth context values
function AuthConsumer({ onRender }) {
  const auth = useAuth();
  onRender(auth);
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="admin">{String(auth.isAdmin)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('provides default unauthenticated state', async () => {
    let authValues;
    render(
      <AuthProvider>
        <AuthConsumer onRender={(v) => (authValues = v)} />
      </AuthProvider>
    );

    // Wait for useEffect to set loading=false
    await vi.waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('login() stores token and user', async () => {
    let authValues;
    render(
      <AuthProvider>
        <AuthConsumer onRender={(v) => (authValues = v)} />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    act(() => {
      authValues.login({ id: 1, name: 'Test', role: 'USER' }, 'my-jwt-token');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(localStorage.getItem('token')).toBe('my-jwt-token');
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({
      id: 1,
      name: 'Test',
    });
  });

  it('logout() clears state and localStorage', async () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'USER' }));

    let authValues;
    render(
      <AuthProvider>
        <AuthConsumer onRender={(v) => (authValues = v)} />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    act(() => {
      authValues.logout();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('isAdmin flag is correct for ADMIN role', async () => {
    localStorage.setItem('token', 'admin-token');
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 99, name: 'Admin', role: 'ADMIN' })
    );

    render(
      <AuthProvider>
        <AuthConsumer onRender={() => {}} />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('admin').textContent).toBe('true');
  });

  it('recovers from corrupted localStorage', async () => {
    localStorage.setItem('token', 'some-token');
    localStorage.setItem('user', 'NOT-VALID-JSON{{{');

    render(
      <AuthProvider>
        <AuthConsumer onRender={() => {}} />
      </AuthProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // localStorage should be cleaned up
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    // isAdmin should be false since user is null
    expect(screen.getByTestId('admin').textContent).toBe('false');
  });
});
