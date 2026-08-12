import React, { useState, useEffect } from 'react';
import { Map } from 'react-map-free';
import './MapaPicker.css';

export default function MapaPicker({ onDireccionSelected, initialDireccion = '' }) {
  const [direccion, setDireccion] = useState(initialDireccion);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [coordenadas, setCoordenadas] = useState(null);

  // Centrado por defecto en Valencia, Carabobo
  const defaultCenter = { lat: 10.1620, lng: -68.0077 };

  // Actualizar dirección cuando cambia initialDireccion
  useEffect(() => {
    setDireccion(initialDireccion);
  }, [initialDireccion]);

  const handleMapClick = (coords) => {
    setCoordenadas(coords);
    // Aquí deberías hacer una geocodificación inversa para obtener la dirección
    // Por simplicidad, usamos una dirección genérica
    const direccionGenerada = `Ubicación seleccionada (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`;
    setDireccion(direccionGenerada);
    setUbicacionSeleccionada(coords);
  };

  const handleConfirmar = () => {
    if (direccion) {
      onDireccionSelected(direccion);
    }
    setModalAbierto(false);
  };

  const handleCancelar = () => {
    setDireccion(initialDireccion);
    setModalAbierto(false);
  };

  // Vista en modo resumen
  if (!modalAbierto) {
    return (
      <div className="mapa-picker">
        <div className="mapa-picker__resumen">
          <div className="mapa-picker__contenido">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="3" />
            </svg>
            <span className="mapa-picker__direccion-texto">
              {direccion || 'Seleccionar ubicación en el mapa'}
            </span>
          </div>
          <button
            type="button"
            className="mapa-picker__boton-editar"
            onClick={() => setModalAbierto(true)}
          >
            {direccion ? 'Editar' : 'Seleccionar'}
          </button>
        </div>
      </div>
    );
  }

  // Vista modal con el mapa
  return (
    <div className="mapa-picker__modal" onClick={handleCancelar}>
      <div className="mapa-picker__editor" onClick={(e) => e.stopPropagation()}>
        <div className="mapa-picker__header">
          <h3>Selecciona tu ubicación</h3>
          <button type="button" className="mapa-picker__cerrar" onClick={handleCancelar}>
            ✕
          </button>
        </div>

        <div className="mapa-picker__mapa-container">
          <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <Map
              initialCenter={defaultCenter}
              initialZoom={13}
              markers={coordenadas ? [{ lat: coordenadas.lat, lng: coordenadas.lng }] : []}
              onMapClick={(e) => {
                // react-map-free pasa el evento con lat/lng
                handleMapClick(e);
              }}
              className="mapa-picker__mapa"
              width="100%"
              height="100%"
            />
          </div>
        </div>

        <div className="mapa-picker__hint">
          Toca en el mapa para seleccionar tu ubicación de entrega
        </div>

        <div className="mapa-picker__direccion-preview">
          <label>Dirección seleccionada:</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Escribe la dirección manualmente"
            className="mapa-picker__input-direccion"
          />
        </div>

        <div className="mapa-picker__acciones">
          <button type="button" className="mapa-picker__cancelar" onClick={handleCancelar}>
            Cancelar
          </button>
          <button type="button" className="mapa-picker__confirmar" onClick={handleConfirmar}>
            Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
