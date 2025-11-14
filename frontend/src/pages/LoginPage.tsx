import { useState, useEffect } from 'react';
import { login, logout, getCurrentUser, User } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password);
      setUser(userData);
      // Redirect to admin or home
      setTimeout(() => {
        window.location.href = '/wp-admin';
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
    }
  };

  if (user) {
    return (
      <>
        <PageHeader 
          title="Logged In"
          description={`Welcome back, ${user.name}!`}
          backgroundClass="bg-gradient-to-r from-primary-900 to-primary-700"
        />
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
              
              <div className="space-y-4">
                <a
                  href="/wp-admin"
                  className="block w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Go to WordPress Admin
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Login"
        description="Access the WordPress admin dashboard"
        backgroundClass="bg-gradient-to-r from-primary-900 to-primary-700"
      />
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your username or email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/wp-login.php?action=lostpassword"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

