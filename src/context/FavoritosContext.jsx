// src/context/FavoritosContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const FavoritosContext = createContext();

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
      const { data } = await api.get('/favoritos');
      setFavoritos(data.favoritos || []);
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
      const { data } = await api.post('/favoritos/toggle', {
        producto_id: producto.id
      });
      
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