import { useState, useRef, useEffect } from 'react'
import './MapaPicker.css'

function MapaPicker({ onDireccionSelected, initialDireccion = '' }) {
  const [direccion, setDireccion] = useState(initialDireccion)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [sugerencias, setSugerencias] = useState([])
  const [mapCargado, setMapCargado] = useState(false)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const searchTimeout = useRef(null)

  // Cargar Leaflet desde CDN
  useEffect(() => {
    if (!modoEdicion) return

    // Verificar si Leaflet ya está cargado
    if (window.L) {
      inicializarMapa()
      return
    }

    // Cargar CSS de Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }

    // Cargar JS de Leaflet
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
      script.async = true
      script.onload = () => {
        setTimeout(inicializarMapa, 100)
      }
      script.onerror = () => {
        console.error('Error cargando Leaflet')
      }
      document.body.appendChild(script)
    }
  }, [modoEdicion])

  function inicializarMapa() {
    if (!mapContainer.current) return
    if (map.current) return

    const L = window.L
    if (!L) {
      console.error('Leaflet no disponible')
      return
    }

    try {
      // Centro: Venezuela
      map.current = L.map(mapContainer.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([6.4238, -66.5897], 6)

      // Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 4
      }).addTo(map.current)

      setMapCargado(true)

      // Click en mapa
      map.current.on('click', (e) => {
        const { lat, lng } = e.latlng
        colocarMarcador(lat, lng)
      })
    } catch (err) {
      console.error('Error inicializando mapa:', err)
    }
  }

  function colocarMarcador(lat, lng) {
    const L = window.L
    if (!map.current || !L) return

    // Remover marcador anterior
    if (marker.current) {
      map.current.removeLayer(marker.current)
    }

    // Nuevo marcador
    marker.current = L.marker([lat, lng], {
      draggable: false,
      opacity: 1
    }).addTo(map.current)

    // Centro del mapa
    map.current.setView([lat, lng], 13)

    // Obtener dirección (Nominatim)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.address) {
          const addr = data.address
          const partes = []
          if (addr.road) partes.push(addr.road)
          if (addr.house_number) partes.push(addr.house_number)
          if (addr.suburb) partes.push(addr.suburb)
          if (addr.city) partes.push(addr.city)
          if (addr.state) partes.push(addr.state)
          
          const dir = partes.filter(Boolean).join(', ')
          setDireccion(dir || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
      })
      .catch((err) => {
        console.error('Error geocoding:', err)
        setDireccion(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      })
  }

  function buscarDireccion(query) {
    if (!query || query.length < 3) {
      setSugerencias([])
      return
    }

    // Limpiar timeout anterior
    clearTimeout(searchTimeout.current)
    setBuscando(true)

    searchTimeout.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ve&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
        .then((res) => res.json())
        .then((data) => {
          setSugerencias(
            data.map((item) => ({
              display_name: item.address?.road
                ? `${item.address.road}${item.address.house_number ? ' ' + item.address.house_number : ''}, ${item.address.city || item.address.town || ''}`
                : item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }))
          )
        })
        .catch((err) => {
          console.error('Error buscando:', err)
          setSugerencias([])
        })
        .finally(() => setBuscando(false))
    }, 300)
  }

  function seleccionarSugerencia(sugerencia) {
    setDireccion(sugerencia.display_name)
    setSugerencias([])
    colocarMarcador(sugerencia.lat, sugerencia.lng)
  }

  function confirmarDireccion() {
    const trimmed = direccion.trim()
    if (trimmed.length < 5) {
      alert('Ingresa una dirección válida')
      return
    }
    onDireccionSelected(trimmed)
    setModoEdicion(false)
  }

  return (
    <div className="mapa-picker">
      {!modoEdicion ? (
        // Vista compacta
        <div className="mapa-picker__resumen">
          <div className="mapa-picker__contenido">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="mapa-picker__direccion-texto">
              {direccion || 'Sin dirección seleccionada'}
            </span>
          </div>
          <button
            type="button"
            className="mapa-picker__boton-editar"
            onClick={() => {
              setModoEdicion(true)
              setMapCargado(false)
            }}
          >
            Editar
          </button>
        </div>
      ) : (
        // Modal editor
        <div className="mapa-picker__modal" onClick={(e) => {
          if (e.target === e.currentTarget) setModoEdicion(false)
        }}>
          <div className="mapa-picker__editor">
            <div className="mapa-picker__header">
              <h3>Selecciona tu dirección</h3>
              <button
                type="button"
                className="mapa-picker__cerrar"
                onClick={() => setModoEdicion(false)}
              >
                ✕
              </button>
            </div>

            <div className="mapa-picker__busqueda">
              <div className="mapa-picker__input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Busca: calle, ciudad, estado..."
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value)
                    buscarDireccion(e.target.value)
                  }}
                  autoFocus
                />
                {buscando && <span className="mapa-picker__spinner">•••</span>}
              </div>

              {sugerencias.length > 0 && (
                <ul className="mapa-picker__sugerencias">
                  {sugerencias.map((sug, idx) => (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => seleccionarSugerencia(sug)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        </svg>
                        {sug.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mapa-picker__mapa-container">
              {!mapCargado && (
                <div className="mapa-picker__cargando">
                  Cargando mapa...
                </div>
              )}
              <div
                ref={mapContainer}
                className="mapa-picker__mapa"
                style={{
                  height: '320px',
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              />
            </div>

            <div className="mapa-picker__hint">
              💡 Haz clic en el mapa o busca tu dirección arriba
            </div>

            <div className="mapa-picker__acciones">
              <button
                type="button"
                className="mapa-picker__confirmar"
                onClick={confirmarDireccion}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="mapa-picker__cancelar"
                onClick={() => setModoEdicion(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapaPicker
