import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import staffApi from '../../api/staffAxios'
import LayoutStaff from '../../components/staff/LayoutStaff'
import { NAV_STAFF, ROLES_BRIDGE_ADMIN } from '../../components/staff/NavStaff'
import './StaffDashboard.css'

const ICONOS_MAPA = {}
for (const grupo of NAV_STAFF) {
  for (const item of grupo.items) {
    ICONOS_MAPA[item.id] = item.icono
  }
}

function StaffDashboard() {
  const { staff, logoutStaff } = useStaffAuth()
  const [entrandoAAdmin, setEntrandoAAdmin] = useState(false)
  const [errorBridge, setErrorBridge] = useState('')
  const rol = staff?.rol

  const puedeBridge = ROLES_BRIDGE_ADMIN.includes(rol)

  // Módulos visibles según el rol, agrupados por su grupo de nav.
  const modulos = NAV_STAFF
    .map((grupo) => ({
      titulo: grupo.titulo,
      items: grupo.items.filter((item) => item.roles.includes(rol)),
    }))
    .filter((grupo) => grupo.items.length > 0)

  async function entrarAAdmin() {
    setErrorBridge('')
    setEntrandoAAdmin(true)
    try {
      const { data } = await staffApi.post('/staff/admin-bridge')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/admin'
    } catch (err) {
      setErrorBridge(err.response?.data?.error || 'No se pudo entrar al panel administrativo')
      setEntrandoAAdmin(false)
    }
  }

  return (
    <LayoutStaff activo="dashboard" titulo="Dashboard">
      <header className="staff-dashboard-header">
        <div>
          <p className="staff-dashboard-saludo">Hola, {staff?.nombre}</p>
          <p className="staff-dashboard-rol">{rol}</p>
        </div>
        <button className="staff-dashboard-logout" onClick={logoutStaff}>
          Salir
        </button>
      </header>

      {errorBridge && <p className="staff-dashboard-error">{errorBridge}</p>}

      {modulos.map((grupo) => (
        <section key={grupo.titulo} className="staff-dashboard-grupo">
          <h2 className="staff-dashboard-grupo-titulo">{grupo.titulo}</h2>
          <div className="staff-dashboard-grid">
            {grupo.items.map((item) => {
              const Icono = ICONOS_MAPA[item.id]
              return (
                <Link key={item.id} to={item.to} className="staff-dashboard-card">
                  {Icono && <Icono size={26} className="staff-dashboard-card-icono" />}
                  <span className="staff-dashboard-card-titulo">{item.texto}</span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {puedeBridge && (
        <section className="staff-dashboard-grupo">
          <h2 className="staff-dashboard-grupo-titulo">Administración</h2>
          <div className="staff-dashboard-grid">
            <button
              type="button"
              className="staff-dashboard-card staff-dashboard-card--boton"
              onClick={entrarAAdmin}
              disabled={entrandoAAdmin}
            >
              <span className="staff-dashboard-card-icono staff-dashboard-card-icono--emoji">⚙️</span>
              <span className="staff-dashboard-card-titulo">
                {entrandoAAdmin ? 'Entrando...' : 'Panel administrativo'}
              </span>
            </button>
          </div>
        </section>
      )}
    </LayoutStaff>
  )
}

export default StaffDashboard
