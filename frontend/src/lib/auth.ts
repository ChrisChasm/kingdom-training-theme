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
  capabilities?: string[];
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
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
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

