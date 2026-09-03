import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useStaffAuth } from '../../context/StaffAuthContext'
import logo from '../../assets/minilogo color sin fondo.png'
import '../Auth.css'

function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { loginStaff } = useStaffAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sesionExpirada = searchParams.get('expirado') === '1'

  async function handleIngresar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await loginStaff(email.trim().toLowerCase(), password)
      navigate('/staff/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-container">
        <Link to="/staff/login" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        {sesionExpirada && (
          <div className="auth-banner auth-banner--warning">
            Tu sesión expiró. Iniciá sesión de nuevo para continuar.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <h1 className="auth-title">Acceso de personal</h1>
        <p className="auth-subtitle">
          Panel interno para vendedores, despachadores y administradores.
        </p>

        <form className="auth-form" onSubmit={handleIngresar}>
          <div className="auth-input-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default StaffLogin