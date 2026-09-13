import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on app load (via cookie or localStorage token)
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
    // Always attempt to fetch user profile using cookie and/or stored token
    fetchUserProfile(storedToken);
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/auth/profile', {
        headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Token or cookie is invalid/expired
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        console.error('Login HTTP error:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('auth_token', data.data.token);
        console.log('Login successful for user:', data.data.user.email);
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login network error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Starting registration with data:', { ...userData, password: '[HIDDEN]' });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Registration HTTP error:', response.status, errorData.message);
        return { success: false, message: errorData.message || 'Registration failed' };
      }

      const data = await response.json();
      console.log('Registration successful for user:', data.data?.user?.email);

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('auth_token', data.data.token);
        return { success: true };
      } else {
        console.error('Registration failed:', data.message);
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
