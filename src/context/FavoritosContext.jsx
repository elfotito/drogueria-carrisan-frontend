// src/context/FavoritosContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritosContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Cargar favoritos cuando el usuario inicia sesión
  const cargarFavoritos = useCallback(async () => {
    if (!user || !token) {
      setFavoritos([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/favoritos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavoritos(data.favoritos || []);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Cargar al iniciar sesión o cambiar usuario
  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  // Verificar si un producto es favorito
  const esFavorito = (productoId) => {
    return favoritos.some(fav => fav.id === productoId);
  };

  // Toggle: agregar o quitar favorito
  const toggleFavorito = async (producto) => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_URL}/favoritos/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ producto_id: producto.id })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.accion === 'eliminado') {
          // Quitar de favoritos localmente
          setFavoritos(prev => prev.filter(fav => fav.id !== producto.id));
        } else {
          // Agregar a favoritos localmente con la info del producto
          setFavoritos(prev => [...prev, {
            ...producto,
            favorito_id: data.favorito?.id,
            favorito_creado: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error('Error al toggle favorito:', error);
    }
  };

  const value = {
    favoritos,
    loading,
    esFavorito,
    toggleFavorito,
    recargarFavoritos: cargarFavoritos
  };

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de un FavoritosProvider');
  }
  return context;
}