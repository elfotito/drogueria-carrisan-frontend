import { useState, useRef, useEffect } from 'react'
import './MapaPicker.css'

/**
 * MapaPicker: Permite seleccionar dirección en mapa (OpenStreetMap/Leaflet gratis)
 * Guarda solo texto de dirección, no coordenadas
 * 
 * Props:
 *   - onDireccionSelected(direccionTexto): callback cuando se selecciona dirección
 *   - initialDireccion: dirección inicial para mostrar
 */
function MapaPicker({ onDireccionSelected, initialDireccion = '' }) {
  const [direccion, setDireccion] = useState(initialDireccion)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [sugerencias, setSugerencias] = useState([])
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (!window.L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
      script.async = true
      script.onload = () => inicializarMapa()
      document.body.appendChild(script)
    } else {
      inicializarMapa()
    }
  }, [])

  function inicializarMapa() {
    if (map.current) return

    const L = window.L
    if (!mapContainer.current || !L) return

    // Centro inicial: Venezuela (aproximado)
    map.current = L.map(mapContainer.current).setView([6.4238, -66.5897], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map.current)

    map.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      colocarMarcador(lat, lng)
    })
  }

  function colocarMarcador(lat, lng) {
    const L = window.L
    if (!map.current || !L) return

    if (marker.current) {
      map.current.removeLayer(marker.current)
    }

    marker.current = L.marker([lat, lng]).addTo(map.current)
    map.current.setView([lat, lng], 13)

    // Obtener dirección desde coordenadas (Nominatim gratis)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        const addr = data.address?.road || data.address?.street || ''
        const city = data.address?.city || data.address?.town || ''
        const state = data.address?.state || ''
        const direccionGenerada = [addr, city, state].filter(Boolean).join(', ')
        setDireccion(direccionGenerada || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      })
      .catch(() => {
        setDireccion(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      })
  }

  async function buscarDireccion(query) {
    if (!query || query.length < 3) {
      setSugerencias([])
      return
    }

    setBuscando(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ve&limit=5`
      )
      const data = await res.json()
      setSugerencias(
        data.map((item) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }))
      )
    } catch (err) {
      console.error('Error buscando dirección:', err)
      setSugerencias([])
    } finally {
      setBuscando(false)
    }
  }

  function seleccionarSugerencia(sugerencia) {
    setDireccion(sugerencia.display_name)
    setSugerencias([])
    colocarMarcador(sugerencia.lat, sugerencia.lng)
  }

  function confirmarDireccion() {
    if (direccion.trim().length < 10) {
      alert('Ingresa una dirección válida')
      return
    }
    onDireccionSelected(direccion)
    setModoEdicion(false)
  }

  return (
    <div className="mapa-picker">
      {!modoEdicion ? (
        <div className="mapa-picker__resumen">
          <div className="mapa-picker__direccion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{direccion || 'Sin dirección seleccionada'}</span>
          </div>
          <button
            type="button"
            className="mapa-picker__boton-editar"
            onClick={() => setModoEdicion(true)}
          >
            Cambiar
          </button>
        </div>
      ) : (
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
            <input
              type="text"
              placeholder="Busca tu dirección (calle, ciudad, etc.)"
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value)
                buscarDireccion(e.target.value)
              }}
            />
            {buscando && <span className="mapa-picker__spinner">Buscando...</span>}
            {sugerencias.length > 0 && (
              <ul className="mapa-picker__sugerencias">
                {sugerencias.map((sug, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => seleccionarSugerencia(sug)}
                    >
                      {sug.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            ref={mapContainer}
            className="mapa-picker__mapa"
            style={{ height: '300px', width: '100%' }}
          />

          <p className="mapa-picker__hint">
            Puedes hacer clic en el mapa o buscar tu dirección arriba
          </p>

          <div className="mapa-picker__acciones">
            <button
              type="button"
              className="mapa-picker__confirmar"
              onClick={confirmarDireccion}
            >
              Confirmar dirección
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
      )}
    </div>
  )
}

export default MapaPicker
