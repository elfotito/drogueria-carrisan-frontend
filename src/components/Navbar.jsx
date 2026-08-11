import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEnvio } from '../context/EnvioContext'
import logo from '../assets/logo/minilogo blanco sin fondo.png'
import api from '../api/axios'
import BuscadorMovil from './BuscadorMovil'
import './Navbar.css'



const RUTAS_SIN_NAVBAR = ['/login', '/registro', '/recuperar']

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

// 🆕 Datos de servicios y sus subcategorías
const SERVICIOS = [
  {
    id: 'consulta-medica',
    nombre: 'Consulta Médica',
    icono: '🩺',
    subcategorias: [
      { nombre: 'Cardiología', ruta: '/servicios/consulta-medica/cardiologia' },
      { nombre: 'Medicina Interna', ruta: '/servicios/consulta-medica/medicina-interna' },
      { nombre: 'Estudios pre-operatorios', ruta: '/servicios/consulta-medica/pre-operatorios' },
    ]
  },
  {
    id: 'laboratorio-clinico',
    nombre: 'Laboratorio Clínico',
    icono: '🔬',
    subcategorias: [
      { nombre: 'Análisis de Sangre', ruta: '/servicios/laboratorio/analisis-sangre' },
      { nombre: 'Análisis de orina y heces', ruta: '/servicios/laboratorio/analisis-orina-heces' },
      { nombre: 'Microbiología y parasitología', ruta: '/servicios/laboratorio/microbiologia' },
    ]
  },
  {
    id: 'detalles-disenos',
    nombre: 'Detalles & Diseños',
    icono: '🎁',
    subcategorias: [
      { nombre: 'Arreglos florales', ruta: '/servicios/detalles/arreglos-florales' },
      { nombre: 'Cestas conmemorativas', ruta: '/servicios/detalles/cestas' },
      { nombre: 'Escultura con Globos', ruta: '/servicios/detalles/globos' },
      { nombre: 'Decoración para eventos', ruta: '/servicios/detalles/decoracion-eventos' },
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
  
  const [showEnvioPanel, setShowEnvioPanel] = useState(false)
  const [showDeptosMenu, setShowDeptosMenu] = useState(false)
  const [deptoActivo, setDeptoActivo] = useState(null)
  const [showServiciosMenu, setShowServiciosMenu] = useState(false)
  const [servicioActivo, setServicioActivo] = useState(null) 
  const serviciosBtnRef = useRef(null) // 
  const serviciosRef = useRef(null) // 
  const [showMyItemsMenu, setShowMyItemsMenu] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const myItemsRef = useRef(null)
  const accountRef = useRef(null)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [buscadorMovilAbierto, setBuscadorMovilAbierto] = useState(false)
  
  const searchRef = useRef(null)
  const panelRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const deptosRef = useRef(null) //

      useEffect(() => {
      function handleClickOutside(event) {
        const isOutsideDesktop = panelRef.current && !panelRef.current.contains(event.target)
        const isOutsideMobile = mobilePanelRef.current && !mobilePanelRef.current.contains(event.target)
        const isOutsideDeptos = deptosRef.current && !deptosRef.current.contains(event.target)
        const isOutsideServicios = serviciosRef.current && !serviciosRef.current.contains(event.target)
        const isOutsideMyItems = myItemsRef.current && !myItemsRef.current.contains(event.target)
        const isOutsideAccount = accountRef.current && !accountRef.current.contains(event.target)

        if (isOutsideDesktop && isOutsideMobile) {
          setShowEnvioPanel(false)
        }
        
        if (isOutsideDeptos) {
          setShowDeptosMenu(false)
          setDeptoActivo(null)
        }

        if (isOutsideServicios) {
          setShowServiciosMenu(false)
          setServicioActivo(null)
        }
        
        // 🆕
        if (isOutsideMyItems) {
          setShowMyItemsMenu(false)
        }
        
        // 🆕
        if (isOutsideAccount) {
          setShowAccountMenu(false)
        }
        
        if (searchRef.current && !searchRef.current.contains(event.target)) {
          setMostrarSugerencias(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
    if (!showDeptosMenu) {
      setDeptoActivo(null)
    }
    if (!showServiciosMenu) {
      setServicioActivo(null)
    }
  }, [showDeptosMenu, showServiciosMenu])

  useEffect(() => {
    if (busqueda.length < 1) {
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

  function handleSearchFocus(e) {
    const esMobile = window.matchMedia('(max-width: 768px)').matches
    if (esMobile) {
      e.target.blur()
      setBuscadorMovilAbierto(true)
    } else if (sugerencias.length > 0) {
      setMostrarSugerencias(true)
    }
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

          <Link to="/" className="navbar__logo" aria-label="Ir a inicio">
            <img src={logo} alt="Droguería Carrisán" />
          </Link>

          {/* Botón Pickup/Delivery (ESCRITORIO) */}
          <div className="navbar__desktop-pickup-wrapper desktop-only" ref={panelRef}>
            <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
              <div className="pickup-btn__icon">
                📲
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
                onFocus={handleSearchFocus}
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
                    <img
                      src={producto.foto_url || '/placeholder.png'}
                      alt=""
                      className="suggestion-item__img"
                    />
                    <span className="suggestion-item__nombre">{producto.nombre_comercial}</span>
                    <span className="suggestion-price">${Number(producto.precio_usd).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {buscadorMovilAbierto && (
            <BuscadorMovil onClose={() => setBuscadorMovilAbierto(false)} />
          )}
          {/* Acciones Derecha (Escritorio) */}
<div className="navbar__actions desktop-only">

  {/* 🆕 Mi Botiquín (antes My Items) */}
  <div className="navbar__action-dropdown" ref={myItemsRef}>
    <button 
      className="action-btn"
      onClick={() => {
        setShowMyItemsMenu(!showMyItemsMenu)
        setShowAccountMenu(false)
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <div className="action-text">
        <span>Favoritos</span>
        <strong>Mis Items</strong>
      </div>
      <svg className={`action-btn__arrow ${showMyItemsMenu ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    {showMyItemsMenu && (
      <div className="action-dropdown-menu">
        <Link to="/mis-items" className="action-dropdown-item" onClick={() => setShowMyItemsMenu(false)}>
          <span className="action-dropdown-item__icono">❤️</span>
          <div>
            <span className="action-dropdown-item__label">Favoritos</span>
            <span className="action-dropdown-item__desc">Productos que te gustan</span>
          </div>
        </Link>
        <Link to="/mis-items?tab=favoritos" className="action-dropdown-item" onClick={() => setShowMyItemsMenu(false)}>
          <span className="action-dropdown-item__icono">📋</span>
          <div>
            <span className="action-dropdown-item__label">Mis Listas</span>
            <span className="action-dropdown-item__desc">Listas de compras</span>
          </div>
        </Link>
        <Link to="/mis-items?tab=recomprar" className="action-dropdown-item" onClick={() => setShowMyItemsMenu(false)}>
          <span className="action-dropdown-item__icono">🔄</span>
          <div>
            <span className="action-dropdown-item__label">Frecuentes</span>
            <span className="action-dropdown-item__desc">Compras recurrentes</span>
          </div>
        </Link>
      </div>
    )}
  </div>

  {/* 🆕 Cuenta */}
  <div className="navbar__action-dropdown" ref={accountRef}>
    <button 
      className="action-btn"
      onClick={() => {
        setShowAccountMenu(!showAccountMenu)
        setShowMyItemsMenu(false)
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <div className="action-text">
        <span>{user ? 'Sesión Iniciada' : 'Iniciar Sesión'}</span>
        <strong>{user ? 'Mi Cuenta' : 'Cuenta'}</strong>
      </div>
      <svg className={`action-btn__arrow ${showAccountMenu ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    {showAccountMenu && (
      <div className="action-dropdown-menu">
        {user ? (
          <>
            <Link to="/cuenta" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">👤</span>
              <div>
                <span className="action-dropdown-item__label">Mi Cuenta</span>
                <span className="action-dropdown-item__desc">Información personal</span>
              </div>
            </Link>
            <Link to="/orders" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">📦</span>
              <div>
                <span className="action-dropdown-item__label">Mis Órdenes</span>
                <span className="action-dropdown-item__desc">Historial de pedidos</span>
              </div>
            </Link>
            <Link to="/estado-cuenta" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">💳</span>
              <div>
                <span className="action-dropdown-item__label">Estado de Cuenta</span>
                <span className="action-dropdown-item__desc">Historial de facturación</span>
              </div>
            </Link>
            <Link to="/notificaciones" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">🔔</span>
              <div>
                <span className="action-dropdown-item__label">Notificaciones</span>
                <span className="action-dropdown-item__desc">Alertas y avisos</span>
              </div>
            </Link>
            <Link to="/admin" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">⚙️</span>
              <div>
                <span className="action-dropdown-item__label">Administracion</span>
                <span className="action-dropdown-item__desc">Acceso solo para trabajadores</span>
              </div>
            </Link>
            <div className="action-dropdown-divider"></div>
            <button className="action-dropdown-item action-dropdown-item--danger" onClick={() => { logout(); setShowAccountMenu(false); }}>
              <span className="action-dropdown-item__icono">🚪</span>
              <div>
                <span className="action-dropdown-item__label">Cerrar Sesión</span>
              </div>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">🔑</span>
              <div>
                <span className="action-dropdown-item__label">Iniciar Sesión</span>
                <span className="action-dropdown-item__desc">Accede a tu cuenta</span>
              </div>
            </Link>
            <Link to="/registro" className="action-dropdown-item" onClick={() => setShowAccountMenu(false)}>
              <span className="action-dropdown-item__icono">📝</span>
              <div>
                <span className="action-dropdown-item__label">Crear Cuenta</span>
                <span className="action-dropdown-item__desc">Regístrate gratis</span>
              </div>
            </Link>
          </>
        )}
      </div>
    )}
  </div>
</div>

          {/* Carrito */}
          <Link to="/carrito" className="navbar__cart">
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="cart-badge" style={{ 
                    top: "-6px", 
                    right: "-10px", 
                    backgroundColor: "#ffc107", 
                    color: "#000", 
                    borderRadius: "50%", 
                    padding: "0px 5px", 
                    fontSize: "0.75rem", 
                    fontWeight: "bold" 
                  }}>{cantidadItems}</span>
            </div>
            <span className="cart-price" style={{ fontSize: "12px", marginTop: "-8px" }}>$0.00</span>
          </Link>
        </div>

        {/* Botón Pickup/Delivery (MÓVIL) */}
        <div className="navbar__mobile-pickup-wrapper mobile-only" ref={mobilePanelRef}>
          <button className="navbar__pickup-btn" onClick={() => setShowEnvioPanel(!showEnvioPanel)}>
            <div className="pickup-btn__left">
              <div className="pickup-btn__icon">
                📲
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
                  setShowServiciosMenu(false)
                  setServicioActivo(null)
                  setDeptoActivo(null)
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
                        onMouseEnter={() => setDeptoActivo(depto.id)} // Solo hover
                        onClick={() => {
                          // Opcional: también activar con click
                          setDeptoActivo(deptoActivo === depto.id ? null : depto.id)
                        }}
                      >
                        <span className="deptos-dropdown__depto-icono">{depto.icono}</span>
                        <span className="deptos-dropdown__depto-nombre">{depto.nombre}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Subcategorías del departamento activo */}
                  {deptoActivo && (
                    <div className="deptos-dropdown__subcategorias">
                      <p className="deptos-dropdown__subtitulo">
                        {DEPARTAMENTOS.find(d => d.id === deptoActivo)?.nombre}
                      </p>
                      {DEPARTAMENTOS.find(d => d.id === deptoActivo)?.subcategorias.map((sub) => (
                        <button
                          key={sub.nombre}
                          className="deptos-dropdown__sub-link"
                          onClick={() => handleSubcategoriaClick(sub.ruta)}
                        >
                          <span className="deptos-dropdown__sub-icon">•</span>
                          {sub.nombre}
                        </button>
                      ))}
                      
                      {/* 🆕 Botón "Ver todo" opcional */}
                      <button
                        className="deptos-dropdown__sub-link deptos-dropdown__sub-link--ver-todo"
                        onClick={() => handleSubcategoriaClick(
                          `/catalogo?departamento=${deptoActivo}`
                        )}
                      >
                        Ver todo en {DEPARTAMENTOS.find(d => d.id === deptoActivo)?.nombre}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🆕 Botón Servicios con menú desplegable */}
              <div className="navbar__deptos-wrapper" ref={serviciosRef}>
                <button 
                  className="pill-btn pill-btn--deptos"
                  ref={serviciosBtnRef}
                  onClick={() => {
                    setShowServiciosMenu(!showServiciosMenu)
                    setShowDeptosMenu(false)
                    setDeptoActivo(null)
                    setServicioActivo(null)
                  }}
                >
                  <strong>Servicios</strong>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {showServiciosMenu && (
                    <div className="deptos-dropdown">
                      <div className="deptos-dropdown__sidebar">
                        <p className="deptos-dropdown__titulo">Todos los servicios</p>
                        {SERVICIOS.map((servicio) => (
                          <button
                            key={servicio.id}
                            className={`deptos-dropdown__depto-btn ${servicioActivo === servicio.id ? 'active' : ''}`}
                            onMouseEnter={() => setServicioActivo(servicio.id)}
                            onClick={() => {
                              setServicioActivo(servicioActivo === servicio.id ? null : servicio.id)
                            }}
                          >
                            <span className="deptos-dropdown__depto-icono">{servicio.icono}</span>
                            <span className="deptos-dropdown__depto-nombre">{servicio.nombre}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        ))}
                      </div>

                      {servicioActivo && (
                        <div className="deptos-dropdown__subcategorias">
                          <p className="deptos-dropdown__subtitulo">
                            {SERVICIOS.find(s => s.id === servicioActivo)?.nombre}
                          </p>
                          {SERVICIOS.find(s => s.id === servicioActivo)?.subcategorias.map((sub) => (
                            <button
                              key={sub.nombre}
                              className="deptos-dropdown__sub-link"
                              onClick={() => {
                                setShowServiciosMenu(false)
                                setServicioActivo(null)
                                navigate(sub.ruta)
                              }}
                            >
                              <span className="deptos-dropdown__sub-icon">•</span>
                              {sub.nombre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
            <span className="divider"></span>
            <Link to="/catalogo" className="pill-link">Nuevos Ingresos</Link>
            <Link to="/ofertas" className="pill-link">Ofertas</Link>
            <Link to="/hospitalaria" className="pill-link">Hospitalaria</Link>
            <Link to="/farmacia" className="pill-link">Farmacia</Link>
            <Link to="/catalogo?categoria=Pediatrico" className="pill-link">Para niños</Link>
          </div>
        </nav>
      </header>
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
