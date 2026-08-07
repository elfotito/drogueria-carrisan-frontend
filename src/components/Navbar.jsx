import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from './useEnvios'
import api from '../api/axios'
import MenuDrawer from './MenuDrawer'
import './Navbar.css'

const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']
const deptosBtnRef = useRef(null)
// 🆕 Datos de departamentos y sus subcategorías
const DEPARTAMENTOS = [
  {
    id: 'hospitalaria',
    nombre: 'Línea Hospitalaria',
    icono: '🏥',
    subcategorias: [
      { nombre: 'Anestesia', ruta: '/catalogo?departamento=hospitalaria&categoria=anestesia' },
      { nombre: 'Antibióticos', ruta: '/catalogo?departamento=hospitalaria&categoria=antibioticos' },
      { nombre: 'Soluciones', ruta: '/catalogo?departamento=hospitalaria&categoria=soluciones' },
    ]
  },
  {
    id: 'farmacia',
    nombre: 'Línea Farmacia',
    icono: '💊',
    subcategorias: [
      { nombre: 'Antibióticos', ruta: '/catalogo?departamento=farmacia&categoria=antibioticos' },
      { nombre: 'Pediátricos', ruta: '/catalogo?departamento=farmacia&categoria=pediatricos' },
      { nombre: 'Antiflamatorios', ruta: '/catalogo?departamento=farmacia&categoria=antiflamatorios' },
      { nombre: 'Cremas', ruta: '/catalogo?departamento=farmacia&categoria=cremas' },
    ]
  },
  {
    id: 'material-medico',
    nombre: 'Material Médico',
    icono: '🩺',
    subcategorias: [
      { nombre: 'Descartables', ruta: '/catalogo?departamento=material-medico&categoria=descartables' },
      { nombre: 'Adhesivos', ruta: '/catalogo?departamento=material-medico&categoria=adhesivos' },
      { nombre: 'Soluciones', ruta: '/catalogo?departamento=material-medico&categoria=soluciones' },
    ]
  },
  {
    id: 'cuidado-personal',
    nombre: 'Cuidado Personal',
    icono: '🧴',
    subcategorias: [
      { nombre: 'Cuidado Personal', ruta: '/catalogo?departamento=cuidado-personal' },
    ]
  },
]

function Navbar() {
  const { user, logout } = useAuth()
  const { items } = useCart()
  const cantidadItems = items?.reduce((acc, item) => acc + item.cantidad, 0) || 0
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
  const [showDeptosMenu, setShowDeptosMenu] = useState(false) // 🆕 Estado para menú departamentos
  const [deptoActivo, setDeptoActivo] = useState(null) // 🆕 Departamento activo en el hover
  
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  
  const searchRef = useRef(null)
  const panelRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const deptosRef = useRef(null) // 🆕 Ref para el menú de departamentos

  useEffect(() => {
    function handleClickOutside(event) {
      const isOutsideDesktop = panelRef.current && !panelRef.current.contains(event.target)
      const isOutsideMobile = mobilePanelRef.current && !mobilePanelRef.current.contains(event.target)
      const isOutsideDeptos = deptosRef.current && !deptosRef.current.contains(event.target)

      if (isOutsideDesktop && isOutsideMobile) {
        setShowEnvioPanel(false)
      }
      
      if (isOutsideDeptos) {
        setShowDeptosMenu(false)
        setDeptoActivo(null)
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

  // 🆕 Manejar clic en subcategoría
  function handleSubcategoriaClick(ruta) {
    setShowDeptosMenu(false)
    setDeptoActivo(null)
    navigate(ruta)
  }

  const ciudadEstado = direccionSeleccionada 
    ? `${direccionSeleccionada.ciudad || 'Ciudad'}, ${direccionSeleccionada.estado || 'Estado'}`
    : 'Valencia, Carabobo'

  return (
    <>
      <header className="navbar-container">
        <div className="navbar__main">

          {/* Botón Pickup/Delivery (ESCRITORIO) */}
          <div className="navbar__desktop-pickup-wrapper desktop-only" ref={panelRef}>
            <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
              <div className="pickup-btn__icon">
                🚚
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

          {/* Buscador Interactivo */}
          <div className="navbar__search-wrapper" ref={searchRef}>
            <form className="navbar__search" onSubmit={handleBuscar}>
              <input
                type="text"
                placeholder="Buscar en Drogueria Carrisan"
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
            <span className="cart-price">$0.00</span>
          </Link>
        </div>

        {/* Botón Pickup/Delivery (MÓVIL) */}
        <div className="navbar__mobile-pickup-wrapper mobile-only" ref={mobilePanelRef}>
          <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
            <div className="pickup-btn__left">
              <div className="pickup-btn__icon">
                🚚
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

        {/* 🆕 Barra Secundaria (Categorías) con menú desplegable */}
        <nav className="navbar__secondary desktop-only">
          <div className="navbar__secondary-inner">
            {/* 🆕 Botón Departamentos con menú desplegable */}
            <div className="navbar__deptos-wrapper" ref={deptosRef}>
              <button 
                className="pill-btn pill-btn--deptos"
                onClick={() => {
                  setShowDeptosMenu(!showDeptosMenu)
                  if (!showDeptosMenu) {
                    setDeptoActivo(DEPARTAMENTOS[0].id) // 🆕 Abrir con el primer departamento seleccionado
                  }
                }}
              >
                <strong>Departamentos</strong>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* 🆕 Menú desplegable de departamentos */}
              {showDeptosMenu && (
                <div className="deptos-dropdown">
                  <div className="deptos-dropdown__sidebar">
                    <p className="deptos-dropdown__titulo">Todos los departamentos</p>
                    {DEPARTAMENTOS.map((depto) => (
                      <button
                        key={depto.id}
                        className={`deptos-dropdown__depto-btn ${deptoActivo === depto.id ? 'active' : ''}`}
                        onMouseEnter={() => setDeptoActivo(depto.id)}
                        onClick={() => setDeptoActivo(depto.id)}
                      >
                        <span className="deptos-dropdown__depto-icono">{depto.icono}</span>
                        {depto.nombre}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Subcategorías del departamento activo */}
                  <div className="deptos-dropdown__subcategorias">
                    {DEPARTAMENTOS.find(d => d.id === deptoActivo)?.subcategorias.map((sub) => (
                      <button
                        key={sub.nombre}
                        className="deptos-dropdown__sub-link"
                        onClick={() => handleSubcategoriaClick(sub.ruta)}
                      >
                        {sub.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="pill-btn">
              <strong>Servicios</strong>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
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
// COMPONENTE PANEL ENVÍO INTEGRADO
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
      <div className="envio-panel-header mobile-only">
        <button onClick={onClose} className="close-panel-btn" aria-label="Cerrar panel">
          ✕
        </button>
      </div>

      {mensaje && (
        <div className={`envio-mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
          {mensaje}
        </div>
      )}

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