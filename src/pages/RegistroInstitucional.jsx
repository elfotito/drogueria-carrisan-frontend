import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import SelectorHorarioSemanal from '../components/registro/SelectorHorarioSemanal'
import SubidaArchivoDrive from '../components/registro/SubidaArchivoDrive'
import Stepper from '../components/registro/Stepper'
import TurnstileWidget from '../components/registro/TurnstileWidget'
import { TIPOS_INSTITUCION } from '../data/tiposInstitucion'
import {
  validarEmail,
  validarRifInstitucion,
  validarTelefonoVenezuela,
  validarDireccion,
  validarNombreInstitucion,
  validarPassword
} from '../utils/validadores'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const PASOS = ['Datos', 'Documentos', 'Confirmación']

function RegistroInstitucional() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [paso, setPaso] = useState(0)
  const [direccionPaso, setDireccionPaso] = useState('adelante')

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    razon_social: '',
    nombre_comercial: '',
    tipo_institucion: '',
    rifDigitos: '',
    estado: '',
    ciudad: '',
    direccion_fiscal: '',
    telInstCodigo: '414',
    telInstDigitos: '',
    correo_institucional: '',
    nombre_representante: '',
    telRepCodigo: '414',
    telRepDigitos: ''
  })
  const [horarioRecepcion, setHorarioRecepcion] = useState(null)
  const [rifArchivoUrl, setRifArchivoUrl] = useState('')
  const [permisoSanitarioUrl, setPermisoSanitarioUrl] = useState('')
  const [registroMercantilUrl, setRegistroMercantilUrl] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [notifSistema, setNotifSistema] = useState(true)
  const [notifPromociones, setNotifPromociones] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [registroCompleto, setRegistroCompleto] = useState(false)

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
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

    const nombreCheck = validarNombreInstitucion(form.razon_social)
    if (!nombreCheck.valido) nuevosErrores.razon_social = nombreCheck.error

    if (!form.tipo_institucion) nuevosErrores.tipo_institucion = 'Selecciona un tipo'

    const rifCheck = validarRifInstitucion(form.rifDigitos)
    if (!rifCheck.valido) nuevosErrores.rif = rifCheck.error

    if (!form.estado) nuevosErrores.estado = 'Selecciona un estado'
    if (!form.ciudad) nuevosErrores.ciudad = 'Selecciona una ciudad'

    const direccionCheck = validarDireccion(form.direccion_fiscal)
    if (!direccionCheck.valido) nuevosErrores.direccion_fiscal = direccionCheck.error

    const telInstCheck = validarTelefonoVenezuela(form.telInstCodigo, form.telInstDigitos)
    if (!telInstCheck.valido) nuevosErrores.telefono_institucional = telInstCheck.error

    if (!validarEmail(form.correo_institucional)) nuevosErrores.correo_institucional = 'Ingresa un correo válido'
    if (!form.nombre_representante.trim()) nuevosErrores.nombre_representante = 'Campo requerido'

    const telRepCheck = validarTelefonoVenezuela(form.telRepCodigo, form.telRepDigitos)
    if (!telRepCheck.valido) nuevosErrores.telefono_representante = telRepCheck.error

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function validarPaso1() {
    const nuevosErrores = {}
    if (!rifArchivoUrl) nuevosErrores.rif_archivo = 'Debes subir el RIF en PDF'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function validarPaso2() {
    const nuevosErrores = {}
    if (!aceptaTerminos) nuevosErrores.terminos = 'Debes aceptar los términos para continuar'
    const passwordCheck = validarPassword(password)
    if (!passwordCheck.valido) nuevosErrores.password = passwordCheck.error
    if (password !== confirmarPassword) nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
    if (!turnstileToken) nuevosErrores.turnstile = 'Completa la verificación de seguridad'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function calcularFortalezaPassword(pass) {
    let puntaje = 0
    if (pass.length >= 8) puntaje += 1
    if (/[A-Z]/.test(pass)) puntaje += 1
    if (/[a-z]/.test(pass)) puntaje += 1
    if (/[0-9]/.test(pass)) puntaje += 1
    if (/[^A-Za-z0-9]/.test(pass)) puntaje += 1
    return puntaje
  }

  function handleSiguiente() {
    let valido = false
    if (paso === 0) valido = validarPaso0()
    else if (paso === 1) valido = validarPaso1()
    else if (paso === 2) valido = validarPaso2()

    if (!valido) {
      document.querySelector('.registro-input--error, [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (paso < 2) {
      avanzarPaso()
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setErrorGeneral('')
    setCargando(true)
    try {
      const { rifFormateado } = validarRifInstitucion(form.rifDigitos)
      const { telefonoFormateado: telInstFormateado } = validarTelefonoVenezuela(form.telInstCodigo, form.telInstDigitos)
      const { telefonoFormateado: telRepFormateado } = validarTelefonoVenezuela(form.telRepCodigo, form.telRepDigitos)

      await api.post('/auth/register', {
        email: form.email.trim().toLowerCase(),
        password,
        tipo_usuario: 'institucional',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telInstFormateado,
        notificaciones_sistema: notifSistema,
        notificaciones_promociones: notifPromociones,
        perfil: {
          razon_social: form.razon_social.trim(),
          nombre_comercial: form.nombre_comercial || null,
          tipo_institucion: form.tipo_institucion,
          rif: rifFormateado,
          rif_archivo_url: rifArchivoUrl,
          permiso_sanitario_url: permisoSanitarioUrl || null,
          registro_mercantil_url: registroMercantilUrl || null,
          direccion_fiscal: form.direccion_fiscal.trim(),
          telefono_institucional: telInstFormateado,
          correo_institucional: form.correo_institucional.trim().toLowerCase(),
          horario_recepcion: horarioRecepcion,
          nombre_representante: form.nombre_representante.trim(),
          telefono_representante: telRepFormateado
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
    return (
      <div className="auth-page">
        <main className="auth-container">
          <div className="auth-exito-icono">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="auth-title">¡Registro exitoso!</h1>
          <p className="auth-subtitle">
            Tu cuenta fue creada con éxito. Ya podés explorar el catálogo cuando quieras.
          </p>
          <button className="auth-btn-primary" onClick={() => navigate('/')}>
            Ir a la tienda
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <main className="auth-container auth-container--registro">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Registro Institucional</h1>
        <p className="auth-subtitle">Clínicas, farmacias, centros quirúrgicos y demás instituciones de salud</p>

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
                  aria-invalid={!!errores.email}
                  aria-describedby={errores.email ? 'email-error' : undefined}
                />
                {errores.email && <span id="email-error" className="registro-error-texto" role="alert">{errores.email}</span>}
              </div>

              <div className="registro-campo">
                <label htmlFor="razon_social">Razón social</label>
                <input
                  id="razon_social"
                  value={form.razon_social}
                  onChange={(e) => actualizarCampo('razon_social', e.target.value)}
                  className={errores.razon_social ? 'registro-input--error' : ''}
                  aria-invalid={!!errores.razon_social}
                  aria-describedby={errores.razon_social ? 'razon_social-error' : undefined}
                />
                {errores.razon_social && <span id="razon_social-error" className="registro-error-texto" role="alert">{errores.razon_social}</span>}
              </div>

              <div className="registro-campo">
                <label htmlFor="nombre_comercial">Nombre comercial (opcional)</label>
                <input
                  id="nombre_comercial"
                  value={form.nombre_comercial}
                  onChange={(e) => actualizarCampo('nombre_comercial', e.target.value)}
                />
              </div>

              <div className="registro-campo">
                <label htmlFor="tipo_institucion">Tipo de institución</label>
                <select
                  id="tipo_institucion"
                  value={form.tipo_institucion}
                  onChange={(e) => actualizarCampo('tipo_institucion', e.target.value)}
                  className={errores.tipo_institucion ? 'registro-input--error' : ''}
                  aria-invalid={!!errores.tipo_institucion}
                  aria-describedby={errores.tipo_institucion ? 'tipo_institucion-error' : undefined}
                >
                  <option value="">Selecciona un tipo</option>
                  {TIPOS_INSTITUCION.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errores.tipo_institucion && <span id="tipo_institucion-error" className="registro-error-texto" role="alert">{errores.tipo_institucion}</span>}
              </div>

              <div className="registro-campo">
                <label htmlFor="rif">RIF</label>
                <div className="registro-campo-rif">
                  <span className="registro-campo-rif-prefijo">J-</span>
                  <input
                    id="rif"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="123456789"
                    value={form.rifDigitos}
                    onChange={(e) => actualizarCampo('rifDigitos', e.target.value.replace(/\D/g, ''))}
                    className={errores.rif ? 'registro-input--error' : ''}
                    aria-invalid={!!errores.rif}
                    aria-describedby={errores.rif ? 'rif-error' : undefined}
                  />
                </div>
                {errores.rif && <span id="rif-error" className="registro-error-texto" role="alert">{errores.rif}</span>}
              </div>

              <SelectorEstadoCiudad
                estado={form.estado}
                ciudad={form.ciudad}
                onChangeEstado={(v) => actualizarCampo('estado', v)}
                onChangeCiudad={(v) => actualizarCampo('ciudad', v)}
                errorEstado={errores.estado}
                errorCiudad={errores.ciudad}
              />

              <div className="registro-campo">
                <label htmlFor="direccion_fiscal">Dirección fiscal</label>
                <textarea
                  id="direccion_fiscal"
                  rows={2}
                  value={form.direccion_fiscal}
                  onChange={(e) => actualizarCampo('direccion_fiscal', e.target.value)}
                  className={errores.direccion_fiscal ? 'registro-input--error' : ''}
                  aria-invalid={!!errores.direccion_fiscal}
                  aria-describedby={errores.direccion_fiscal ? 'direccion_fiscal-error' : undefined}
                />
                {errores.direccion_fiscal && <span id="direccion_fiscal-error" className="registro-error-texto" role="alert">{errores.direccion_fiscal}</span>}
              </div>

              <div className="registro-campo-doble">
                <div className="registro-campo">
                  <label htmlFor="telefono_institucional">Teléfono institucional</label>
                  <div className="registro-campo-telefono">
                    <select
                      value={form.telInstCodigo}
                      onChange={(e) => actualizarCampo('telInstCodigo', e.target.value)}
                      aria-label="Código de teléfono institucional"
                    >
                      {CODIGOS_TELEFONO.map((c) => (
                        <option key={c} value={c}>0{c}</option>
                      ))}
                    </select>
                    <input
                      inputMode="numeric"
                      maxLength={7}
                      placeholder="1234567"
                      value={form.telInstDigitos}
                      onChange={(e) => actualizarCampo('telInstDigitos', e.target.value.replace(/\D/g, ''))}
                      className={errores.telefono_institucional ? 'registro-input--error' : ''}
                      aria-invalid={!!errores.telefono_institucional}
                      aria-describedby={errores.telefono_institucional ? 'telefono_institucional-error' : undefined}
                    />
                  </div>
                  {errores.telefono_institucional && <span id="telefono_institucional-error" className="registro-error-texto" role="alert">{errores.telefono_institucional}</span>}
                </div>
                <div className="registro-campo">
                <label htmlFor="correo_institucional">Correo institucional</label>
                <input
                  id="correo_institucional"
                  type="email"
                  value={form.correo_institucional}
                  onChange={(e) => actualizarCampo('correo_institucional', e.target.value)}
                  className={errores.correo_institucional ? 'registro-input--error' : ''}
                  aria-invalid={!!errores.correo_institucional}
                  aria-describedby={errores.correo_institucional ? 'correo_institucional-error' : undefined}
                />
                {errores.correo_institucional && <span id="correo_institucional-error" className="registro-error-texto" role="alert">{errores.correo_institucional}</span>}
                </div>
              </div>

              <div className="registro-campo">
                <label>Horario de recepción de pedidos</label>
                <SelectorHorarioSemanal value={horarioRecepcion} onChange={setHorarioRecepcion} />
              </div>

              <div className="registro-campo-doble">
                <div className="registro-campo">
                <label htmlFor="nombre_representante">Nombre del representante</label>
                <input
                  id="nombre_representante"
                  value={form.nombre_representante}
                  onChange={(e) => actualizarCampo('nombre_representante', e.target.value)}
                  className={errores.nombre_representante ? 'registro-input--error' : ''}
                  aria-invalid={!!errores.nombre_representante}
                  aria-describedby={errores.nombre_representante ? 'nombre_representante-error' : undefined}
                />
                {errores.nombre_representante && <span id="nombre_representante-error" className="registro-error-texto" role="alert">{errores.nombre_representante}</span>}
                </div>
                <div className="registro-campo">
                  <label htmlFor="telefono_representante">Teléfono del representante</label>
                  <div className="registro-campo-telefono">
                    <select
                      value={form.telRepCodigo}
                      onChange={(e) => actualizarCampo('telRepCodigo', e.target.value)}
                      aria-label="Código de teléfono del representante"
                    >
                      {CODIGOS_TELEFONO.map((c) => (
                        <option key={c} value={c}>0{c}</option>
                      ))}
                    </select>
                    <input
                      inputMode="numeric"
                      maxLength={7}
                      placeholder="1234567"
                      value={form.telRepDigitos}
                      onChange={(e) => actualizarCampo('telRepDigitos', e.target.value.replace(/\D/g, ''))}
                      className={errores.telefono_representante ? 'registro-input--error' : ''}
                      aria-invalid={!!errores.telefono_representante}
                      aria-describedby={errores.telefono_representante ? 'telefono_representante-error' : undefined}
                    />
                  </div>
                  {errores.telefono_representante && <span id="telefono_representante-error" className="registro-error-texto" role="alert">{errores.telefono_representante}</span>}
                </div>
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <h3 className="registro-seccion-titulo-paso">Documentos requeridos</h3>

              <SubidaArchivoDrive
                tipoDocumento="rif"
                etiqueta="RIF"
                obligatorio
                onSubida={setRifArchivoUrl}
                onQuitar={() => setRifArchivoUrl('')}
              />
              {errores.rif_archivo && <span id="rif_archivo-error" className="registro-error-texto" role="alert">{errores.rif_archivo}</span>}

              <SubidaArchivoDrive
                tipoDocumento="permiso_sanitario"
                etiqueta="Permiso sanitario"
                onSubida={setPermisoSanitarioUrl}
                onQuitar={() => setPermisoSanitarioUrl('')}
              />

              <SubidaArchivoDrive
                tipoDocumento="registro_mercantil"
                etiqueta="Registro mercantil"
                onSubida={setRegistroMercantilUrl}
                onQuitar={() => setRegistroMercantilUrl('')}
              />
            </>
          )}

          {paso === 2 && (
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
                  Acepto el <Link to="/contrato">contrato</Link>, la <Link to="/privacidad">política de privacidad</Link> y
                  los <Link to="/terminos">términos de uso</Link>
                </span>
              </label>
              {errores.terminos && <span id="terminos-error" className="registro-error-texto" role="alert">{errores.terminos}</span>}

              <div className="registro-campo">
                <label htmlFor="password">Contraseña</label>
                <div className="registro-input-con-toggle" style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className={errores.password ? 'registro-input--error' : ''}
                    aria-invalid={!!errores.password}
                    aria-describedby={errores.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="registro-password-toggle"
                  >
                    {mostrarPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {password.length >= 1 && (() => {
                  const puntaje = calcularFortalezaPassword(password)
                  const { color, etiqueta, ancho } = puntaje <= 1
                    ? { color: '#DC2626', etiqueta: 'Débil', ancho: 20 }
                    : puntaje <= 3
                    ? { color: '#F59E0B', etiqueta: 'Media', ancho: 60 }
                    : puntaje === 4
                    ? { color: '#10B981', etiqueta: 'Fuerte', ancho: 80 }
                    : { color: '#059669', etiqueta: 'Muy fuerte', ancho: 100 }
                  return (
                    <div className="registro-password-fortaleza">
                      <div
                        className="registro-password-fortaleza-barra"
                        role="progressbar"
                        aria-label="Fortaleza de la contraseña"
                        aria-valuenow={puntaje}
                        aria-valuemin={0}
                        aria-valuemax={5}
                        aria-valuetext={etiqueta}
                        style={{ height: '4px', borderRadius: '2px', background: color, width: `${ancho}%`, transition: 'all 0.3s' }}
                      />
                      <span className="registro-password-fortaleza-texto" style={{ color }}>{etiqueta}</span>
                    </div>
                  )
                })()}
                {errores.password && <span id="password-error" className="registro-error-texto" role="alert">{errores.password}</span>}
              </div>

              <div className="registro-campo">
                <label htmlFor="confirmar-password">Confirmar contraseña</label>
                <div className="registro-input-con-toggle" style={{ position: 'relative' }}>
                  <input
                    id="confirmar-password"
                    type={mostrarConfirmarPassword ? 'text' : 'password'}
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Repetí tu contraseña"
                    autoComplete="new-password"
                    className={errores.confirmarPassword ? 'registro-input--error' : ''}
                    aria-invalid={!!errores.confirmarPassword}
                    aria-describedby={errores.confirmarPassword ? 'confirmar-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarPassword((prev) => !prev)}
                    aria-label={mostrarConfirmarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="registro-password-toggle"
                  >
                    {mostrarConfirmarPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {errores.confirmarPassword && <span id="confirmar-password-error" className="registro-error-texto" role="alert">{errores.confirmarPassword}</span>}
              </div>

              <TurnstileWidget onVerificado={setTurnstileToken} onExpirado={() => setTurnstileToken('')} />
              {errores.turnstile && <span id="turnstile-error" className="registro-error-texto" role="alert">{errores.turnstile}</span>}

              {errorGeneral && <p className="auth-error" role="alert">{errorGeneral}</p>}
            </>
          )}
        </div>

        <div className="registro-nav-botones">
          {paso > 0 && (
            <button type="button" className="registro-btn-atras" onClick={retrocederPaso}>
              ← Anterior
            </button>
          )}
          <button
            type="button"
            className="registro-btn-siguiente"
            onClick={handleSiguiente}
            disabled={cargando}
          >
            {paso === 2 ? (cargando ? 'Creando cuenta...' : 'Crear cuenta') : 'Siguiente'}
          </button>
        </div>
      </main>

      <footer className="auth-footer">
        <div className="auth-footer-content">
          © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
          <div className="auth-footer-links">
            <Link to="/terminos">Términos de uso</Link>
            <Link to="/privacidad">Aviso de privacidad</Link>
            <Link to="/contacto">Soporte</Link>
          </div>
          <span className="auth-footer-rif">RIF J-40068410-2</span>
        </div>
      </footer>
    </div>
  )
}

export default RegistroInstitucional
