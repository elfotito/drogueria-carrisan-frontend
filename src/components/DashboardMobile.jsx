import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import BottomNav from './BottomNav'
import './DashboardMobile.css'

// Tiles de acceso rápido. Centralizados acá para agregar/quitar fácil.
const ACCESOS = [
  {
    to: '/catalogo',
    emoji: '💊',
    titulo: 'Catálogo',
    subtitulo: 'Ver todos los productos',
  },
  {
    to: '/carrito',
    emoji: '🛒',
    titulo: 'Carrito',
    subtitulo: 'Revisa tu pedido actual',
  },
  {
    to: '/orders',
    emoji: '📦',
    titulo: 'Mis pedidos',
    subtitulo: 'Estado y seguimiento',
  },
  {
    to: '/catalogo',
    emoji: '🏷️',
    titulo: 'Ofertas',
    subtitulo: 'Precios destacados',
  },
]

function DashboardMobile({ user }) {
  const navigate = useNavigate()
  const [tasa, setTasa] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasa(res.data.usd_a_ves))
      .catch((err) => console.error(err))
  }, [])

  function handleBuscar(e) {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(busqueda.trim())}`)
    } else {
      navigate('/catalogo')
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard__topbar">
        <div className="dashboard__saludo">
          <span className="dashboard__avatar" aria-hidden="true">
            {user.email?.[0]?.toUpperCase() || '?'}
          </span>
          <div>
            <p className="dashboard__hola">Hola,</p>
            <p className="dashboard__email">{user.email}</p>
          </div>
        </div>

        <div className="dashboard__tasa">
          <span className="dashboard__tasa-label">Tasa</span>
          <span className="dashboard__tasa-valor">
            {tasa ? `Bs. ${tasa.toFixed(2)}` : '—'}
          </span>
        </div>
      </header>

      <form className="dashboard__buscador" onSubmit={handleBuscar}>
        <span className="dot dot--indigo" aria-hidden="true" />
        <input
          type="text"
          placeholder="¿Qué producto necesitas?"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="submit" aria-label="Buscar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      <section className="dashboard__accesos">
        <h2>¿Qué necesitas hoy?</h2>
        <div className="dashboard__grid">
          {ACCESOS.map((acceso) => (
            <button
              key={acceso.titulo}
              className="dashboard__tile"
              onClick={() => navigate(acceso.to)}
            >
              <span className="dashboard__tile-emoji" aria-hidden="true">
                {acceso.emoji}
              </span>
              <span className="dashboard__tile-titulo">{acceso.titulo}</span>
              <span className="dashboard__tile-subtitulo">{acceso.subtitulo}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Espaciador para que el contenido no quede tapado por el bottom nav fijo */}
      <div className="dashboard__espaciador" aria-hidden="true" />

      <BottomNav />
    </div>
  )
}

export default DashboardMobile