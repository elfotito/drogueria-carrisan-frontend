import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from './useEnvios'
import api from '../api/axios'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

const CATEGORIAS = {
  Departments: ['Analgésicos', 'Antibióticos', 'Cuidado Facial'],
  Services: ['Pharmacy', 'Auto Service', 'Photo'],
}

function Navbar() {
  const { user, logout } = useAuth()
  const { items, total } = useCart()
  const {
    tipoEnvio,
    cambiarTipoEnvio,
    opcionesEnvio,
    direccionSeleccionada,
  } = useEnvio()
  
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [showEnvioPanel, setShowEnvioPanel] = useState(false)
  const [dropdownAbierto, setDropdownAbierto] = useState(null)
  
  const searchRef = useRef(null)
  const panelRef = useRef(null)

  const cantidadItems = items?.reduce((acc, item) => acc + item.cantidad, 0) || 0

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowEnvioPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (RUTAS_SIN_NAVBAR.includes(location.pathname)) return null

  function handleBuscar(e) {
    e.preventDefault()
    const termino = busqueda.trim()
    if (termino) {
      navigate(`/catalogo?search=${encodeURIComponent(termino)}`)
    }
  }

  const ubicacionTexto = direccionSeleccionada 
    ? `${direccionSeleccionada.ciudad}, ${direccionSeleccionada.estado}`
    : 'New York, 10013'

  return (
    <>
      <header className="navbar-container">
        <div className="navbar__main">
          
          {/* Menú Hamburguesa (Solo Móvil) */}
          <button className="navbar__menu-mobile" onClick={() => setMenuAbierto(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffc220"><path d="M12 2L14.39 8.26L21 9.27L16.21 13.97L17.33 20.5L12 17.7L6.67 20.5L7.79 13.97L3 9.27L9.61 8.26L12 2Z"/></svg>
          </Link>

          {/* Botón Pickup/Delivery (Escritorio) y Contenedor del Dropdown */}
          <div className="pickup-dropdown-wrapper" ref={panelRef}>
            <button className="navbar__pickup-btn desktop-only" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
              <div className="pickup-btn__icon">
                <img src="https://i.imgur.com/8QG9gXv.png" alt="pickup icon" width="24"/>
              </div>
              <div className="pickup-btn__text">
                <span className="pickup-btn__title">Pickup or delivery?</span>
                <span className="pickup-btn__subtitle">{ubicacionTexto} • Secaucus Superc...</span>
              </div>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {/* Panel Desplegable */}
            {showEnvioPanel && (
              <PanelEnvio 
                ubicacionTexto={ubicacionTexto}
                onClose={() => setShowEnvioPanel(false)}
              />
            )}
          </div>

          {/* Buscador */}
          <div className="navbar__search-wrapper" ref={searchRef}>
            <form className="navbar__search" onSubmit={handleBuscar}>
              <input
                type="text"
                placeholder="Search everything at Walmart online and in store"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
          </div>

          {/* Acciones Derecha (Escritorio) */}
          <div className="navbar__actions desktop-only">
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <div className="action-text">
                <span>Reorder</span>
                <strong>My Items</strong>
              </div>
            </button>
            <button className="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <div className="action-text">
                <span>Sign In</span>
                <strong>Account</strong>
              </div>
            </button>
          </div>

          {/* Carrito */}
          <Link to="/carrito" className="navbar__cart">
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="cart-badge">{cantidadItems}</span>
            </div>
            <span className="cart-price desktop-only">$0.00</span>
          </Link>
        </div>

        {/* Botón Pickup/Delivery (Móvil) */}
        <div className="navbar__mobile-pickup mobile-only">
          <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
            <div className="pickup-btn__left">
              <div className="pickup-btn__icon">
                <img src="https://i.imgur.com/8QG9gXv.png" alt="pickup icon" width="24"/>
              </div>
              <span className="pickup-btn__title">Pickup or delivery?</span>
            </div>
            <div className="pickup-btn__right">
              <span className="pickup-btn__subtitle">{ubicacionTexto}</span>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </button>
          
          {/* Panel Desplegable Móvil */}
          {showEnvioPanel && (
            <div className="mobile-dropdown-container">
               <PanelEnvio ubicacionTexto={ubicacionTexto} onClose={() => setShowEnvioPanel(false)} />
            </div>
          )}
        </div>

        {/* Barra Secundaria (Categorías) */}
        <nav className="navbar__secondary desktop-only">
          <div className="navbar__secondary-inner">
            <button className="pill-btn"><strong>Departments</strong> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button className="pill-btn"><strong>Services</strong> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <span className="divider"></span>
            <Link to="#" className="pill-link">Rollbacks & More</Link>
            <Link to="#" className="pill-link">Back to School</Link>
            <Link to="#" className="pill-link">Get it Fast</Link>
            <Link to="#" className="pill-link">Pharmacy</Link>
            <Link to="#" className="pill-link">New Arrivals</Link>
            <Link to="#" className="pill-link">Auto Service</Link>
          </div>
        </nav>
      </header>

      <MenuDrawer isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
    </>
  )
}

function PanelEnvio({ ubicacionTexto }) {
  return (
    <div className="envio-panel-content">
      <div className="envio-types">
        <button className="envio-type-btn">
          <div className="envio-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
          <span>Shipping</span>
        </button>
        <button className="envio-type-btn">
          <div className="envio-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 15v1c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg></div>
          <span>Pickup</span>
        </button>
        <button className="envio-type-btn">
          <div className="envio-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>
          <span>Delivery</span>
        </button>
      </div>

      <div className="envio-cards">
        <div className="envio-card">
          <div className="envio-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <div>
              <strong>Add an address for shipping and delivery</strong>
              <p>{ubicacionTexto}</p>
            </div>
          </div>
          <button className="envio-add-btn">Add address</button>
          <div className="envio-card-footer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Ship to another country</span>
            <svg className="arrow-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div className="envio-card">
          <div className="envio-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <div>
              <strong>Sterling Supercenter</strong>
              <p>45415 DULLES CROSSING PLZ, Sterling, VA 20166</p>
            </div>
            <svg className="arrow-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar