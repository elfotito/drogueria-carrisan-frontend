import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import './Auth.css'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function Registro() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
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

    // Honeypot: si un bot llenó este campo, cortamos acá sin llegar al backend.
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
      setError(err.response?.data?.message || 'Error al crear la cuenta')
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
          <h1>Sumate como cliente.</h1>
          <p>
            Creá tu cuenta para ver precios, hacer pedidos y llevar el control
            de tu historial con nosotros.
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
          <h2>Crear cuenta</h2>
          <p className="auth-form__subtitulo">
            Completá tus datos para solicitar acceso.
          </p>

          {error && <div className="auth-error">{error}</div>}

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
              autoComplete="new-password"
              required
            />
          </label>

          {/* Honeypot */}
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

          {/* Términos y condiciones */}
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
                <p>
                  Al registrarte, tu cuenta queda sujeta a activación por
                  parte de un administrador antes de poder operar en la
                  plataforma.
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Registro