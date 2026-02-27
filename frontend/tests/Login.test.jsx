import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Use vi.hoisted so variables are available inside vi.mock factories
const { mockNavigate, mockLogin, mockAuthServiceLogin } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockLogin: vi.fn(),
  mockAuthServiceLogin: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    loading: false,
    user: null,
    token: null,
  }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('@/services/auth', () => ({
  authService: { login: mockAuthServiceLogin },
  default: { login: mockAuthServiceLogin },
}));

vi.mock('@/context/I18nContext', () => ({
  useI18n: () => ({
    t: (key) => {
      const map = {
        'auth.signIn': 'Sign In',
        'auth.accessYourAccount': 'Access your account',
        'auth.email': 'Email',
        'auth.emailPlaceholder': 'you@example.com',
        'auth.password': 'Password',
        'auth.passwordPlaceholder': '••••••••',
        'auth.forgot': 'Forgot?',
        'auth.signingIn': 'Signing in...',
        'auth.signInAction': 'Sign In',
        'auth.noAccount': "Don't have an account?",
        'auth.createOne': 'Create one',
        'auth.failedSignIn': 'Failed to sign in',
      };
      return map[key] || key;
    },
    language: 'en',
    setLanguage: vi.fn(),
  }),
  I18nProvider: ({ children }) => children,
}));

import Login from '@/pages/auth/Login';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    const user = userEvent.setup();
    mockAuthServiceLogin.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'bad@test.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on success', async () => {
    const user = userEvent.setup();
    mockAuthServiceLogin.mockResolvedValue({
      token: 'jwt-token',
      user: { id: 1, name: 'Test User', role: 'USER' },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/password/i), 'pass123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, name: 'Test User', role: 'USER' },
        'jwt-token'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });
  });

  it('disables form while loading', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    mockAuthServiceLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/password/i), 'pass123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    // Resolve to clean up
    resolveLogin({ token: 't', user: { id: 1, name: 'U', role: 'USER' } });
  });
});
