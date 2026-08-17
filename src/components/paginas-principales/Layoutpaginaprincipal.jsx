import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../BottomNav'
import { NAV_PAGINAS_PRINCIPALES } from './navPaginasPrincipales'
import './LayoutPaginaPrincipal.css'


// ---------------------------------------------------------------
function ContenidoNav({ activo, esAdmin, onNavigate }) {
  return (
    <nav className="ppal-nav" aria-label="Navegación de cuenta">
      {NAV_PAGINAS_PRINCIPALES.map((grupo) => {
        const items = grupo.items.filter((item) => !esAdmin || !item.soloCliente)
        if (items.length === 0) return null

        return (
          <div className="ppal-nav__grupo" key={grupo.titulo}>
            <span className="ppal-nav__grupo-titulo">{grupo.titulo}</span>
            {items.map((item) => {
              const Icono = item.icono
              const esActivo = item.id === activo
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  onClick={onNavigate}
                  className={`ppal-nav__link ${esActivo ? 'ppal-nav__link--activo' : ''}`}
                >
                  <Icono size={18} strokeWidth={esActivo ? 2.4 : 2} />
                  <span>{item.texto}</span>
                  {esActivo && <ChevronRight size={16} className="ppal-nav__chevron" />}
                </NavLink>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

function LayoutPaginaPrincipal({ activo, titulo, subtitulo, acciones, children }) {
  const { user, logout } = useAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)

  const cerrarDrawer = () => setDrawerAbierto(false)

  // Bloquea el scroll del fondo y permite cerrar con Escape mientras
  // el drawer móvil está abierto — mismo patrón que MenuDrawer.jsx
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') cerrarDrawer()
    }
    if (drawerAbierto) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerAbierto])

  const iniciales = (user?.nombre || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="ppal-root">
      {/* Panel del drawer (solo se ve en móvil, ver CSS) */}
      <aside className={`ppal-drawer-panel ${drawerAbierto ? 'ppal-drawer-panel--abierto' : ''}`}>
        <div className="ppal-drawer-panel__header">
          <div className="ppal-drawer-panel__quien">
            <span className="ppal-drawer-panel__avatar">{iniciales}</span>
            <div className="ppal-drawer-panel__textos">
              <p className="ppal-drawer-panel__nombre">{user?.nombre || 'Mi cuenta'}</p>
              <p className="ppal-drawer-panel__email">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="ppal-drawer-panel__cerrar"
            onClick={cerrarDrawer}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ppal-drawer-panel__scroll">
          <ContenidoNav activo={activo} esAdmin={user?.es_admin} onNavigate={cerrarDrawer} />
        </div>

        {!user?.es_admin && (
          <button type="button" className="ppal-drawer-panel__logout" onClick={logout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        )}
      </aside>

      {/* Todo lo demás (topbar móvil + layout de 2 columnas) se "empuja"
          hacia la derecha cuando el drawer está abierto */}
      <div className={`ppal-shift ${drawerAbierto ? 'ppal-shift--empujado' : ''}`}>
        {drawerAbierto && (
          <div className="ppal-shift__catcher" onClick={cerrarDrawer} aria-hidden="true" />
        )}

        {/* Barra superior — solo visible en móvil/tablet */}
        <header className="ppal-topbar">
          <button
            type="button"
            className="ppal-topbar__menu-btn"
            onClick={() => setDrawerAbierto(true)}
            aria-label="Abrir menú de cuenta"
          >
            <Menu size={22} />
          </button>
          <p className="ppal-topbar__titulo">{titulo}</p>
        </header>

        <div className="ppal-container">
          <div className="ppal-body">
            {/* Columna izquierda — solo visible en desktop/tablet */}
            <aside className="ppal-sidebar">
              <div className="ppal-sidebar__sticky">
                <div className="ppal-sidebar__header">
                  <div className="ppal-sidebar__avatar">{iniciales}</div>
                  <div className="ppal-sidebar__header-texto">
                    <p className="ppal-sidebar__nombre">{user?.nombre || 'Mi cuenta'}</p>
                    <p className="ppal-sidebar__email">{user?.email}</p>
                  </div>
                </div>
                <ContenidoNav activo={activo} esAdmin={user?.es_admin} />
              </div>
            </aside>

            {/* Columna derecha — contenido de la página */}
            <main className="ppal-main">
              <div className="ppal-main__header">
                <div>
                  <h1 className="ppal-main__titulo">{titulo}</h1>
                  {subtitulo && <p className="ppal-main__subtitulo">{subtitulo}</p>}
                </div>
                {acciones && <div className="ppal-main__acciones">{acciones}</div>}
              </div>

              {children}
            </main>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

export default LayoutPaginaPrincipal