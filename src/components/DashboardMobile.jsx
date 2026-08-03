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

  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasa(res.data.usd_a_ves))
      .catch((err) => console.error(err))
  }, [])

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