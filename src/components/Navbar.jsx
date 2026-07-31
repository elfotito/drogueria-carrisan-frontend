import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav>
      <Link to="/catalogo">Catálogo</Link>

      {user ? (
        <>
          <Link to="/carrito">Carrito</Link>
          <Link to="/orders">Mis Órdenes</Link>
          {user.es_admin && <Link to="/admin">Admin</Link>}
          <span>Hola, {user.email}</span>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <Link to="/login">Ingresar</Link>
      )}
    </nav>
  )
}

export default Navbar