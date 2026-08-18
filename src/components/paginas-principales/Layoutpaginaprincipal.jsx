import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronRight, ChevronLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../BottomNav'
import { NAV_PAGINAS_PRINCIPALES } from './Navpaginasprincipales'
import './Layoutpaginaprincipal.css'

// ---------------------------------------------------------------
//  ---------------------------------------------------------------
function ContenidoNav({ nav, activo, titulo, esAdmin, onNavigate }) {
  // null = menú principal. Si no, es el grupo cuyo submenú está abierto.
  const [grupoAbierto, setGrupoAbierto] = useState(null)

  if (grupoAbierto) {
    const items = grupoAbierto.items.filter((item) => !esAdmin || !item.soloCliente)

    return (
      <nav className="ppal-nav" aria-label={`Submenú ${grupoAbierto.titulo}`}>
        <button type="button" className="ppal-nav__volver" onClick={() => setGrupoAbierto(null)}>
          <ChevronLeft size={17} />
          Volver al menú principal
        </button>

        <div className="ppal-nav__submenu-header">
          <span className="ppal-nav__submenu-titulo">{grupoAbierto.titulo}</span>
          {grupoAbierto.verTodoTo && (
            <Link to={grupoAbierto.verTodoTo} onClick={onNavigate} className="ppal-nav__ver-todo">
              Ver todo
            </Link>
          )}
        </div>

        {items.map((item) => {
          const esActivo = item.id === activo
          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onNavigate}
              className={`ppal-nav__sublink ${esActivo ? 'ppal-nav__sublink--activo' : ''}`}
            >
              <span>{item.texto}</span>
              <ChevronRight size={16} />
            </NavLink>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="ppal-nav" aria-label="Navegación de cuenta">
      {titulo && (
        <div className="ppal-nav__breadcrumb">
          <Link to="/" onClick={onNavigate}>Inicio</Link>
          <span className="ppal-nav__breadcrumb-sep">/</span>
          <span className="ppal-nav__breadcrumb-actual">{titulo}</span>
        </div>
      )}

      {nav.map((grupo) => {
        const items = grupo.items.filter((item) => !esAdmin || !item.soloCliente)
        if (items.length === 0) return null

        // Grupo expandible: una sola fila que abre el submenú
        if (grupo.tipo === 'submenu') {
          const grupoActivo = items.some((item) => item.id === activo)
          return (
            <button
              key={grupo.titulo}
              type="button"
              className={`ppal-nav__grupo-btn ${grupoActivo ? 'ppal-nav__grupo-btn--activo' : ''}`}
              onClick={() => setGrupoAbierto(grupo)}
            >
              <span>{grupo.titulo}</span>
              <ChevronRight size={16} />
            </button>
          )
        }

        // Grupo normal: items listados directo
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

function LayoutPaginaPrincipal({ activo, titulo, subtitulo, acciones, nav = NAV_PAGINAS_PRINCIPALES, children }) {
  const { user, logout } = useAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  // Se incrementa cada vez que el drawer se cierra, para forzar que
  // ContenidoNav se remonte y vuelva al menú principal (no se queda
  // "pegado" en un submenú la próxima vez que se abre)
  const [drawerResetKey, setDrawerResetKey] = useState(0)

  const cerrarDrawer = () => {
    setDrawerAbierto(false)
    setDrawerResetKey((k) => k + 1)
  }

  // Bloquea el scroll del fondo, permite cerrar con Escape, y marca el
  // <body> para que el Navbar global (fuera de este componente, ver
  // App.jsx) también se corra junto con la página — mismo patrón que
  // MenuDrawer.jsx, solo que acá además empujamos el navbar.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') cerrarDrawer()
    }
    if (drawerAbierto) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      document.body.classList.add('ppal-drawer-open')
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      document.body.classList.remove('ppal-drawer-open')
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
          <ContenidoNav key={drawerResetKey} nav={nav} activo={activo} titulo={titulo} esAdmin={user?.es_admin} onNavigate={cerrarDrawer} />
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
                <ContenidoNav nav={nav} activo={activo} titulo={titulo} esAdmin={user?.es_admin} />
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
