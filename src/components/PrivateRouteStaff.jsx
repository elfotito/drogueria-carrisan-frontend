import { Navigate } from 'react-router-dom'
import { useStaffAuth } from '../context/StaffAuthContext'

function PrivateRouteStaff({ children, rolesPermitidos = null }) {
  const { staff, loading } = useStaffAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!staff) {
    return <Navigate to="/staff/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(staff.rol)) {
    return <Navigate to="/staff/dashboard" replace />
  }

  return children
}

export default PrivateRouteStaff