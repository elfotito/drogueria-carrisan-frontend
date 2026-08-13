import { useState } from 'react'
import TasaCambio from '../components/admin/TasaCambio'
import OrdenesAdmin from '../components/admin/OrdenesAdmin'
import ProductosAdmin from '../components/admin/ProductosAdmin'
import UsuariosAdmin from '../components/admin/UsuariosAdmin'
import EstadoCuentaAdmin from '../components/admin/EstadoCuentaAdmin'
import DescuentosPanel from '../components/admin/DescuentosAdmin'
import BottomNav from './BottomNav'
import './Admin.css'

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('tasa')
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)

  const secciones = [
    { id: 'tasa', nombre: '💰 Tasa de Cambio', icono: '💱' },
    { id: 'productos', nombre: '📦 Productos', icono: '🛍️' },
    { id: 'ordenes', nombre: '📋 Órdenes', icono: '📊' },
    { id: 'usuarios', nombre: '👥 Usuarios', icono: '👤' },
    { id: 'estadoCuenta', nombre: '💳 Estado de Cuenta', icono: '🏦' },
    { id: 'descuentos', nombre: '🏷️ Descuentos', icono: '💎' }
  ]

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
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">
            <span className="title-icon">⚙️</span>
            Panel de Administración
          </h1>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMenuMobileAbierto(!menuMobileAbierto)}
          >
            <span className={`hamburger ${menuMobileAbierto ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        <p className="admin-subtitle">Gestiona tu tienda de manera eficiente</p>
      </header>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <nav className={`admin-sidebar ${menuMobileAbierto ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menú Admin</h3>
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
                  {seccionActiva === seccion.id && <span className="active-indicator"></span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Overlay para móvil */}
        {menuMobileAbierto && (
          <div 
            className="sidebar-overlay"
            onClick={() => setMenuMobileAbierto(false)}
          />
        )}

        {/* Main Content */}
        <main className="admin-main">
          <div className="content-wrapper">
            {renderSeccion()}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default Admin