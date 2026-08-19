import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardAdmin from '../components/admin/DashboardAdmin'
import TasaCambio from '../components/admin/TasaCambio'
import api from '../api/axios'
import OrdenesAdmin from '../components/admin/OrdenesAdmin'
import ProductosAdmin from '../components/admin/ProductosAdmin'
import UsuariosAdmin from '../components/admin/UsuariosAdmin'
import EstadoCuentaAdmin from '../components/admin/EstadoCuentaAdmin'
import DescuentosPanel from '../components/admin/DescuentosAdmin'
import PagosAdmin from '../components/admin/PagosAdmin'
import CotizacionesAdmin from '../components/admin/CotizacionesAdmin'

import './Admin.css'

function Admin() {
  const navigate = useNavigate()
  const [seccionActiva, setSeccionActiva] = useState('dashboard')
  const [menuMobileAbierto, setMenuMobileAbierto] = useState(false)
  const { user } = useAuth()
  const secciones = [
    { id: 'dashboard', nombre: 'Resumen', icono: '📊' },
    { id: 'tasa', nombre: 'Tasa de cambio', icono: '💱' },
    { id: 'productos', nombre: 'Productos', icono: '🛍️' },
    { id: 'ordenes', nombre: 'Órdenes', icono: '📊' },
    { id: 'usuarios', nombre: 'Usuarios', icono: '👤' },
    { id: 'pagos', nombre: '💵 Pagos', icono: '💰' },
    { id: 'estadoCuenta', nombre: 'Estado de cuenta', icono: '🏦' },
    { id: 'descuentos', nombre: 'Descuentos', icono: '💎' }
{ id: 'cotizaciones', nombre: '💬 Cotizaciones', icono: '💬' },
  ]

  const seccionActual = secciones.find(s => s.id === seccionActiva)

  const getUserName = () => {
    if (!user) return 'Usuario'
    return user.nombre || user.email?.split('@')[0] || 'Usuario'
  }

  const getUserInitial = () => {
    if (!user) return '?'
    if (user.nombre) return user.nombre[0].toUpperCase()
    if (user.email) return user.email[0].toUpperCase()
    return '?'
  }

  const renderSeccion = () => {
    switch(seccionActiva) {
      case 'dashboard': return <DashboardAdmin onIrA={setSeccionActiva} />
      case 'tasa': return <TasaCambio />
      case 'productos': return <ProductosAdmin />
      case 'ordenes': return <OrdenesAdmin />
      case 'usuarios': return <UsuariosAdmin />
      case 'estadoCuenta': return <EstadoCuentaAdmin />
      case 'pagos': return <PagosAdmin />
      case 'descuentos': return <DescuentosPanel />
      default: return <TasaCambio />
case 'cotizaciones': return <CotizacionesAdmin />
    }
  }

  const handleVolver = () => {
    navigate(-1)
  }

  return (
    <div className="admin-container">
      {/* Sidebar — fija al borde real de la ventana, alto completo */}
      <nav className={`admin-sidebar ${menuMobileAbierto ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">{getUserInitial()}</span>
          <div className="brand-text">
            <span className="sidebar-user__hola">Hola,</span>
            <span className="sidebar-user__nombre">
              {getUserName()}
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
          <button className="btn-volver" onClick={handleVolver}>
              <span className="btn-volver__icon">←</span>
              <span className="btn-volver__text">Volver</span>
          </button>
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