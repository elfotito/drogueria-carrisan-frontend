import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar la app (o si el token cambia), reconstruimos el estado del usuario
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token); 
        const yaVencio = decoded.exp * 1000 < Date.now();

        if (yaVencio) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              setUser(decoded); // Si falla, usar el decoded
            }
          } else {
            setUser(decoded);
          }
        }
      } catch (err) {
        // token corrupto o malformado -> lo tiramos
        console.error('Token inválido:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false); // ya terminamos de chequear, la app puede renderizar
  }, [token]);

    async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    
    // MODIFICADO: Guardar usuario completo en localStorage
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setToken(data.token);
    // También setear el user directamente para tener acceso inmediato
    setUser(data.user);
    
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

// Hook custom para no tener que importar useContext + AuthContext en cada página
export function useAuth() {
  return useContext(AuthContext);
}