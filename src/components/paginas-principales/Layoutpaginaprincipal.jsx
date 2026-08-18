import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronRight, ChevronLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../BottomNav'
import { NAV_PAGINAS_PRINCIPALES } from './Navpaginasprincipales'
import './Layoutpaginaprincipal.css'

// ---------------------------------------------------------------
----------------
// Un solo link/botón de nav, reusado en el menú principal y en los
// submenús. Si el item trae "accion" (en vez de "to") se renderiza
// como botón y dispara onAccion — para casos como "Crear lista nueva"
// que no navegan a ningún lado, solo abren algo en la página actual.
function ItemNav({ item, activo, onNavigate, onAccion, variante }) {
  const esActivo = item.id === activo
  const Icono = item.icono
  const esSublink = variante === 'sublink'
  const clase = esSublink ? 'ppal-nav__sublink' : 'ppal-nav__link'
  const claseActivo = esSublink ? 'ppal-nav__sublink--activo' : 'ppal-nav__link--activo'

  const contenido = (
    <>
      {Icono && !esSublink && <Icono size={18} strokeWidth={esActivo ? 2.4 : 2} />}
      <span>{item.texto}</span>
      {esSublink ? <ChevronRight size={16} /> : esActivo && <ChevronRight size={16} className="ppal-nav__chevron" />}
    </>
  )

  if (item.accion) {
    return (
      <button
        type="button"
        className={`${clase} ${esActivo ? claseActivo : ''}`}
        onClick={() => {
          onAccion?.(item.accion)
          onNavigate?.()
        }}
      >
        {contenido}
      </button>
    )
  }

  return (
    <NavLink to={item.to} onClick={onNavigate} className={`${clase} ${esActivo ? claseActivo : ''}`}>
      {contenido}
    </NavLink>
  )
}

function ContenidoNav({ nav, activo, titulo, esAdmin, onNavigate, onAccion }) {
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

        {items.map((item) => (
          <ItemNav key={item.id} item={item} activo={activo} onNavigate={onNavigate} onAccion={onAccion} variante="sublink" />
        ))}
      </nav>
    )
  }

  const gruposPrincipales = nav.filter((g) => !g.pie)
  const gruposPie = nav.filter((g) => g.pie)

  function renderGrupo(grupo) {
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
      <div className={`ppal-nav__grupo ${grupo.pie ? 'ppal-nav__grupo--pie' : ''}`} key={grupo.titulo}>
        <span className="ppal-nav__grupo-titulo">{grupo.titulo}</span>
        {items.map((item) => (
          <ItemNav key={item.id} item={item} activo={activo} onNavigate={onNavigate} onAccion={onAccion} />
        ))}
      </div>
    )
  }

  return (
    <nav className="ppal-nav" aria-label="Navegación">
      {titulo && (
        <div className="ppal-nav__breadcrumb">
          <Link to="/" onClick={onNavigate}>Inicio</Link>
          <span className="ppal-nav__breadcrumb-sep">/</span>
          <span className="ppal-nav__breadcrumb-actual">{titulo}</span>
        </div>
      )}

      {gruposPrincipales.map(renderGrupo)}
      {gruposPie.map(renderGrupo)}
    </nav>
  )
}

function LayoutPaginaPrincipal({ activo, titulo, subtitulo, acciones, nav = NAV_PAGINAS_PRINCIPALES, onAccion, children }) {
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
          <ContenidoNav key={drawerResetKey} nav={nav} activo={activo} titulo={titulo} esAdmin={user?.es_admin} onNavigate={cerrarDrawer} onAccion={onAccion} />
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
                <ContenidoNav nav={nav} activo={activo} titulo={titulo} esAdmin={user?.es_admin} onAccion={onAccion} />
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
