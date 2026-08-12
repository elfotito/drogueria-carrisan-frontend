import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './MapaPicker.css';

// ✅ Carga el mapa solo cuando se necesita (lazy loading)
const LeafletMap = lazy(() => import('./LeafletMap'));

export default function MapaPicker({ onDireccionSelected, initialDireccion = '' }) {
  const [direccion, setDireccion] = useState(initialDireccion);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null);

  // Centro de Venezuela (aproximado)
  const defaultCenter = { lat: 8.0, lng: -66.0 };
  const defaultZoom = 6;

  useEffect(() => {
    setDireccion(initialDireccion);
  }, [initialDireccion]);

  const handleMapClick = useCallback((coords) => {
    setCoordenadas(coords);
    const direccionGenerada = `Ubicación seleccionada (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`;
    setDireccion(direccionGenerada);
  }, []);

  const handleConfirmar = useCallback(() => {
    if (direccion) {
      onDireccionSelected(direccion);
    }
    setModalAbierto(false);
  }, [direccion, onDireccionSelected]);

  const handleCancelar = useCallback(() => {
    setDireccion(initialDireccion);
    setModalAbierto(false);
    setCoordenadas(null);
  }, [initialDireccion]);

  const handleAbrirModal = useCallback(() => {
    setModalAbierto(true);
    setCoordenadas(null);
  }, []);

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
            onClick={handleAbrirModal}
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
          <Suspense fallback={
            <div className="mapa-picker__cargando">
              Cargando mapa...
            </div>
          }>
            <LeafletMap 
              coordenadas={coordenadas}
              onMapClick={handleMapClick}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
            />
          </Suspense>
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
