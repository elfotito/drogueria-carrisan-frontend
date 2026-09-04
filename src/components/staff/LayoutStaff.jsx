import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronRight, LogOut } from 'lucide-react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import { NAV_STAFF } from './NavStaff'
import './LayoutStaff.css'

// ---------------------------------------------------------------
// <LayoutStaff activo="almacen" titulo="Preparación de pedidos">
//   {contenido del módulo}
// </LayoutStaff>
//
// Layout base de los módulos de trabajo /staff/*. La sesión es de
// staff (useStaffAuth), NO de cliente — por eso no se reutiliza
// LayoutPaginaPrincipal (que depende de useAuth).
//
// Desktop/tablet (≥1024px): sidebar izquierda fija y sticky con la
// navegación del rol. Móvil (<1024px): drawer que se abre con el botón
// de menú y empuja el contenido con una transición corta.
//
// El menú (NAV_STAFF) filtra sus items por staff.rol.
// ---------------------------------------------------------------
function ItemNav({ item, activo, onNavigate }) {
  const esActivo = item.id === activo
  const Icono = item.icono

  return (
    <NavLink to={item.to} onClick={onNavigate} className={`lstaff-nav__link ${esActivo ? 'lstaff-nav__link--activo' : ''}`}>
      {Icono && <Icono size={18} strokeWidth={esActivo ? 2.4 : 2} />}
      <span>{item.texto}</span>
      {esActivo && <ChevronRight size={16} className="lstaff-nav__chevron" />}
    </NavLink>
  )
}

function ContenidoNav({ nav, activo, rol, onNavigate }) {
  return (
    <nav className="lstaff-nav" aria-label="Navegación de staff">
      {nav.map((grupo) => {
        const items = grupo.items.filter((item) => item.roles.includes(rol))
        if (items.length === 0) return null
        return (
          <div className="lstaff-nav__grupo" key={grupo.titulo}>
            <span className="lstaff-nav__grupo-titulo">{grupo.titulo}</span>
            {items.map((item) => (
              <ItemNav key={item.id} item={item} activo={activo} onNavigate={onNavigate} />
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function LayoutStaff({ activo, titulo, children }) {
  const { staff, logoutStaff } = useStaffAuth()
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const rol = staff?.rol

  const cerrarDrawer = () => setDrawerAbierto(false)

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

  const iniciales = (staff?.nombre || staff?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="lstaff-root">
      <aside className={`lstaff-drawer-panel ${drawerAbierto ? 'lstaff-drawer-panel--abierto' : ''}`}>
        <div className="lstaff-drawer-panel__header">
          <div className="lstaff-drawer-panel__quien">
            <span className="lstaff-drawer-panel__avatar">{iniciales}</span>
            <div className="lstaff-drawer-panel__textos">
              <p className="lstaff-drawer-panel__nombre">{staff?.nombre || 'Staff'}</p>
              <p className="lstaff-drawer-panel__rol">{rol}</p>
            </div>
          </div>
          <button type="button" className="lstaff-drawer-panel__cerrar" onClick={cerrarDrawer} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>
        <div className="lstaff-drawer-panel__scroll">
          <ContenidoNav nav={NAV_STAFF} activo={activo} rol={rol} onNavigate={cerrarDrawer} />
        </div>
        <div className="lstaff-drawer-panel__pie">
          <button type="button" className="lstaff-drawer-panel__logout" onClick={logoutStaff}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className={`lstaff-shift ${drawerAbierto ? 'lstaff-shift--empujado' : ''}`}>
        {drawerAbierto && <div className="lstaff-shift__catcher" onClick={cerrarDrawer} aria-hidden="true" />}

        <header className="lstaff-topbar">
          <button type="button" className="lstaff-topbar__menu-btn" onClick={() => setDrawerAbierto(true)} aria-label="Abrir menú de staff">
            <Menu size={22} />
          </button>
          <p className="lstaff-topbar__titulo">{titulo}</p>
        </header>

        <div className="lstaff-container">
          <div className="lstaff-body">
            <aside className="lstaff-sidebar">
              <div className="lstaff-sidebar__sticky">
                <div className="lstaff-sidebar__header">
                  <div className="lstaff-sidebar__avatar">{iniciales}</div>
                  <div className="lstaff-sidebar__header-texto">
                    <p className="lstaff-sidebar__nombre">{staff?.nombre || 'Staff'}</p>
                    <p className="lstaff-sidebar__rol">{rol}</p>
                  </div>
                </div>

                <Link to="/staff/dashboard" className="lstaff-sidebar__volver">
                  Volver al dashboard
                </Link>

                <ContenidoNav nav={NAV_STAFF} activo={activo} rol={rol} onNavigate={cerrarDrawer} />
              </div>
            </aside>

            <main className="lstaff-main">
              <div className="lstaff-main__header">
                <div>
                  <h1 className="lstaff-main__titulo">{titulo}</h1>
                </div>
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutStaff
