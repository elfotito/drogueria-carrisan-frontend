// frontend/src/hooks/useEnvio.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const useEnvio = () => {
  const { user } = useAuth();
  const [tipoEnvio, setTipoEnvio] = useState('retiro');
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);

  // Calcular costo del delivery según el usuario
  const getCostoDelivery = useCallback(() => {
    if (!user) return 8.00;
    return user.delivery_gratis ? 0 : 8.00;
  }, [user]);

  // Opciones de envío
  const opcionesEnvio = [
    {
      id: 'retiro',
      label: 'Retiro en Depósito',
      descripcion: 'Pasa a recoger tu pedido cuando esté listo',
      icono: '🏪',
      costo: 0,
      textoCosto: 'Gratis',
      requiereDireccion: false,
      requiereAgencia: false
    },
    {
      id: 'delivery',
      label: 'Delivery en Moto',
      descripcion: 'Entrega en tu dirección dentro de la ciudad',
      icono: '🛵',
      costo: getCostoDelivery(),
      textoCosto: getCostoDelivery() === 0 ? '¡Gratis para ti!' : '$8.00',
      requiereDireccion: true,
      requiereAgencia: false,
      tipoDireccion: 'delivery'
    },
    {
      id: 'envio_nacional',
      label: 'Envío Nacional',
      descripcion: 'Envío por agencia, pagas al recibir en destino',
      icono: '📦',
      costo: 0,
      textoCosto: 'Pago en destino',
      requiereDireccion: true,
      requiereAgencia: true,
      tipoDireccion: 'envio_nacional'
    }
  ];

  const opcionActual = opcionesEnvio.find(op => op.id === tipoEnvio);

  // Cargar direcciones según tipo seleccionado
  const cargarDirecciones = useCallback(async (tipo) => {
    if (!tipo || tipo === 'retiro') {
      setDirecciones([]);
      setDireccionSeleccionada(null);
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.get(`/direcciones?tipo=${tipo}`);
      setDirecciones(data);
      
      // Si hay una sola dirección, seleccionarla automáticamente
      if (data.length === 1) {
        setDireccionSeleccionada(data[0]);
      } else {
        // 🆕 Seleccionar la primera si hay varias
        setDireccionSeleccionada(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error('Error cargando direcciones:', error);
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar tipo de envío
  const cambiarTipoEnvio = useCallback((tipo) => {
    setTipoEnvio(tipo);
    setDireccionSeleccionada(null);
    setAgenciaSeleccionada('');
    
    const opcion = opcionesEnvio.find(op => op.id === tipo);
    if (opcion?.tipoDireccion) {
      cargarDirecciones(opcion.tipoDireccion);
    }
  }, [opcionesEnvio, cargarDirecciones]);

  // 🆕 Guardar nueva dirección - AHORA INCLUYE tipo_direccion
  const guardarDireccion = async (direccionData) => {
    try {
      const opcion = opcionesEnvio.find(op => op.id === tipoEnvio);
      
      // Agregar el tipo_direccion según la opción actual
      const dataConTipo = {
        ...direccionData,
        tipo_direccion: opcion?.tipoDireccion || 'delivery'
      };
      
      const { data } = await api.post('/direcciones', dataConTipo);
      
      // Recargar direcciones del tipo actual
      if (opcion?.tipoDireccion) {
        await cargarDirecciones(opcion.tipoDireccion);
      }
      
      setDireccionSeleccionada(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Eliminar dirección
  const eliminarDireccion = async (id) => {
    try {
      await api.delete(`/direcciones/${id}`);
      if (direccionSeleccionada?.id === id) {
        setDireccionSeleccionada(null);
      }
      const opcion = opcionesEnvio.find(op => op.id === tipoEnvio);
      if (opcion?.tipoDireccion) {
        await cargarDirecciones(opcion.tipoDireccion);
      }
    } catch (error) {
      throw error;
    }
  };

  // Agencias disponibles para envío nacional
  const agencias = ['MRW', 'Domesa', 'Tealca', 'Zoom', 'Servientrega'];

  return {
    tipoEnvio,
    cambiarTipoEnvio,
    opcionesEnvio,
    opcionActual,
    direcciones,
    direccionSeleccionada,
    setDireccionSeleccionada,
    agenciaSeleccionada,
    setAgenciaSeleccionada,
    agencias,
    loading,
    cargarDirecciones,
    guardarDireccion,
    eliminarDireccion,
    costoEnvio: opcionActual?.costo || 0
  };
};