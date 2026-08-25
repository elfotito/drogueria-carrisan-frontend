import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const expiraEn = decoded.exp * 1000;
    return expiraEn > Date.now();
  } catch (e) {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpirado, setTokenExpirado] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const yaVencio = decoded.exp * 1000 < Date.now();

        if (yaVencio) {
          setTokenExpirado(true);
        } else {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (e) {
              console.error('Error parsing user:', e);
              setUser(decoded);
            }
          } else {
            setUser(decoded);
          }
          setTokenExpirado(false);
        }
      } catch (err) {
        console.error('Token inválido:', err);
        setTokenExpirado(true);
      }
    }
    setLoading(false);
  }, [token]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });

    console.log('Respuesta del login:', data);

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
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/')) {
        window.location.href = '/login?expirado=1';
      }
    }
  }

  useEffect(() => {
    refreshTokenIfNeeded();
  }, [token]);

  const value = { user, token, login, logout, refreshTokenIfNeeded, loading, tokenExpirado };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}