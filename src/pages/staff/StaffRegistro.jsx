import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import TurnstileWidget from '../../components/registro/TurnstileWidget'
import { validarEmail, validarPassword } from '../../utils/validadores'
import { useStaffAuth } from '../../context/StaffAuthContext'
import api from '../../api/axios'
import staffApi from '../../api/staffAxios'
import logo from '../../assets/minilogo color sin fondo.png'
import '../Auth.css'
import './StaffRegistro.css'

const ROLES_STAFF = {
  vendedor: 'Vendedor',
  despachador: 'Despachador',
  almacenista: 'Almacenista',
  contabilidad: 'Contabilidad',
  administrador: 'Administrador',
  director: 'Director',
  admin: 'Administrador',
}

function StaffRegistro() {
  const navigate = useNavigate()
  const { iniciarSesionConDatos } = useStaffAuth()

  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [codigoValido, setCodigoValido] = useState(false)
  const [rolAsignado, setRolAsignado] = useState(null)
  const [errorCodigo, setErrorCodigo] = useState('')

  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  function calcularFuerzaPassword(pw) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { width: '20%', color: '#e53e3e', label: 'Débil' }
    if (score <= 3) return { width: '60%', color: '#dd6b20', label: 'Media' }
    if (score === 4) return { width: '80%', color: '#38a169', label: 'Fuerte' }
    return { width: '100%', color: '#276749', label: 'Muy fuerte' }
  }

  async function verificarCodigo(e) {
    e.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    if (!limpio) {
      setErrorCodigo('Ingresa tu código de invitación')
      return
    }

    setErrorCodigo('')
    setVerificando(true)
    try {
      const { data } = await api.post('/auth/verificar-codigo', { codigo: limpio, tipo: 'staff' })
      setCodigoValido(true)
      setRolAsignado(data.rol_staff || null)
    } catch (err) {
      setErrorCodigo(err.response?.data?.error || 'No se pudo verificar el código')
    } finally {
      setVerificando(false)
    }
  }

  function volverAlCodigo() {
    setCodigoValido(false)
    setRolAsignado(null)
    setErrorGeneral('')
  }

  function validarFormulario() {
    const nuevosErrores = {}
    if (!validarEmail(email)) nuevosErrores.email = 'Ingresa un correo válido'
    if (!nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    const pwCheck = validarPassword(password)
    if (!pwCheck.valido) nuevosErrores.password = pwCheck.error
    if (password !== confirmarPassword) nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
    if (!turnstileToken) nuevosErrores.turnstile = 'Completa la verificación de seguridad'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarFormulario()) {
      document.querySelector('.registro-input--error, [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setCargando(true)
    try {
      const { data } = await staffApi.post('/staff/registro', {
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        password,
        codigo: codigo.trim().toUpperCase(),
        turnstileToken,
      })
      // Auto-login: el backend devuelve token + staff, igual que /staff/login.
      iniciarSesionConDatos(data)
      navigate('/staff/dashboard')
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const fuerzaPassword = calcularFuerzaPassword(password)

  if (!codigoValido) {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <Link to="/staff/login" className="auth-logo">
            <img src={logo} alt="Logo" className="logologin" />
          </Link>

          <h1 className="auth-title">Código de invitación</h1>
          <p className="auth-subtitle">
            El registro de personal es exclusivo para quienes tienen un código
            generado por la administración. Ingresa el código que te compartieron.
          </p>

          <form onSubmit={verificarCodigo} className="auth-form">
            <div className="registro-campo">
              <label htmlFor="codigo">Código de invitación</label>
              <input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: ABC123"
                className={errorCodigo ? 'registro-input--error' : ''}
                aria-invalid={!!errorCodigo}
                aria-describedby={errorCodigo ? 'codigo-error' : undefined}
                autoFocus
              />
              {errorCodigo && <span id="codigo-error" className="registro-error-texto" role="alert">{errorCodigo}</span>}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={verificando}>
              {verificando ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tenés acceso? <Link to="/staff/login">Iniciá sesión</Link>
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <main className="auth-container auth-container--registro">
        <Link to="/staff/login" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Completa tu registro</h1>
        <p className="auth-subtitle">Código verificado — ya podés completar tus datos</p>

        <div className="staff-registro-rol">
          Rol asignado:{' '}
          <span className="staff-registro-rol-badge">
            {ROLES_STAFF[rolAsignado] || rolAsignado || 'Personal'}
          </span>
          <button type="button" className="staff-registro-cambiar" onClick={volverAlCodigo}>
            Cambiar código
          </button>
        </div>

        {errorGeneral && <div className="auth-error">{errorGeneral}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="registro-campo">
            <label htmlFor="email">Correo electrónico (para iniciar sesión)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errores.email ? 'registro-input--error' : ''}
              aria-invalid={!!errores.email}
              aria-describedby={errores.email ? 'email-error' : undefined}
              autoComplete="email"
              autoFocus
            />
            {errores.email && <span id="email-error" className="registro-error-texto" role="alert">{errores.email}</span>}
          </div>

          <div className="registro-campo">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={errores.nombre ? 'registro-input--error' : ''}
              aria-invalid={!!errores.nombre}
              aria-describedby={errores.nombre ? 'nombre-error' : undefined}
              autoComplete="name"
              placeholder="Ej: María Pérez"
            />
            {errores.nombre && <span id="nombre-error" className="registro-error-texto" role="alert">{errores.nombre}</span>}
          </div>

          <div className="registro-campo">
            <label htmlFor="password">Contraseña</label>
            <div className="registro-input-con-toggle">
              <input
                id="password"
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errores.password ? 'registro-input--error' : ''}
                aria-invalid={!!errores.password}
                aria-describedby={errores.password ? 'password-error' : undefined}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres con letras y números"
              />
              <button
                type="button"
                className="registro-password-toggle"
                onClick={() => setMostrarPassword((v) => !v)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {password && (
              <div className="registro-password-fortaleza">
                <div className="registro-password-fortaleza-barra">
                  <span style={{ width: fuerzaPassword.width, background: fuerzaPassword.color }} />
                </div>
                <span className="registro-password-fortaleza-texto" style={{ color: fuerzaPassword.color }}>
                  {fuerzaPassword.label}
                </span>
              </div>
            )}
            {errores.password && <span id="password-error" className="registro-error-texto" role="alert">{errores.password}</span>}
          </div>

          <div className="registro-campo">
            <label htmlFor="confirmarPassword">Confirmar contraseña</label>
            <div className="registro-input-con-toggle">
              <input
                id="confirmarPassword"
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className={errores.confirmarPassword ? 'registro-input--error' : ''}
                aria-invalid={!!errores.confirmarPassword}
                aria-describedby={errores.confirmarPassword ? 'confirmar-error' : undefined}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                className="registro-password-toggle"
                onClick={() => setMostrarConfirmar((v) => !v)}
                aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarConfirmar ? '🙈' : '👁️'}
              </button>
            </div>
            {errores.confirmarPassword && (
              <span id="confirmar-error" className="registro-error-texto" role="alert">{errores.confirmarPassword}</span>
            )}
          </div>

          <div className="registro-campo">
            <TurnstileWidget onVerificado={setTurnstileToken} onExpirado={() => setTurnstileToken('')} />
            {errores.turnstile && <span className="registro-error-texto" role="alert">{errores.turnstile}</span>}
          </div>

          <button type="submit" className="auth-btn-primary" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tenés acceso? <Link to="/staff/login">Iniciá sesión</Link>
        </p>
      </main>
    </div>
  )
}

export default StaffRegistro