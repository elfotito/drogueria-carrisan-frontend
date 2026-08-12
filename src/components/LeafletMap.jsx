import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución al bug del icono de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ LÍMITES DE VENEZUELA (aproximados)
const VENEZUELA_BOUNDS = {
  north: 12.2,   // Península de Paraguaná
  south: 0.6,    // Frontera con Brasil/Colombia
  west: -73.4,   // Frontera con Colombia
  east: -59.8    // Delta del Orinoco
};

// Componente para manejar el clic en el mapa
function LocationMarker({ position, onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      
      // ✅ Verificar que el clic esté dentro de Venezuela
      if (lat >= VENEZUELA_BOUNDS.south && 
          lat <= VENEZUELA_BOUNDS.north && 
          lng >= VENEZUELA_BOUNDS.west && 
          lng <= VENEZUELA_BOUNDS.east) {
        if (onMapClick) {
          onMapClick({ lat, lng });
        }
      }
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function LeafletMap({ coordenadas, onMapClick, defaultCenter, defaultZoom }) {
  // ✅ Crear los bounds para bloquear el desplazamiento fuera de Venezuela
  const bounds = L.latLngBounds(
    [VENEZUELA_BOUNDS.south, VENEZUELA_BOUNDS.west],
    [VENEZUELA_BOUNDS.north, VENEZUELA_BOUNDS.east]
  );

  return (
    <MapContainer 
      center={[defaultCenter.lat, defaultCenter.lng]} 
      zoom={defaultZoom}
      minZoom={5}
      maxZoom={18}
      // ✅ BLOQUEAR DESPLAZAMIENTO FUERA DE VENEZUELA
      maxBounds={bounds}
      maxBoundsViscosity={0.9}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={coordenadas} onMapClick={onMapClick} />
    </MapContainer>
  );
}