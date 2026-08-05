
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const useEnvio = () => {
  const { user } = useAuth();
  const [tipoEnvio, setTipoEnvio] = useState('retiro');
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);

  // Opciones de envío con lógica de negocio
  const opcionesEnvio = [
    {
      id: 'retiro',
      titulo: 'Retiro en Depósito',
      descripcion: 'Pasa a recoger tu pedido cuando quieras',
      icono: '🏪',
      costo: 0,
      textoCosto: 'Gratis',
      requiereDireccion: false
    },
    {
      id: 'delivery',
      titulo: 'Delivery en Moto',
      descripcion: 'Entrega en tu dirección dentro de la ciudad',
      icono: '🛵',
      costo: user?.delivery_gratis ? 0 : 8.00,
      textoCosto: user?.delivery_gratis ? '¡Gratis para ti!' : '$8.00',
      requiereDireccion: true,
      tipoDireccion: 'delivery'
    },
    {
      id: 'envio_nacional',
      titulo: 'Envío Nacional',
      descripcion: 'Envío por agencia, pagas al recibir',
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
  const cargarDirecciones = async (tipo) => {
    if (!tipo || tipo === 'retiro') return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/api/direcciones?tipo=${tipo}`);
      setDirecciones(data);
      
      // Si hay una sola dirección, seleccionarla automáticamente
      if (data.length === 1) {
        setDireccionSeleccionada(data[0]);
      }
    } catch (error) {
      console.error('Error cargando direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar tipo de envío
  const cambiarTipoEnvio = (tipo) => {
    setTipoEnvio(tipo);
    setDireccionSeleccionada(null);
    setAgenciaSeleccionada('');
    
    const opcion = opcionesEnvio.find(op => op.id === tipo);
    if (opcion?.tipoDireccion) {
      cargarDirecciones(opcion.tipoDireccion);
    }
  };

  // Cargar direcciones iniciales si el usuario tiene preferencia
  useEffect(() => {
    if (user?.tipo_envio_preferido) {
      cambiarTipoEnvio(user.tipo_envio_preferido);
    }
  }, [user]);

  // Agencias disponibles
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
    costoDelivery: opcionActual?.costo || 0
  };
};
