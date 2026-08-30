import { useNavigate } from 'react-router-dom'
import './DashboardMobile.css'

// Tiles de acceso rápido.
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

// Bloque de bienvenida: saludo + tasa + accesos rápidos.
// La vitrina (carruseles, ads, infinite scroll) vive ahora en Home.jsx;
// este componente se renderiza solo en mobile, dentro de Home.
function DashboardMobile({ user, tasa }) {
  const navigate = useNavigate()

  return (
    <div className="dashboard">
      {/* ── Topbar ── */}
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

      {/* ── Tiles de acceso rápido ── */}
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
    </div>
  )
}

export default DashboardMobile
