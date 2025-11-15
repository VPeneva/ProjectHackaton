import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/Card';
import { User } from '../types';

export const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || user?.email}!</h2>
          <p className="text-gray-600">
            This is a protected route. Only authenticated users can see this page.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">All Users</h2>

          {loading && <p className="text-gray-600">Loading users...</p>}

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{u.name || 'No name'}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
