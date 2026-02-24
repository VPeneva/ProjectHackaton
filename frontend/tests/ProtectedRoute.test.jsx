import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the AuthContext module
vi.mock('@/context/AuthContext', () => {
  let mockValues = {
    isAuthenticated: false,
    loading: false,
    user: null,
    token: null,
    isAdmin: false,
    isInstitution: false,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  };

  return {
    useAuth: () => mockValues,
    __setMockAuth: (overrides) => {
      mockValues = { ...mockValues, ...overrides };
    },
    AuthProvider: ({ children }) => children,
  };
});

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { __setMockAuth } from '@/context/AuthContext';

function renderWithRouter(initialEntries = ['/protected']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/protected"
            element={<div>Protected Content</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    __setMockAuth({ isAuthenticated: false, loading: false });

    renderWithRouter();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    __setMockAuth({ isAuthenticated: true, loading: false });

    renderWithRouter();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading skeleton while loading', () => {
    __setMockAuth({ isAuthenticated: false, loading: true });

    const { container } = renderWithRouter();

    // Skeleton renders divs with the skeleton class pattern
    // The component renders a container with space-y-4 and skeleton children
    expect(container.querySelector('.space-y-4')).toBeInTheDocument();
  });
});
