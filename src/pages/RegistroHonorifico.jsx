import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import Stepper from '../components/registro/Stepper'
import TurnstileWidget from '../components/registro/TurnstileWidget'
import { validarEmail, validarTelefonoVenezuela } from '../utils/validadores'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const TRATAMIENTOS = ['Sr.', 'Sra.', 'Lic.', 'Lcda.']
const PASOS = ['Datos', 'Confirmación']

function RegistroHonorifico() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [codigo, setCodigo] = useState('')
  const [verificandoCodigo, setVerificandoCodigo] = useState(false)
  const [codigoValido, setCodigoValido] = useState(false)
  const [errorCodigo, setErrorCodigo] = useState('')

  const [paso, setPaso] = useState(0)
  const [direccionPaso, setDireccionPaso] = useState('adelante')

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    tratamiento: 'Sr.',
    nombre: '',
    apellido: '',
    telCodigo: '414',
    telDigitos: '',
    estado: '',
    ciudad: ''
  })
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [notifSistema, setNotifSistema] = useState(true)
  const [notifPromociones, setNotifPromociones] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registroCompleto, setRegistroCompleto] = useState(false)

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function verificarCodigo(e) {
    e.preventDefault()
    const codigoLimpio = codigo.trim().toUpperCase()
    if (!codigoLimpio) {
      setErrorCodigo('Ingresa tu código de invitación')
      return
    }

    setErrorCodigo('')
    setVerificandoCodigo(true)
    try {
      await api.post('/auth/verificar-codigo', { codigo: codigoLimpio })
      setCodigoValido(true)
    } catch (err) {
      setErrorCodigo(err.response?.data?.error || 'No se pudo verificar el código')
    } finally {
      setVerificandoCodigo(false)
    }
  }

  function avanzarPaso() {
    setDireccionPaso('adelante')
    setPaso((prev) => prev + 1)
  }

  function retrocederPaso() {
    setDireccionPaso('atras')
    setPaso((prev) => prev - 1)
  }

  function validarPaso0() {
    const nuevosErrores = {}

    if (!validarEmail(form.email)) nuevosErrores.email = 'Ingresa un correo válido'
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Campo requerido'

    const telCheck = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)
    if (!telCheck.valido) nuevosErrores.telefono = telCheck.error

    if (!form.estado) nuevosErrores.estado = 'Selecciona un estado'
    if (!form.ciudad) nuevosErrores.ciudad = 'Selecciona una ciudad'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function validarPaso1() {
    const nuevosErrores = {}
    if (!aceptaTerminos) nuevosErrores.terminos = 'Debes aceptar los términos para continuar'
    if (password.length < 8) nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres'
    if (password !== confirmarPassword) nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
    if (!turnstileToken) nuevosErrores.turnstile = 'Completa la verificación de seguridad'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function handleSiguiente() {
    let valido = false
    if (paso === 0) valido = validarPaso0()
    else if (paso === 1) valido = validarPaso1()

    if (!valido) {
      document.querySelector('.registro-input--error, [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (paso < 1) {
      avanzarPaso()
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setErrorGeneral('')
    setCargando(true)
    try {
      const { telefonoFormateado } = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)

      await api.post('/auth/register', {
        email: form.email.trim().toLowerCase(),
        password,
        tipo_usuario: 'honorifico',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telefonoFormateado,
        notificaciones_sistema: notifSistema,
        notificaciones_promociones: notifPromociones,
        perfil: {
          tratamiento: form.tratamiento,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          codigo_invitacion: codigo.trim().toUpperCase()
        },
        turnstileToken,
      })

      await login(form.email.trim().toLowerCase(), password)
      setRegistroCompleto(true)
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  if (registroCompleto) {
    const nombrePila = form.nombre.split(' ')[0]
    const terminacionGenero = /^(Sra\.|Lcda\.|Dra\.)/.test(form.tratamiento) ? 'a' : 'o'

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
          <button className="auth-btn-primary" onClick={() => navigate('/')}>
            Ir a la tienda
          </button>
        </main>
      </div>
    )
  }

  if (!codigoValido) {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <Link to="/" className="auth-logo">
            <img src={logo} alt="Logo" className="logologin" />
          </Link>

          <h1 className="auth-title">Código de invitación</h1>
          <p className="auth-subtitle">
            El registro Honorífico es exclusivo para quienes ya forman parte de nuestra comunidad.
            Ingresa el código que te compartimos.
          </p>

          <form onSubmit={verificarCodigo} className="auth-form">
            <div className="registro-campo">
              <label htmlFor="codigo">Código de invitación</label>
              <input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej: CARRISAN2026"
                className={errorCodigo ? 'registro-input--error' : ''}
                autoFocus
              />
              {errorCodigo && <span className="registro-error-texto">{errorCodigo}</span>}
            </div>

            <button type="submit" className="auth-btn-primary" disabled={verificandoCodigo}>
              {verificandoCodigo ? 'Verificando...' : 'Verificar código'}
            </button>
          </form>
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

        <h1 className="auth-title">Completa tu registro</h1>
        <p className="auth-subtitle">Código verificado — ya podés completar tus datos</p>

        <Stepper pasos={PASOS} pasoActual={paso} />

        <div className={`registro-paso-contenedor ${direccionPaso === 'atras' ? 'registro-paso-contenedor--atras' : ''}`} key={paso}>
          {paso === 0 && (
            <>
              <div className="registro-campo">
                <label htmlFor="email">Correo electrónico (para iniciar sesión)</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => actualizarCampo('email', e.target.value)}
                  className={errores.email ? 'registro-input--error' : ''}
                />
                {errores.email && <span className="registro-error-texto">{errores.email}</span>}
              </div>

              <div className="registro-campo-doble">
                <div className="registro-campo">
                  <label htmlFor="tratamiento">Tratamiento</label>
                  <select
                    id="tratamiento"
                    value={form.tratamiento}
                    onChange={(e) => actualizarCampo('tratamiento', e.target.value)}
                  >
                    {TRATAMIENTOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="registro-campo">
                  <label htmlFor="telefono">Teléfono</label>
                  <div className="registro-campo-telefono">
                    <select
                      value={form.telCodigo}
                      onChange={(e) => actualizarCampo('telCodigo', e.target.value)}
                      aria-label="Código de teléfono"
                    >
                      {CODIGOS_TELEFONO.map((c) => (
                        <option key={c} value={c}>0{c}</option>
                      ))}
                    </select>
                    <input
                      id="telefono"
                      inputMode="numeric"
                      maxLength={7}
                      placeholder="1234567"
                      value={form.telDigitos}
                      onChange={(e) => actualizarCampo('telDigitos', e.target.value.replace(/\D/g, ''))}
                      className={errores.telefono ? 'registro-input--error' : ''}
                    />
                  </div>
                  {errores.telefono && <span className="registro-error-texto">{errores.telefono}</span>}
                </div>
              </div>

              <div className="registro-campo-doble">
                <div className="registro-campo">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
                    className={errores.nombre ? 'registro-input--error' : ''}
                  />
                  {errores.nombre && <span className="registro-error-texto">{errores.nombre}</span>}
                </div>
                <div className="registro-campo">
                  <label htmlFor="apellido">Apellido</label>
                  <input
                    id="apellido"
                    value={form.apellido}
                    onChange={(e) => actualizarCampo('apellido', e.target.value)}
                    className={errores.apellido ? 'registro-input--error' : ''}
                  />
                  {errores.apellido && <span className="registro-error-texto">{errores.apellido}</span>}
                </div>
              </div>

              <SelectorEstadoCiudad
                estado={form.estado}
                ciudad={form.ciudad}
                onChangeEstado={(v) => actualizarCampo('estado', v)}
                onChangeCiudad={(v) => actualizarCampo('ciudad', v)}
                errorEstado={errores.estado}
                errorCiudad={errores.ciudad}
              />
            </>
          )}

          {paso === 1 && (
            <>
              <div className="registro-notificaciones">
                <div className="registro-notif-grupo">
                  <label>¿Desea recibir notificaciones del sistema?</label>
                  <div className="registro-notif-opciones">
                    <label>
                      <input
                        type="radio"
                        name="notifSistema"
                        checked={notifSistema === true}
                        onChange={() => setNotifSistema(true)}
                      />
                      Sí
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="notifSistema"
                        checked={notifSistema === false}
                        onChange={() => setNotifSistema(false)}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="registro-notif-grupo">
                  <label>¿Desea recibir notificaciones de promociones?</label>
                  <div className="registro-notif-opciones">
                    <label>
                      <input
                        type="radio"
                        name="notifPromociones"
                        checked={notifPromociones === true}
                        onChange={() => setNotifPromociones(true)}
                      />
                      Sí
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="notifPromociones"
                        checked={notifPromociones === false}
                        onChange={() => setNotifPromociones(false)}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <label className="registro-checkbox">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <span>
                  Acepto la <Link to="/privacidad">política de privacidad</Link> y
                  los <Link to="/terminos">términos de uso</Link>
                </span>
              </label>
              {errores.terminos && <span className="registro-error-texto">{errores.terminos}</span>}

              <div className="registro-campo">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={errores.password ? 'registro-input--error' : ''}
                />
                {errores.password && <span className="registro-error-texto">{errores.password}</span>}
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
                  className={errores.confirmarPassword ? 'registro-input--error' : ''}
                />
                {errores.confirmarPassword && <span className="registro-error-texto">{errores.confirmarPassword}</span>}
              </div>

              <TurnstileWidget onVerificado={setTurnstileToken} onExpirado={() => setTurnstileToken('')} />
              {errores.turnstile && <span className="registro-error-texto">{errores.turnstile}</span>}

              {errorGeneral && <p className="auth-error">{errorGeneral}</p>}
            </>
          )}
        </div>

        <div className="registro-nav-botones">
          {paso > 0 && (
            <button type="button" className="registro-btn-atras" onClick={retrocederPaso}>
              Anterior
            </button>
          )}
          <button
            type="button"
            className="registro-btn-siguiente"
            onClick={handleSiguiente}
            disabled={cargando}
          >
            {paso === 1 ? (cargando ? 'Creando cuenta...' : 'Crear cuenta') : 'Siguiente'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default RegistroHonorifico
