import { useState } from 'react'
import TasaCambio from '../components/admin/TasaCambio'
import OrdenesAdmin from '../components/admin/OrdenesAdmin'
import ProductosAdmin from '../components/admin/ProductosAdmin'
import UsuariosAdmin from '../components/admin/UsuariosAdmin'
import EstadoCuentaAdmin from '../components/admin/EstadoCuentaAdmin'
import DescuentosPanel from '../components/admin/DescuentosAdmin'
import './Admin.css'

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('tasa')
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const secciones = [
    { id: 'tasa', nombre: 'Tasa de cambio', icono: '💱' },
    { id: 'productos', nombre: 'Productos', icono: '🛍️' },
    { id: 'ordenes', nombre: 'Órdenes', icono: '📊' },
    { id: 'usuarios', nombre: 'Usuarios', icono: '👤' },
    { id: 'estadoCuenta', nombre: 'Estado de cuenta', icono: '🏦' },
    { id: 'descuentos', nombre: 'Descuentos', icono: '💎' }
  ]

  const seccionActual = secciones.find(s => s.id === seccionActiva)

  const renderSeccion = () => {
    switch(seccionActiva) {
      case 'tasa': return <TasaCambio />
      case 'productos': return <ProductosAdmin />
      case 'ordenes': return <OrdenesAdmin />
      case 'usuarios': return <UsuariosAdmin />
      case 'estadoCuenta': return <EstadoCuentaAdmin />
      case 'descuentos': return <DescuentosPanel />
      default: return <TasaCambio />
    }
  }

  return (
    <div className="admin-container">
      {/* Sidebar — fija al borde real de la ventana, alto completo */}
      <nav className={`admin-sidebar ${menuMobileAbierto ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">DC</span>
          <div className="brand-text">
            <strong>Droguería Carrisan, C.A.</strong>
            <span className="sidebar-user__hola">Hola,</span>
            <span className="sidebar-user__nombre">
              {user?.email?.split('@')[0] || 'Usuario'}
            </span>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setMenuMobileAbierto(false)}
          >
            ✕
          </button>
        </div>
        <ul className="nav-list">
          {secciones.map(seccion => (
            <li key={seccion.id}>
              <button
                className={`nav-item ${seccionActiva === seccion.id ? 'active' : ''}`}
                onClick={() => {
                  setSeccionActiva(seccion.id)
                  setMenuMobileAbierto(false)
                }}
              >
                <span className="nav-icon">{seccion.icono}</span>
                <span className="nav-text">{seccion.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Overlay para móvil/tablet */}
      {menuMobileAbierto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuMobileAbierto(false)}
        />
      )}

      {/* Columna de contenido — desplazada por el ancho del sidebar */}
      <div className="admin-content-col">
        <header className="admin-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuMobileAbierto(true)}
          >
            <span className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <h1 className="topbar-title">{seccionActual?.nombre}</h1>
        </header>

        <main className="admin-main">
          <div className="content-wrapper">
            {renderSeccion()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin