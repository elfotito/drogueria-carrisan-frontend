import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Auth.css'

// Validación básica de email
function esEmailValido(email) {
  // Debe contener @, terminar en .algo (mínimo 2 caracteres después del punto)
  // y no tener espacios
  const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

function Login() {
  const [paso, setPaso] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sesionExpirada = searchParams.get('expirado') === '1'

  async function handleContinuar(e) {
    e.preventDefault()
    setError('')

    // Validación de email antes de llamar al backend
    const emailLimpio = email.trim().toLowerCase()
    setEmail(emailLimpio)

    if (!esEmailValido(emailLimpio)) {
      setError('Ingresá un correo electrónico válido (ejemplo@correo.com)')
      return
    }

    if (honeypot) {
      setError('No se pudo procesar la solicitud')
      return
    }

    setCargando(true)
    try {
      const { data } = await api.post('/auth/check-email', { email: emailLimpio })
      if (data.existe) {
        setPaso('password')
      } else {
        navigate(`/registro?email=${encodeURIComponent(emailLimpio)}`)
      }
    } catch (err) {
      setError('No se pudo verificar el correo. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  async function handleIngresar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const user = await login(email, password)
      navigate(user.es_admin ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-dot auth-logo-dot--teal" />
          <span className="auth-logo-dot auth-logo-dot--indigo" />
          Carrisán
        </Link>

        {paso === 'email' ? (
          <>
            <h1>Iniciar sesión o crear tu cuenta</h1>
            <p className="auth-subtitulo">
              Ingresá tu correo y vemos si ya tenés cuenta con nosotros.
            </p>

            {sesionExpirada && (
              <div className="auth-banner">
                Tu sesión expiró. Iniciá sesión de nuevo para continuar.
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleContinuar}>
              <label className="auth-field">
                Correo electrónico
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </label>

              <div className="auth-honeypot" aria-hidden="true">
                <label htmlFor="sitio_web">Sitio web</label>
                <input
                  id="sitio_web"
                  name="sitio_web"
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-submit" disabled={cargando}>
                {cargando ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Ingresá tu contraseña</h1>

            <div className="auth-email-confirmado">
              <span>{email}</span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setPaso('email')
                  setPassword('')
                  setError('')
                }}
              >
                Cambiar
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleIngresar}>
              <label className="auth-field">
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </label>

              <Link to="/recuperar" className="auth-olvido">
                ¿Olvidaste tu contraseña?
              </Link>

              <button type="submit" className="auth-submit" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer-rif">RIF J-40068410-2</p>
      </div>
    </div>
  )
}

export default Login