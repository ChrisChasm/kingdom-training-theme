/**
 * WordPress Authentication API
 * Handles user login, logout, and session management
 */

const getAPIUrl = () => {
  if (typeof window !== 'undefined') {
    return '/wp-json';
  }
  return import.meta.env.VITE_WORDPRESS_API_URL || 'http://localhost:8888/wp-json';
};

const API_URL = getAPIUrl();

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  capabilities?: string[] | Record<string, boolean | string>;
  roles?: string[];
}

/**
 * Login user with username/email and password
 */
export async function login(username: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/gaal/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid username or password');
  }

  return await response.json();
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/gaal/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/gaal/v1/auth/me`, {
      method: 'GET',
      credentials: 'include', // Include cookies for WordPress authentication
      headers: {
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Handle 200 OK responses (even if null)
    if (response.status === 200) {
      const data = await response.json();
      
      // If the API returns null (no user), return null
      if (!data || data === null || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return null;
      }

      return data;
    }

    // For any other status, user is not authenticated
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    // For other errors, still return null
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

