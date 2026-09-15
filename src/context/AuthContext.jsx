import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safeStorage';

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
  const [token, setToken] = useState(() => safeGetItem('token'));
  const [user, setUser] = useState(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) return null;
      const savedUser = safeGetItem('user');
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

    safeSetItem('token', data.token);
    safeSetItem('user', JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    setTokenExpirado(false);

    return data.user;
  }

  function logout() {
    safeRemoveItem('token');
    safeRemoveItem('user');
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