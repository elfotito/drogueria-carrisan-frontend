import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const expiraEn = decoded.exp * 1000;
    return expiraEn > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) return null;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { return JSON.parse(savedUser); } catch { return decoded; }
      }
      return decoded;
    } catch {
      return null;
    }
  });
  const [tokenExpirado, setTokenExpirado] = useState(() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  });
  const [loading] = useState(false);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    setTokenExpirado(false);

    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setTokenExpirado(false);
  }

  async function refreshTokenIfNeeded() {
    if (token && !isTokenValid(token)) {
      setTokenExpirado(true);
      logout();
    }
  }

  const value = { user, token, login, logout, refreshTokenIfNeeded, loading, tokenExpirado };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}