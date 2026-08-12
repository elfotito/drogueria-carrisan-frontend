import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const VENEZUELA_BOUNDS = {
  north: 12.2,
  south: 0.6,
  west: -73.4,
  east: -59.8
};

// ✅ Versión alternativa SIN useMapEvents
function LocationMarker({ position, onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 14);
    }
  }, [position, map]);

  // ✅ Manejador de clics con event listener nativo
  useEffect(() => {
    function handleClick(e) {
      const { lat, lng } = e.latlng;
      if (lat >= VENEZUELA_BOUNDS.south && 
          lat <= VENEZUELA_BOUNDS.north && 
          lng >= VENEZUELA_BOUNDS.west && 
          lng <= VENEZUELA_BOUNDS.east) {
        if (onMapClick) {
          onMapClick({ lat, lng });
        }
      }
    }

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

function SearchControl() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      showMarker: true,
      showPopup: true,
      marker: {
        icon: new L.Icon.Default(),
        draggable: false,
      },
      popupFormat: ({ result }) => result.label,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: false,
      searchLabel: 'Buscar urbanización o dirección...',
      keepResult: true,
      providerOptions: {
        params: {
          countrycodes: 've',
        },
      },
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ coordenadas, onMapClick }) {
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
      <SearchControl />
    </MapContainer>
  );
}