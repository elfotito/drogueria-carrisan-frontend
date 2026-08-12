import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Importa el control de búsqueda y el proveedor de OpenStreetMap
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css'; // Estilos para el buscador

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

// Límites de Venezuela (aproximados)
const VENEZUELA_BOUNDS = {
  north: 12.2,
  south: 0.6,
  west: -73.4,
  east: -59.8
};

// Componente para manejar el clic en el mapa
function LocationMarker({ position, onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 14);
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
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

// ✅ NUEVO: Componente para añadir el control de búsqueda
function SearchControl() {
  const map = useMap();

  useEffect(() => {
    // Configura el proveedor de búsqueda (OpenStreetMap Nominatim)
    const provider = new OpenStreetMapProvider();

    // Crea el control de búsqueda
    const searchControl = new GeoSearchControl({
      provider: provider,
      // Opciones para personalizar el comportamiento
      showMarker: true, // Muestra un marcador en el resultado
      showPopup: true, // Muestra un popup con la dirección
      marker: {
        icon: new L.Icon.Default(), // Usa el icono por defecto de Leaflet
        draggable: false,
      },
      popupFormat: ({ result }) => result.label, // Muestra la dirección en el popup
      maxMarkers: 1, // Solo permite un resultado a la vez
      retainZoomLevel: false, // Ajusta el zoom al resultado
      animateZoom: true, // Animación suave al moverse al resultado
      autoClose: false,
      searchLabel: 'Buscar urbanización o dirección...', // Texto en el campo de búsqueda
      keepResult: true,
      providerOptions: {
        // Opcional: Limita la búsqueda a Venezuela para resultados más relevantes
        params: {
          countrycodes: 've',
        },
      },
    });

    map.addControl(searchControl);

    // Limpia el control al desmontar el componente
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ coordenadas, onMapClick }) {
  // ✅ Centro en Valencia, Carabobo
  const center = { lat: 10.1620, lng: -68.0077 };
  const zoom = 13;

  const bounds = L.latLngBounds(
    [VENEZUELA_BOUNDS.south, VENEZUELA_BOUNDS.west],
    [VENEZUELA_BOUNDS.north, VENEZUELA_BOUNDS.east]
  );

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom}
      minZoom={5}
      maxZoom={18}
      maxBounds={bounds}
      maxBoundsViscosity={0.9}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={coordenadas} onMapClick={onMapClick} />
      
      {/* ✅ AÑADE EL BUSCADOR AQUÍ */}
      <SearchControl />
    </MapContainer>
  );
}
