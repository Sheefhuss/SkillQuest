import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authApi.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    await authApi.delete('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);