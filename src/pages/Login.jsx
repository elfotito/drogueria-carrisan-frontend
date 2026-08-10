import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo/minilogo color sin fondo.png';
import api from '../api/axios'
import './Auth.css'

function esEmailValido(email) {
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
      <main className="auth-container">
            <Link to="/" className="auth-logo">
              <img 
                src={logo} 
                alt="Logo" 
                className="logologin"
              />
            </Link>

        {sesionExpirada && (
          <div className="auth-banner">
            Tu sesión expiró. Iniciá sesión de nuevo para continuar.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        {paso === 'email' ? (
          <>
            <h1 className="auth-title">Iniciar sesión o crear tu cuenta</h1>
            <p className="auth-subtitle">
              ¿No estas seguro si tienes una cuenta? Ingresá tu correo y vemos si ya tienes una cuenta con nosotros.
            </p>

            <form className="auth-form" onSubmit={handleContinuar}>
              <div className="auth-input-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              {/* Honeypot oculta para anti-spam */}
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

              <p className="auth-privacy-text">
                Proteger tu información personal es nuestra prioridad.<br />
                Ve nuestras politicas de privacidad
              </p>

              <button type="submit" className="auth-btn-primary" disabled={cargando}>
                {cargando ? 'Verificando...' : 'Continuar'}
              </button>
            </form>

            {/* Tarjeta promocional inferior */}
            <div className="auth-promo-card">
              <h2 className="auth-promo-title">Somos <span className="text-blue">Carrisan</span></h2>
              <p className="auth-promo-subtitle">¿Compras insumos médicos de forma habitual para tu negocio o institución?</p>
              <button 
                type="button" 
                className="auth-btn-secondary"
                onClick={() => navigate('/registro-empresas')}
              >
                Crear una cuenta corporativa
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="auth-title">Ingresá tu contraseña</h1>

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

            <form className="auth-form" onSubmit={handleIngresar}>
              <div className="auth-input-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </div>

              <div className="auth-olvido-wrapper">
                <Link to="/recuperar" className="auth-olvido">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" className="auth-btn-primary" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </>
        )}
      </main>

      {/* Footer inferior */}
      <footer className="auth-footer">
        <div className="auth-footer-content">
          <span className="auth-footer-rif">RIF J-40068410-2</span>
          <div className="auth-footer-links">
            <Link to="/terminos">Términos de uso</Link>
            <Link to="/privacidad">Aviso de privacidad</Link>
            <Link to="/contacto">Soporte</Link>
          </div>
          © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

export default Login