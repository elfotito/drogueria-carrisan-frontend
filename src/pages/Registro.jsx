import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      // Nunca mandamos es_admin desde acá -- ese campo solo lo debería
      // poder asignar un admin desde el panel de Usuarios.
      await api.post('/auth/register', { email, password, nombre })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p>¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </form>
    </div>
  )
}

export default Registro