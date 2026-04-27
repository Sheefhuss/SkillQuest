import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const cached = sessionStorage.getItem('sq_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } catch {}
    }

    authApi.get('/auth/me')
      .then(res => {
        setUser(res.data);
        setIsAuthenticated(true);
        sessionStorage.setItem('sq_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('sq_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    sessionStorage.setItem('sq_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authApi.post('/auth/register', { username, email, password });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await authApi.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    const res = await authApi.post('/auth/reset-password', { token, password, confirmPassword });
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await authApi.post('/auth/resend-verification', { email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('sq_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const deleteAccount = async () => {
    await authApi.delete('/auth/me');
    logout();
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.get('/auth/me');
      setUser(res.data);
      sessionStorage.setItem('sq_user', JSON.stringify(res.data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, deleteAccount, refreshUser, forgotPassword, resetPassword, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
