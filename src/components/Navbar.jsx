import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

// Páginas donde el Navbar global no debe aparecer -- estas páginas manejan
// su propia identidad visual completa (login por pasos, registro, recuperar).
const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

function Navbar() {
  const { user, logout } = useAuth()
  const cartContext = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  // NOTA: asumo que CartContext expone un array "items" -- ajustar este campo
  // en cuanto confirmes la forma real de CartContext.jsx. Con optional chaining
  // no rompe nada si el nombre es otro, simplemente muestra 0.
  const cantidadCarrito = cartContext?.items?.length ?? 0

  if (RUTAS_SIN_NAVBAR.includes(location.pathname)) {
    return null
  }

  function handleLogout() {
    setMenuAbierto(false)
    logout()
    navigate('/login')
  }

  function handleBuscar(e) {
    e.preventDefault()
    const termino = busqueda.trim()
    navigate(termino ? `/catalogo?search=${encodeURIComponent(termino)}` : '/catalogo')
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar__fila-principal">
          <button
            type="button"
            className="navbar__icon-btn navbar__menu-btn"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-dot navbar__logo-dot--teal" />
            <span className="navbar__logo-dot navbar__logo-dot--indigo" />
            Carrisán
          </Link>

          <form className="navbar__search" onSubmit={handleBuscar}>
            <input
              type="text"
              placeholder="Buscar en el catálogo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          <button
            type="button"
            className="navbar__icon-btn navbar__cart-btn"
            onClick={() => navigate('/carrito')}
            aria-label="Ver carrito"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cantidadCarrito > 0 && (
              <span className="navbar__cart-badge">{cantidadCarrito}</span>
            )}
          </button>
        </div>
      </header>

      <MenuDrawer
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Navbar