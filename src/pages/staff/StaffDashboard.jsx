import { Link } from 'react-router-dom'
import { useStaffAuth } from '../../context/StaffAuthContext'
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
  {
    to: '/admin',
    titulo: 'Administrativo',
    descripcion: 'Inventario, precios y reportes',
    roles: ['administrador', 'admin'],
    icono: '⚙️',
  },
]

function StaffDashboard() {
  const { staff, logoutStaff } = useStaffAuth()
  const enlacesVisibles = ENLACES.filter((e) => e.roles.includes(staff?.rol))

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

      <div className="staff-dashboard-grid">
        {enlacesVisibles.map((enlace) => (
          <Link key={enlace.to} to={enlace.to} className="staff-dashboard-card">
            <span className="staff-dashboard-card-icono">{enlace.icono}</span>
            <span className="staff-dashboard-card-titulo">{enlace.titulo}</span>
            <span className="staff-dashboard-card-desc">{enlace.descripcion}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default StaffDashboard