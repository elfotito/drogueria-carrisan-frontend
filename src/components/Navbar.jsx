import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from '../hooks/useEnvio'
import api from '../api/axios'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

// Datos mock para categorías del menú desplegable
const CATEGORIAS = {
  medicamentos: ['Analgésicos', 'Antibióticos', 'Antiinflamatorios', 'Cardiovasculares', 'Respiratorios'],
  cuidado: ['Cuidado Facial', 'Cuidado Corporal', 'Protección Solar', 'Salud Bucal'],
  bebe: ['Fórmulas', 'Pañales', 'Alimentación', 'Cuidado del Bebé'],
}

function Navbar() {
  const { user, logout } = useAuth()
  const { items, total } = useCart()
  const {
    tipoEnvio,
    cambiarTipoEnvio,
    opcionesEnvio,
    direccionSeleccionada,
    direcciones,
    guardarDireccion,
    cargarDirecciones,
  } = useEnvio()
  
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [showEnvioPanel, setShowEnvioPanel] = useState(false)
  const [dropdownAbierto, setDropdownAbierto] = useState(null)
  const searchRef = useRef(null)
  const panelRef = useRef(null)

  const cantidadItems = items?.reduce((acc, item) => acc + item.cantidad, 0) || 0
  const opcionActual = opcionesEnvio?.find(op => op.id === tipoEnvio)

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarSugerencias(false)
      }
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowEnvioPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar sugerencias mientras escribe
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
      <header className="navbar">
        {/* Barra Superior */}
        <div className="navbar__top">
          <div className="navbar__top-left">
            {/* Logo */}
            <Link to="/" className="navbar__logo">
              <span className="navbar__logo-icon">💊</span>
              <span className="navbar__logo-text">Carrisán</span>
            </Link>

            {/* Botón Retiro/Delivery (Desktop) */}
            <button
              className="navbar__envio-btn"
              onClick={() => setShowEnvioPanel(!showEnvioPanel)}
            >
              <div className="envio-btn__icon">🛵</div>
              <div className="envio-btn__text">
                <span className="envio-btn__label">¿Retiro o delivery?</span>
                <span className="envio-btn__location">{ciudadEstado}</span>
              </div>
              <svg
                className={`envio-btn__arrow ${showEnvioPanel ? 'rotated' : ''}`}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Buscador */}
          <div className="navbar__search-wrapper" ref={searchRef}>
            <form className="navbar__search" onSubmit={handleBuscar}>
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar en Droguería Carrisán..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
              />
            </form>

            {/* Sugerencias */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <div className="search-suggestions">
                {sugerencias.map((producto) => (
                  <button
                    key={producto.id}
                    className="suggestion-item"
                    onClick={() => handleSugerenciaClick(producto)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>{producto.nombre_comercial}</span>
                    <span className="suggestion-price">${producto.precio_usd}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Acciones derecha */}
          <div className="navbar__actions">
            {/* Favoritos */}
            <Link to="/mis-items" className="navbar__action">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div className="action-text">
                <span>Favoritos</span>
              </div>
            </Link>

            {/* Cuenta */}
            <Link to="/cuenta" className="navbar__action">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div className="action-text">
                <span className="action-text__top">{user ? 'Perfil' : 'Iniciar Sesión'}</span>
                <span className="action-text__bottom">Cuenta</span>
              </div>
            </Link>

            {/* Carrito */}
            <Link to="/carrito" className="navbar__action navbar__cart">
              <div className="cart-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cantidadItems > 0 && (
                  <span className="cart-badge">{cantidadItems}</span>
                )}
              </div>
              <div className="action-text">
                <span className="cart-total">${total?.toFixed(2) || '0.00'}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Panel de Envío */}
        {showEnvioPanel && (
          <div className="envio-panel" ref={panelRef}>
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

        {/* Barra de Navegación Secundaria (Desktop) */}
        <nav className="navbar__secondary">
          <div className="navbar__secondary-inner">
            {/* Menús desplegables */}
            {Object.entries(CATEGORIAS).map(([key, items]) => (
              <div
                key={key}
                className="nav-dropdown"
                onMouseEnter={() => setDropdownAbierto(key)}
                onMouseLeave={() => setDropdownAbierto(null)}
              >
                <button className="nav-dropdown__trigger">
                  {key === 'medicamentos' && '💊 Medicamentos'}
                  {key === 'cuidado' && '🧴 Cuidado Personal'}
                  {key === 'bebe' && '🍼 Bebé'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {dropdownAbierto === key && (
                  <div className="nav-dropdown__menu">
                    {items.map((item) => (
                      <Link
                        key={item}
                        to={`/catalogo?categoria=${encodeURIComponent(item)}`}
                        className="nav-dropdown__item"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Enlaces fijos */}
            <Link to="/catalogo" className="nav-link">Ofertas</Link>
            <Link to="/catalogo" className="nav-link">Nuevos</Link>
            <Link to="/catalogo" className="nav-link">Más Vendidos</Link>
            <Link to="/quienes-somos" className="nav-link">Quiénes Somos</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
            <Link to="/ayuda" className="nav-link">Ayuda</Link>
            <Link to="/contacto" className="nav-link">Contacto</Link>
            <Link to="/terminos" className="nav-link">Términos</Link>
          </div>
        </nav>
      </header>

      {/* Menú Móvil */}
      <MenuDrawer
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}

// Componente del Panel de Envío
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
  const [nuevaDireccion, setNuevaDireccion] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    estado: '',
    telefono_contacto: '',
    referencia: '',
    agencia_preferida: '',
  })
  const [guardando, setGuardando] = useState(false)

  const opcionActual = opcionesEnvio?.find(op => op.id === tipoEnvio)
  const CIUDADES_DELIVERY = ['Caracas', 'Maracay', 'Valencia']

  const handleGuardarDireccion = async (e) => {
    e.preventDefault()
    if (!nuevaDireccion.nombre || !nuevaDireccion.direccion) return

    setGuardando(true)
    try {
      await guardarDireccion({
        ...nuevaDireccion,
        tipo_direccion: opcionActual?.tipoDireccion || 'delivery',
        estado: tipoEnvio === 'delivery' ? 'Distrito Capital' : nuevaDireccion.estado,
      })
      await cargarDirecciones(opcionActual?.tipoDireccion)
      setMostrarForm(false)
      setNuevaDireccion({
        nombre: '',
        direccion: '',
        ciudad: '',
        estado: '',
        telefono_contacto: '',
        referencia: '',
        agencia_preferida: '',
      })
    } catch (err) {
      console.error('Error guardando:', err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="envio-panel__content">
      <div className="envio-panel__header">
        <h3>¿Cómo quieres recibir tu pedido?</h3>
        <button className="envio-panel__close" onClick={onClose}>✕</button>
      </div>

      {/* Opciones de envío */}
      <div className="envio-panel__opciones">
        {opcionesEnvio?.map((opcion) => (
          <button
            key={opcion.id}
            className={`envio-opcion ${tipoEnvio === opcion.id ? 'envio-opcion--active' : ''}`}
            onClick={() => cambiarTipoEnvio(opcion.id)}
          >
            <span className="envio-opcion__icon">{opcion.icono}</span>
            <div className="envio-opcion__info">
              <span className="envio-opcion__label">{opcion.label}</span>
              <span className="envio-opcion__costo">{opcion.textoCosto}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Direcciones */}
      {opcionActual?.requiereDireccion && (
        <div className="envio-panel__direcciones">
          <p className="envio-panel__subtitulo">Dirección de entrega</p>

          {direcciones?.filter(d => d.tipo_direccion === opcionActual.tipoDireccion).map((dir) => (
            <label
              key={dir.id}
              className={`envio-direccion ${direccionSeleccionada?.id === dir.id ? 'envio-direccion--selected' : ''}`}
            >
              <input
                type="radio"
                name="direccion_envio"
                checked={direccionSeleccionada?.id === dir.id}
                onChange={() => setDireccionSeleccionada(dir)}
              />
              <div>
                <strong>{dir.nombre}</strong>
                <p>{dir.direccion}</p>
                <small>{dir.ciudad}, {dir.estado}</small>
              </div>
            </label>
          ))}

          {!mostrarForm ? (
            <button className="envio-add-btn" onClick={() => setMostrarForm(true)}>
              + Agregar nueva dirección
            </button>
          ) : (
            <form onSubmit={handleGuardarDireccion} className="envio-form">
              <input
                type="text"
                placeholder="Nombre (Casa, Oficina...)"
                value={nuevaDireccion.nombre}
                onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, nombre: e.target.value })}
                required
              />
              <textarea
                placeholder="Dirección completa"
                value={nuevaDireccion.direccion}
                onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, direccion: e.target.value })}
                required
                rows="2"
              />
              {tipoEnvio === 'delivery' ? (
                <select
                  value={nuevaDireccion.ciudad}
                  onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })}
                  required
                >
                  <option value="">Seleccionar ciudad</option>
                  {CIUDADES_DELIVERY.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={nuevaDireccion.ciudad}
                  onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, ciudad: e.target.value })}
                />
              )}
              <input
                type="text"
                placeholder="Teléfono"
                value={nuevaDireccion.telefono_contacto}
                onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, telefono_contacto: e.target.value })}
              />
              {tipoEnvio === 'envio_nacional' && (
                <select
                  value={nuevaDireccion.agencia_preferida}
                  onChange={(e) => setNuevaDireccion({ ...nuevaDireccion, agencia_preferida: e.target.value })}
                >
                  <option value="">Agencia preferida</option>
                  <option value="MRW">MRW</option>
                  <option value="Domesa">Domesa</option>
                  <option value="Tealca">Tealca</option>
                  <option value="Zoom">Zoom</option>
                </select>
              )}
              <div className="envio-form__actions">
                <button type="submit" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setMostrarForm(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar