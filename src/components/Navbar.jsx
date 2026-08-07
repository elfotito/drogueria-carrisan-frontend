import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from './useEnvios' 
import api from '../api/axios'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  
  const {
    tipoEnvio,
    cambiarTipoEnvio,
    opcionesEnvio,
    direcciones,
    direccionSeleccionada,
    setDireccionSeleccionada,
    guardarDireccion,
    cargarDirecciones,
  } = useEnvio()
  
  const navigate = useNavigate()
  const location = useLocation()
  
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [showEnvioPanel, setShowEnvioPanel] = useState(false)
  
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  
  const searchRef = useRef(null)
  const panelRef = useRef(null)

  const cantidadItems = items?.reduce((acc, item) => acc + item.cantidad, 0) || 0

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowEnvioPanel(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarSugerencias(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (busqueda.length < 2) {
      setSugerencias([])
      setMostrarSugerencias(false)
      return
    }
    const debounce = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(busqueda)}&limit=5`)
        setSugerencias(data.slice(0, 5))
        setMostrarSugerencias(true)
      } catch (err) {
        console.error('Error buscando sugerencias:', err)
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [busqueda])

  if (RUTAS_SIN_NAVBAR.includes(location.pathname)) return null

  function handleBuscar(e) {
    e.preventDefault()
    const termino = busqueda.trim()
    if (termino) {
      setMostrarSugerencias(false)
      navigate(`/catalogo?search=${encodeURIComponent(termino)}`)
    }
  }

  function handleSugerenciaClick(producto) {
    setMostrarSugerencias(false)
    setBusqueda('')
    navigate(`/producto/${producto.id}`)
  }

  const ciudadEstado = direccionSeleccionada 
    ? `${direccionSeleccionada.ciudad || 'Ciudad'}, ${direccionSeleccionada.estado || 'Estado'}`
    : 'Valencia, Carabobo'

  return (
    <>
      <header className="navbar-container">
        <div className="navbar__main">
          
          <button className="navbar__menu-mobile" onClick={() => setMenuAbierto(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          <Link to="/" className="navbar__logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffc220"><path d="M12 2L14.39 8.26L21 9.27L16.21 13.97L17.33 20.5L12 17.7L6.67 20.5L7.79 13.97L3 9.27L9.61 8.26L12 2Z"/></svg>
          </Link>

          {/* 🆕 CONTENEDOR ESCRITORIO (Aislado para evitar doble renderizado) */}
          <div className="pickup-dropdown-wrapper desktop-only" ref={panelRef}>
            <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
              <div className="pickup-btn__icon">
                <img src="https://i.imgur.com/8QG9gXv.png" alt="pickup icon" width="24"/>
              </div>
              <div className="pickup-btn__text">
                <span className="pickup-btn__title">¿Retiro o delivery?</span>
                <span className="pickup-btn__subtitle">{ciudadEstado}</span>
              </div>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {showEnvioPanel && (
              <PanelEnvio
                tipoEnvio={tipoEnvio}
                cambiarTipoEnvio={cambiarTipoEnvio}
                opcionesEnvio={opcionesEnvio}
                direcciones={direcciones}
                direccionSeleccionada={direccionSeleccionada}
                setDireccionSeleccionada={setDireccionSeleccionada}
                guardarDireccion={guardarDireccion}
                cargarDirecciones={cargarDirecciones}
                onClose={() => setShowEnvioPanel(false)}
              />
            )}
          </div>

          <div className="navbar__search-wrapper" ref={searchRef}>
            <form className="navbar__search" onSubmit={handleBuscar}>
              <input
                type="text"
                placeholder="Busca en Droguería Carrisán"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              />
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
            
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="search-suggestions">
                {sugerencias.map((producto) => (
                  <button key={producto.id} className="suggestion-item" onClick={() => handleSugerenciaClick(producto)}>
                    <span>{producto.nombre_comercial}</span>
                    <span className="suggestion-price">${producto.precio_usd}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="navbar__actions desktop-only">
            {/* ... tus botones de reorder y cuenta ... */}
          </div>

          <Link to="/carrito" className="navbar__cart">
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="cart-badge">{cantidadItems}</span>
            </div>
            <span className="cart-price desktop-only">$0.00</span>
          </Link>
        </div>

        {/* 🆕 CONTENEDOR MÓVIL (Aislado para evitar doble renderizado) */}
        <div className="navbar__mobile-pickup mobile-only">
          <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
            <div className="pickup-btn__left">
              <div className="pickup-btn__icon">
                <img src="https://i.imgur.com/8QG9gXv.png" alt="pickup icon" width="24"/>
              </div>
              <span className="pickup-btn__title">¿Retiro o entrega?</span>
            </div>
            <div className="pickup-btn__right">
              <span className="pickup-btn__subtitle">{ciudadEstado}</span>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </button>
          
          {showEnvioPanel && (
            <div className="mobile-dropdown-container">
              <PanelEnvio
                tipoEnvio={tipoEnvio}
                cambiarTipoEnvio={cambiarTipoEnvio}
                opcionesEnvio={opcionesEnvio}
                direcciones={direcciones}
                direccionSeleccionada={direccionSeleccionada}
                setDireccionSeleccionada={setDireccionSeleccionada}
                guardarDireccion={guardarDireccion}
                cargarDirecciones={cargarDirecciones}
                onClose={() => setShowEnvioPanel(false)}
              />
            </div>
          )}
        </div>

        <nav className="navbar__secondary desktop-only">
          {/* ... tu barra secundaria ... */}
        </nav>
      </header>

      <MenuDrawer isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
    </>
  )
}

// -------------------------------------------------------------
// COMPONENTE PANEL ESTILO WALMART CLON EXACTO
// -------------------------------------------------------------
function PanelEnvio({
  tipoEnvio,
  cambiarTipoEnvio,
  opcionesEnvio,
  direcciones,
  direccionSeleccionada,
  setDireccionSeleccionada,
  guardarDireccion,
  cargarDirecciones,
  onClose,
}) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '', direccion: '', ciudad: '', estado: '',
    telefono_contacto: '', referencia: '', agencia_preferida: '',
  })
  
  // Aquí puedes ajustar los iconos para que sean exactos a los que quieras
  const WALMART_ICONS = {
    'envio': '📦',
    'retiro': '🏪',
    'delivery': '🛵'
  }

  return (
    <div className="envio-panel-content">
      {/* 1. SECCIÓN DE TIPOS DE ENVÍO (Círculos idénticos al video) */}
      <div className="envio-types-video">
        {(opcionesEnvio || []).map(opcion => (
          <button
            key={opcion.id}
            className={`wm-type-btn ${tipoEnvio === opcion.id ? 'active' : ''}`}
            onClick={() => cambiarTipoEnvio(opcion.id)}
          >
            <div className="wm-circle">
               {WALMART_ICONS[opcion.id] || opcion.icono}
            </div>
            <span className="wm-label">{opcion.label}</span>
          </button>
        ))}
      </div>

      {/* 2. SECCIÓN DE TARJETA BLANCA (Como en el video) */}
      <div className="wm-card">
        {tipoEnvio !== 'retiro' ? (
          <>
            <div className="wm-card-header">
              <span className="wm-card-icon">📍</span>
              <p>Agrega una dirección para el envío y la entrega</p>
            </div>
            {direccionSeleccionada && (
              <p className="wm-card-address">
                {direccionSeleccionada.ciudad}, {direccionSeleccionada.estado}
              </p>
            )}
            <button className="wm-add-btn" onClick={() => setMostrarForm(true)}>
              Agregar Dirección
            </button>
          </>
        ) : (
          <>
            <div className="wm-card-header">
              <span className="wm-card-icon">🏪</span>
              <div>
                <strong>Depósito Principal</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                  Valencia, Carabobo
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. BOTÓN CERRAR ABAJO (Idéntico al video) */}
      <div className="wm-close-container">
        <button onClick={onClose} className="wm-close-text">
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default Navbar
