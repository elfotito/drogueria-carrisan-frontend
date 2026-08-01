import { NavLink } from 'react-router-dom'
import './BottomNav.css'

// Íconos simples en SVG inline — evita depender de una librería de íconos
// solo para 4 símbolos, y permite controlar el color activo vía CSS (currentColor)
const ICONOS = {
  inicio: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  catalogo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
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
}

const ITEMS = [
  { to: '/', label: 'Inicio', icono: 'inicio', end: true },
  { to: '/catalogo', label: 'Catálogo', icono: 'catalogo' },
  { to: '/orders', label: 'Pedidos', icono: 'pedidos' },
  { to: '/cuenta', label: 'Cuenta', icono: 'cuenta' },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--activo' : ''}`
          }
        >
          {ICONOS[item.icono]}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav