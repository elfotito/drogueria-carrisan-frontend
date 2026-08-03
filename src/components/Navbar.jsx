import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

function Navbar() {
  const { user, logout } = useAuth()
  const cartContext = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

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
          {/* Botón Menú Hamburger */}
          <button
            type="button"
            className="navbar__menu-btn"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-dot navbar__logo-dot--teal" />
            <span className="navbar__logo-dot navbar__logo-dot--indigo" />
            Carrisán
          </Link>

          {/* Botón de Envío (Estilo de la imagen) */}
          <button className="navbar__shipping">
            <div className="shipping__icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className="shipping__text">
              <span className="shipping__label">Shipping</span>
              <span className="shipping__address">Mississauga, L5P 1B2</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Buscador Central */}
          <form className="navbar__search" onSubmit={handleBuscar}>
            <input
              type="text"
              placeholder="Search everything at online and in store"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Acciones de la Derecha */}
          <div className="navbar__actions">
            {/* Reorder / My Items */}
            <button className="navbar__action-btn" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <div className="action-btn__text">
                <span className="text-light">Reorder</span>
                <span className="text-bold">My Items</span>
              </div>
            </button>

            {/* Sign In / Account */}
            <button
              className="navbar__action-btn"
              type="button"
              onClick={() => user ? setMenuAbierto(true) : navigate('/login')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <div className="action-btn__text">
                <span className="text-light">{user ? 'Perfil' : 'Sign In'}</span>
                <span className="text-bold">Account</span>
              </div>
            </button>

            {/* Carrito */}
            <button
              type="button"
              className="navbar__action-btn navbar__cart-btn"
              onClick={() => navigate('/carrito')}
              aria-label="Ver carrito"
            >
              <div className="cart-icon-wrapper">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="navbar__cart-badge">{cantidadCarrito}</span>
              </div>
              <div className="action-btn__text">
                <span className="text-light">$0.00</span>
              </div>
            </button>
          </div>
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