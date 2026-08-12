import { NavLink } from 'react-router-dom'
import './BottomNav.css'

// Íconos simples en SVG inline — evita depender de una librería de íconos
// y permite controlar el color activo vía CSS (currentColor)
const ICONOS = {
  inicio: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  items: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  ),
  pedidos: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  ),
  cuenta: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  // ícono del FAB central — grilla, representa "todo el menú"
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
}

// Items normales (izquierda y derecha del FAB central)
const ITEMS_IZQUIERDA = [
  { to: '/', label: 'Inicio', icono: 'inicio', end: true },
  { to: '/mis-items', label: 'Mis Items', icono: 'items' },
]

const ITEMS_DERECHA = [
  { to: '/orders', label: 'Mis Órdenes', icono: 'pedidos' },
  { to: '/cuenta', label: 'Cuenta', icono: 'cuenta' },
]

function BottomNavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `bottom-nav__item ${isActive ? 'bottom-nav__item--activo' : ''}`
      }
    >
      <span className="bottom-nav__icon-wrap">
        <span className="bottom-nav__icon-pill" aria-hidden="true" />
        {ICONOS[item.icono]}
      </span>
      <span className="bottom-nav__label">{item.label}</span>
    </NavLink>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ITEMS_IZQUIERDA.map((item) => (
        <BottomNavItem key={item.to} item={item} />
      ))}

      {/* Botón central "Menú" — FAB elevado, lleva a la página de navegación completa */}
      <NavLink
        to="/menu"
        className={({ isActive }) =>
          `bottom-nav__fab-wrapper ${isActive ? 'bottom-nav__fab-wrapper--activo' : ''}`
        }
      >
        <span className="bottom-nav__fab">
          {ICONOS.menu}
        </span>
        <span className="bottom-nav__fab-label">Menú</span>
      </NavLink>

      {ITEMS_DERECHA.map((item) => (
        <BottomNavItem key={item.to} item={item} />
      ))}
    </nav>
  )
}

export default BottomNav