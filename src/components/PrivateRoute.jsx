import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !user.es_admin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute