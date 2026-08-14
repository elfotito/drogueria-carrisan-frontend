import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const yaVencio = decoded.exp * 1000 < Date.now();

        if (yaVencio) {
          localStorage.removeItem('token');
          localStorage.removeItem('user'); // También limpiar user
          setToken(null);
          setUser(null);
        } else {
          // Intentar obtener el usuario completo del localStorage
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
        }
      } catch (err) {
        console.error('Token inválido:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    
    console.log('Respuesta del login:', data); // Para debug
    
    localStorage.setItem('token', data.token);
    
    // Guardar el usuario COMPLETO (incluye nombre)
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user); // Setear directamente el usuario completo
    
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  const value = { user, token, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}