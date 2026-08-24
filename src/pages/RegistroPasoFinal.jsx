import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePush } from '../hooks/usePush'
import TurnstileWidget from '../components/registro/TurnstileWidget'
import api from '../api/axios'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

/**
 * Último paso del registro, compartido por los 3 tipos de usuario.
 * Espera recibir por location.state: { email, tipo_usuario, estado,
 * ciudad, telefono, perfil } — armado por RegistroInstitucional /
 * RegistroProfesional / RegistroHonorifico antes de navegar acá.
 *
 * Flujo:
 *  1. Usuario define contraseña
 *  2. Resuelve Turnstile (verificación anti-bot)
 *  3. Submit a POST /auth/register con todo el payload junto
 *  4. Si OK: login automático con las mismas credenciales
 *  5. Ofrece activar notificaciones push (requiere sesión, por eso va
 *     después del login, no antes)
 */
function RegistroPasoFinal() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { soportado: pushSoportado, estado: estadoPush, pidiendoPermiso, pedirPermiso } = usePush()

  const datosRegistro = location.state

  // Nombre de pila para la bienvenida: Profesional/Honorífico tienen
  // "nombre" directo; Institucional no tiene persona física como tal,
  // así que usamos el nombre del representante que dio de alta la cuenta.
  const nombrePila = datosRegistro?.perfil?.nombre || datosRegistro?.perfil?.nombre_representante?.split(' ')[0] || ''

  // Género para "Bienvenido/Bienvenida": lo inferimos del tratamiento
  // (Sra./Lcda./Dra.) cuando existe; si no hay pista, usamos la forma neutra.
  const tratamientoOTitulo = datosRegistro?.perfil?.tratamiento || datosRegistro?.perfil?.titulo || ''
  const terminacionGenero = /^(Sra\.|Lcda\.|Dra\.)/.test(tratamientoOTitulo) ? 'a' : 'o'

  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registroCompleto, setRegistroCompleto] = useState(false)

  // Si alguien llega directo a esta URL sin pasar por un formulario
  // (recarga de página, link directo, etc.), no tenemos datos para
  // registrar — lo mandamos de vuelta al selector de tipo.
  if (!datosRegistro) {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <h1 className="auth-title">Sesión de registro no encontrada</h1>
          <p className="auth-subtitle">
            Parece que recargaste la página o llegaste acá por otro camino. Empecemos de nuevo.
          </p>
          <button className="auth-btn-primary" onClick={() => navigate('/registro')}>
            Volver al registro
          </button>
        </main>
      </div>
    )
  }

  function validar() {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!turnstileToken) {
      setError('Completa la verificación de seguridad')
      return false
    }
    return true
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validar()) return

    setCargando(true)
    try {
      await api.post('/auth/register', {
        email: datosRegistro.email,
        password,
        tipo_usuario: datosRegistro.tipo_usuario,
        estado: datosRegistro.estado,
        ciudad: datosRegistro.ciudad,
        telefono: datosRegistro.telefono,
        perfil: datosRegistro.perfil,
        turnstileToken,
      })

      // Cuenta creada — logueamos automáticamente con las mismas
      // credenciales para no hacerle escribir el email/password de nuevo.
      await login(datosRegistro.email, password)
      setRegistroCompleto(true)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  function terminarSinPush() {
    navigate('/')
  }

  // Pantalla de cierre: cuenta ya creada y logueada, ofrece activar push.
  if (registroCompleto) {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <div className="auth-exito-icono">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="auth-title">
            {nombrePila ? `¡Bienvenido${terminacionGenero}, ${nombrePila}!` : '¡Bienvenido a Droguería Carrisán!'}
          </h1>
          <p className="auth-subtitle">
            Tu cuenta fue creada con éxito. Ya formás parte de nuestra comunidad y podés empezar a
            explorar el catálogo cuando quieras.
          </p>

          <p className="auth-push-pregunta">
            ¿Querés recibir notificaciones sobre tus pedidos directo en tu celular o computadora?
          </p>

          {!pushSoportado ? (
            <button className="auth-btn-primary" onClick={terminarSinPush}>
              Ir a la tienda
            </button>
          ) : estadoPush === 'concedido' ? (
            <>
              <p className="auth-push-confirmado">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Notificaciones activadas
              </p>
              <button className="auth-btn-primary" onClick={terminarSinPush}>
                Ir a la tienda
              </button>
            </>
          ) : (
            <div className="auth-push-opciones">
              <button className="auth-btn-primary" onClick={pedirPermiso} disabled={pidiendoPermiso}>
                {pidiendoPermiso ? 'Activando...' : 'Sí, activar notificaciones'}
              </button>
              <button type="button" className="auth-link-btn" onClick={terminarSinPush}>
                Ahora no
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <main className="auth-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Creá tu contraseña</h1>
        <p className="auth-subtitle">Último paso para completar tu registro</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="registro-campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="registro-campo">
            <label htmlFor="confirmar-password">Confirmar contraseña</label>
            <input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
            />
          </div>

          <TurnstileWidget onVerificado={setTurnstileToken} onExpirado={() => setTurnstileToken('')} />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn-primary" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default RegistroPasoFinal