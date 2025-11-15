import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Hackathon Starter
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A full-stack monorepo template with Express.js and React
          </p>

          {!user && (
            <div className="flex gap-4 justify-center mb-12">
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="mb-12">
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <h3 className="text-xl font-semibold mb-2">Backend</h3>
            <p className="text-gray-600">
              Express.js with TypeScript, Prisma ORM, and JWT authentication
            </p>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">Frontend</h3>
            <p className="text-gray-600">
              React 18 with Vite, TypeScript, and Tailwind CSS
            </p>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold mb-2">Ready to Go</h3>
            <p className="text-gray-600">
              Authentication, routing, and basic components included
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
