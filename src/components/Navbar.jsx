import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from './useEnvios' // Ajusta el path de tu hook si es necesario
import api from '../api/axios'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  
  // 1. Estados y lógica del panel de envíos
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
  const [dropdownAbierto, setDropdownAbierto] = useState(null)
  
  // 2. Estados para el buscador interactivo
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  
  const searchRef = useRef(null)
  const panelRef = useRef(null)

  const cantidadItems = items?.reduce((acc, item) => acc + item.cantidad, 0) || 0

  // Cerrar menús flotantes al hacer clic afuera
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

  // Buscar sugerencias mientras se escribe
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
          
          {/* Menú Hamburguesa (Móvil) */}
          <button className="navbar__menu-mobile" onClick={() => setMenuAbierto(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffc220"><path d="M12 2L14.39 8.26L21 9.27L16.21 13.97L17.33 20.5L12 17.7L6.67 20.5L7.79 13.97L3 9.27L9.61 8.26L12 2Z"/></svg>
          </Link>

          {/* Botón Pickup/Delivery (Escritorio) y Panel Desplegable */}
          <div className="pickup-dropdown-wrapper" ref={panelRef}>
            <button className="navbar__pickup-btn desktop-only" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
              <div className="pickup-btn__icon">
                <img src="https://i.imgur.com/8QG9gXv.png" alt="pickup icon" width="24"/>
              </div>
              <div className="pickup-btn__text">
                <span className="pickup-btn__title">¿Retiro o delivery?</span>
                <span className="pickup-btn__subtitle">{ciudadEstado}</span>
              </div>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            {/* Renderizado de tu panel de envíos funcional */}
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

          {/* Buscador Interactivo */}
          <div className="navbar__search-wrapper" ref={searchRef}>
            <form className="navbar__search" onSubmit={handleBuscar}>
              <input
                type="text"
                placeholder="Busca productos, marcas y más..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              />
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
            
            {/* Dropdown de Sugerencias de búsqueda */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="search-suggestions">
                {sugerencias.map((producto) => (
                  <button
                    key={producto.id}
                    className="suggestion-item"
                    onClick={() => handleSugerenciaClick(producto)}
                  >
                    <span>{producto.nombre_comercial}</span>
                    <span className="suggestion-price">${producto.precio_usd}</span>
                  </button>
                ))}
              </div>
            )}
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
              <span className="pickup-btn__title">¿Retiro o delivery?</span>
            </div>
            <div className="pickup-btn__right">
              <span className="pickup-btn__subtitle">{ciudadEstado}</span>
              <svg className={`pickup-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </button>
          
          {/* Panel Desplegable Móvil */}
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

        {/* Barra Secundaria (Categorías) */}
        <nav className="navbar__secondary desktop-only">
          <div className="navbar__secondary-inner">
            <button className="pill-btn"><strong>Departamentos</strong> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button className="pill-btn"><strong>Servicios</strong> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <span className="divider"></span>
            <Link to="/catalogo" className="pill-link">Nuevos Ingresos</Link>
            <Link to="/catalogo" className="pill-link">Ofertas</Link>
            <Link to="/catalogo" className="pill-link">Farmacia</Link>
            <Link to="/catalogo" className="pill-link">Cuidado Personal</Link>
          </div>
        </nav>
      </header>

      <MenuDrawer isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
    </>
  )
}

// -------------------------------------------------------------
// COMPONENTE PANEL ENVÍO INTEGRADO (Lógica tuya + Estilos Walmart)
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
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const CIUDADES = ['Caracas', 'Maracay', 'Valencia']
  const opcionActual = opcionesEnvio?.find(op => op.id === tipoEnvio)
  const direccionesFiltradas = direcciones?.filter(
    d => d.tipo_direccion === opcionActual?.tipoDireccion
  ) || []

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.direccion) {
      setMensaje('Completa nombre y dirección')
      return
    }

    setGuardando(true)
    setMensaje('')

    try {
      await guardarDireccion({
        ...formData,
        tipo_direccion: opcionActual?.tipoDireccion || 'delivery',
        estado: tipoEnvio === 'delivery' ? 'Distrito Capital' : formData.estado,
      })
      await cargarDirecciones(opcionActual?.tipoDireccion)
      setMostrarForm(false)
      setFormData({
        nombre: '', direccion: '', ciudad: '', estado: '',
        telefono_contacto: '', referencia: '', agencia_preferida: '',
      })
      setMensaje('✅ Dirección guardada')
      setTimeout(() => setMensaje(''), 2000)
    } catch (err) {
      setMensaje('❌ Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="envio-panel-content">
      {/* Header interno del panel móvil */}
      <div className="envio-panel-header mobile-only">
        <button onClick={onClose} className="close-panel-btn">✕</button>
      </div>

      {mensaje && (
        <div className={`envio-mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
          {mensaje}
        </div>
      )}

      {/* Tipos de envío mapeados dinámicamente */}
      <div className="envio-types">
        {(opcionesEnvio || []).map(opcion => (
          <button
            key={opcion.id}
            className={`envio-type-btn ${tipoEnvio === opcion.id ? 'active' : ''}`}
            onClick={() => cambiarTipoEnvio(opcion.id)}
          >
            <div className="envio-circle">{opcion.icono}</div>
            <span className="envio-label">{opcion.label}</span>
            <span className="envio-costo">{opcion.textoCosto}</span>
          </button>
        ))}
      </div>

      {/* Direcciones (Sólo si no es retiro) */}
      {tipoEnvio !== 'retiro' && (
        <div className="envio-cards">
          
          {direccionesFiltradas.length > 0 && direccionesFiltradas.map(dir => (
            <label
              key={dir.id}
              className={`envio-card ${direccionSeleccionada?.id === dir.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="direccion_envio"
                className="envio-radio"
                checked={direccionSeleccionada?.id === dir.id}
                onChange={() => setDireccionSeleccionada(dir)}
              />
              <div className="envio-card-info">
                <strong>{dir.nombre}</strong>
                <p>{dir.direccion}</p>
                <small>📍 {dir.ciudad}, {dir.estado} {dir.telefono_contacto && `• 📞 ${dir.telefono_contacto}`}</small>
              </div>
            </label>
          ))}

          {/* Botón de Formulario / Formulario */}
          {!mostrarForm ? (
            <button className="envio-add-btn" onClick={() => setMostrarForm(true)}>
              + Agregar nueva dirección
            </button>
          ) : (
            <form onSubmit={handleGuardar} className="envio-form">
              <input type="text" placeholder="Nombre (Casa, Oficina...)" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              <textarea placeholder="Dirección completa" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required rows="2" />
              
              {tipoEnvio === 'delivery' ? (
                <>
                  <select value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} required>
                    <option value="">Seleccionar ciudad</option>
                    {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="text" value="Distrito Capital" disabled className="input-disabled" />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Ciudad" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
                  <input type="text" placeholder="Estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} />
                </>
              )}
              
              <input type="text" placeholder="Teléfono de contacto" value={formData.telefono_contacto} onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })} />
              <input type="text" placeholder="Referencia (opcional)" value={formData.referencia} onChange={(e) => setFormData({ ...formData, referencia: e.target.value })} />
              
              {tipoEnvio === 'envio_nacional' && (
                <select value={formData.agencia_preferida} onChange={(e) => setFormData({ ...formData, agencia_preferida: e.target.value })}>
                  <option value="">Agencia preferida</option>
                  <option value="MRW">MRW</option>
                  <option value="Domesa">Domesa</option>
                  <option value="Tealca">Tealca</option>
                  <option value="Zoom">Zoom</option>
                </select>
              )}
              
              <div className="form-actions">
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar