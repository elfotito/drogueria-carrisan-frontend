import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('') // campo trampa, invisible para humanos
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sesionExpirada = searchParams.get('expirado') === '1'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Si el campo trampa viene lleno, lo llenó un bot (un humano nunca lo ve).
    // Respondemos igual que credenciales incorrectas, sin pistas adicionales,
    // y sin llegar a golpear el backend.
    if (honeypot) {
      setError('Correo o contraseña incorrectos')
      return
    }

    setCargando(true)
    try {
      const user = await login(email, password)
      navigate(user.es_admin ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Correo o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ---------- Panel de marca ---------- */}
      <div className="auth-brand">
        <div className="auth-brand__content">
          <span className="auth-brand__logo">
            <span className="auth-brand__dot auth-brand__dot--teal" />
            <span className="auth-brand__dot auth-brand__dot--indigo" />
            Carrisán
          </span>
          <h1>Bienvenido de vuelta.</h1>
          <p>
            Accedé a tu catálogo, tus pedidos y tu cuenta con nosotros — todo
            en un solo lugar.
          </p>
        </div>

        <div className="auth-pastillero" aria-hidden="true">
          {DIAS.map((dia, i) => (
            <div className="auth-pastillero__slot" key={i} style={{ '--i': i }}>
              <span className="auth-pastillero__dia">{dia}</span>
              {(i === 1 || i === 4) && <span className="auth-pastillero__pill" />}
            </div>
          ))}
        </div>

        <span className="auth-brand__rif">RIF J-40068410-2</span>
      </div>

      {/* ---------- Panel de formulario ---------- */}
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>
          <p className="auth-form__subtitulo">Ingresá con tu correo y contraseña.</p>

          {sesionExpirada && (
            <div className="auth-banner">
              Tu sesión expiró. Iniciá sesión de nuevo para continuar.
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <label className="auth-field">
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-field">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {/* Honeypot: oculto por posición (no display:none), fuera del tab order */}
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
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/registro">Solicitala acá</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login