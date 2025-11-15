import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Hackathon Starter
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <span className="text-gray-600">Hi, {user.name || user.email}!</span>
                <Button onClick={logout} variant="secondary">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
