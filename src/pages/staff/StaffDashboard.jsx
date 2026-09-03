import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import staffApi from '../../api/staffAxios'
import './StaffDashboard.css'

const ENLACES = [
  {
    to: '/staff/despacho',
    titulo: 'Envíos por despachar',
    descripcion: 'Órdenes listas para entregar',
    roles: ['despachador', 'administrador', 'admin'],
    icono: '🚚',
  },
  {
    to: '/staff/ordenes',
    titulo: 'Crear orden a cliente',
    descripcion: 'Nuevo pedido a nombre de un cliente',
    roles: ['vendedor', 'administrador', 'admin'],
    icono: '🧾',
  },
]

const ENLACE_ADMIN = {
  titulo: 'Administrativo',
  descripcion: 'Inventario, precios y reportes',
  roles: ['administrador', 'admin'],
  icono: '⚙️',
}

function StaffDashboard() {
  const { staff, logoutStaff } = useStaffAuth()
  const [entrandoAAdmin, setEntrandoAAdmin] = useState(false)
  const [errorBridge, setErrorBridge] = useState('')
  const enlacesVisibles = ENLACES.filter((e) => e.roles.includes(staff?.rol))
  const puedeVerAdmin = ENLACE_ADMIN.roles.includes(staff?.rol)

  async function entrarAAdmin() {
    setErrorBridge('')
    setEntrandoAAdmin(true)
    try {
      const { data } = await staffApi.post('/staff/admin-bridge')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      // navigate() de React Router no sirve acá: AuthContext ya está
      // montado con su token viejo en memoria y no relee localStorage
      // solo porque nosotros lo escribimos. Una recarga completa fuerza
      // ese re-montaje y toma la sesión recién puenteada.
      window.location.href = '/admin'
    } catch (err) {
      setErrorBridge(err.response?.data?.error || 'No se pudo entrar al panel administrativo')
      setEntrandoAAdmin(false)
    }
  }

  return (
    <div className="staff-dashboard">
      <header className="staff-dashboard-header">
        <div>
          <p className="staff-dashboard-saludo">Hola, {staff?.nombre}</p>
          <p className="staff-dashboard-rol">{staff?.rol}</p>
        </div>
        <button className="staff-dashboard-logout" onClick={logoutStaff}>
          Salir
        </button>
      </header>

      {errorBridge && <p className="staff-dashboard-error">{errorBridge}</p>}

      <div className="staff-dashboard-grid">
        {enlacesVisibles.map((enlace) => (
          <Link key={enlace.to} to={enlace.to} className="staff-dashboard-card">
            <span className="staff-dashboard-card-icono">{enlace.icono}</span>
            <span className="staff-dashboard-card-titulo">{enlace.titulo}</span>
            <span className="staff-dashboard-card-desc">{enlace.descripcion}</span>
          </Link>
        ))}

        {puedeVerAdmin && (
          <button
            type="button"
            className="staff-dashboard-card staff-dashboard-card--boton"
            onClick={entrarAAdmin}
            disabled={entrandoAAdmin}
          >
            <span className="staff-dashboard-card-icono">{ENLACE_ADMIN.icono}</span>
            <span className="staff-dashboard-card-titulo">
              {entrandoAAdmin ? 'Entrando...' : ENLACE_ADMIN.titulo}
            </span>
            <span className="staff-dashboard-card-desc">{ENLACE_ADMIN.descripcion}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard