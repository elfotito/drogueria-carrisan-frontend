import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import './Auth.css'

function Registro() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [emailBloqueado, setEmailBloqueado] = useState(!!searchParams.get('email'))
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (honeypot) {
      setError('No se pudo crear la cuenta. Intentá de nuevo.')
      return
    }

    if (!aceptaTerminos) {
      setError('Tenés que aceptar los términos y condiciones para continuar.')
      return
    }

    setCargando(true)
    try {
      // Nunca mandamos es_admin desde acá -- ese campo solo lo debería
      // poder asignar un admin desde el panel de Usuarios.
      await api.post('/auth/register', { email, password, nombre })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
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

        <h1>Crear tu cuenta</h1>
        <p className="auth-subtitulo">
          Completá tus datos para solicitar acceso a la plataforma.
        </p>

        {emailBloqueado ? (
          <div className="auth-email-confirmado">
            <span>{email}</span>
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => setEmailBloqueado(false)}
            >
              Cambiar
            </button>
          </div>
        ) : null}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!emailBloqueado && (
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
          )}

          <label className="auth-field">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="auth-field">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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

          <div className="auth-terminos">
            <label className="auth-terminos__check">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
              />
              <span>
                Acepto los{' '}
                <button
                  type="button"
                  className="auth-terminos__link"
                  onClick={() => setMostrarTerminos((v) => !v)}
                >
                  términos y condiciones
                </button>
              </span>
            </label>

            {mostrarTerminos && (
              <div className="auth-terminos__texto">
                <p>
                  Tus datos (nombre, correo, y los que agregues luego como RIF
                  o dirección) se usan únicamente para gestionar tu cuenta,
                  procesar tus pedidos y facturación con Droguería Carrisán,
                  C.A. No se comparten con terceros ajenos a esta operación.
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>

        <p className="auth-footer-rif">RIF J-40068410-2</p>
      </div>
    </div>
  )
}

export default Registro