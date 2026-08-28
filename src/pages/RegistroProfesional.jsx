import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import SubidaArchivoDrive from '../components/registro/SubidaArchivoDrive'
import Stepper from '../components/registro/Stepper'
import TurnstileWidget from '../components/registro/TurnstileWidget'
import {
  PROFESIONES,
  TITULOS_POR_DEFECTO,
  obtenerEspecialidades
} from '../data/profesionesSalud'
import {
  validarEmail,
  validarRifMedico,
  validarTelefonoVenezuela,
  validarDireccion
} from '../utils/validadores'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const PREFIJOS_RIF = ['V', 'E']
const PASOS = ['Datos', 'Documentos', 'Confirmación']

function RegistroProfesional() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const [paso, setPaso] = useState(0)
  const [direccionPaso, setDireccionPaso] = useState('adelante')

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    profesion: '',
    titulo: '',
    nombre: '',
    apellido: '',
    numeroCedula: '',
    especialidad: '',
    rifPrefijo: 'V',
    rifDigitos: '',
    estado: '',
    ciudad: '',
    direccion_fiscal: '',
    telCodigo: '414',
    telDigitos: ''
  })
  const [rifArchivoUrl, setRifArchivoUrl] = useState('')
  const [certificadoUrl, setCertificadoUrl] = useState('')
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

  const especialidadesDisponibles = obtenerEspecialidades(form.profesion)
  const esProfesionOtro = form.profesion === 'otro'

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  useEffect(() => {
    const opcionesTitulo = TITULOS_POR_DEFECTO[form.profesion]
    setForm((prev) => ({
      ...prev,
      titulo: opcionesTitulo ? opcionesTitulo[0] : '',
      especialidad: ''
    }))
  }, [form.profesion])

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
    if (!form.profesion) nuevosErrores.profesion = 'Selecciona una profesión'
    if (!form.titulo.trim()) nuevosErrores.titulo = 'Campo requerido'
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Campo requerido'
    if (!form.numeroCedula.trim()) nuevosErrores.numeroCedula = 'Campo requerido'

    const rifCheck = validarRifMedico(form.rifPrefijo, form.rifDigitos)
    if (!rifCheck.valido) nuevosErrores.rif = rifCheck.error

    if (!form.estado) nuevosErrores.estado = 'Selecciona un estado'
    if (!form.ciudad) nuevosErrores.ciudad = 'Selecciona una ciudad'

    const telCheck = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)
    if (!telCheck.valido) nuevosErrores.telefono = telCheck.error

    if (form.direccion_fiscal.trim()) {
      const direccionCheck = validarDireccion(form.direccion_fiscal)
      if (!direccionCheck.valido) nuevosErrores.direccion_fiscal = direccionCheck.error
    }

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
      const { rifFormateado } = validarRifMedico(form.rifPrefijo, form.rifDigitos)
      const { telefonoFormateado } = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)

      await api.post('/auth/register', {
        email: form.email.trim().toLowerCase(),
        password,
        tipo_usuario: 'profesional',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telefonoFormateado,
        notificaciones_sistema: notifSistema,
        notificaciones_promociones: notifPromociones,
        perfil: {
          profesion: form.profesion,
          titulo: form.titulo.trim(),
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          numero_cedula: form.numeroCedula.trim(),
          especialidad: form.especialidad || null,
          rif: rifFormateado,
          rif_archivo_url: rifArchivoUrl,
          certificado_acreditacion_url: certificadoUrl || null,
          direccion_fiscal: form.direccion_fiscal.trim() || null
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
      <main className="auth-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Registro Profesional de la Salud</h1>
        <p className="auth-subtitle">Médicos, enfermeros, bionalistas y demás profesionales de la salud</p>

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

              <div className="registro-campo">
                <label htmlFor="profesion">Profesión</label>
                <select
                  id="profesion"
                  value={form.profesion}
                  onChange={(e) => actualizarCampo('profesion', e.target.value)}
                  className={errores.profesion ? 'registro-input--error' : ''}
                >
                  <option value="">Selecciona tu profesión</option>
                  {PROFESIONES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {errores.profesion && <span className="registro-error-texto">{errores.profesion}</span>}
              </div>

              <div className="registro-campo-doble">
                <div className="registro-campo">
                  <label htmlFor="titulo">Título</label>
                  {esProfesionOtro || !TITULOS_POR_DEFECTO[form.profesion] ? (
                    <input
                      id="titulo"
                      placeholder="Ej: Ing., T.S.U."
                      value={form.titulo}
                      onChange={(e) => actualizarCampo('titulo', e.target.value)}
                      className={errores.titulo ? 'registro-input--error' : ''}
                    />
                  ) : (
                    <select
                      id="titulo"
                      value={form.titulo}
                      onChange={(e) => actualizarCampo('titulo', e.target.value)}
                      className={errores.titulo ? 'registro-input--error' : ''}
                    >
                      {TITULOS_POR_DEFECTO[form.profesion].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                  {errores.titulo && <span className="registro-error-texto">{errores.titulo}</span>}
                </div>

                <div className="registro-campo">
                  <label htmlFor="numeroCedula">Número de cédula</label>
                  <input
                    id="numeroCedula"
                    inputMode="numeric"
                    value={form.numeroCedula}
                    onChange={(e) => actualizarCampo('numeroCedula', e.target.value.replace(/\D/g, ''))}
                    className={errores.numeroCedula ? 'registro-input--error' : ''}
                  />
                  {errores.numeroCedula && <span className="registro-error-texto">{errores.numeroCedula}</span>}
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

              {especialidadesDisponibles.length > 0 && (
                <div className="registro-campo">
                  <label htmlFor="especialidad">Especialidad</label>
                  <select
                    id="especialidad"
                    value={form.especialidad}
                    onChange={(e) => actualizarCampo('especialidad', e.target.value)}
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidadesDisponibles.map((esp) => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              )}

              {esProfesionOtro && (
                <div className="registro-campo">
                  <label htmlFor="especialidadLibre">Especialidad (opcional)</label>
                  <input
                    id="especialidadLibre"
                    value={form.especialidad}
                    onChange={(e) => actualizarCampo('especialidad', e.target.value)}
                  />
                </div>
              )}

              <div className="registro-campo">
                <label htmlFor="rif">RIF</label>
                <div className="registro-campo-rif">
                  <select
                    value={form.rifPrefijo}
                    onChange={(e) => actualizarCampo('rifPrefijo', e.target.value)}
                    aria-label="Prefijo de RIF"
                    style={{ width: '70px', flexShrink: 0 }}
                  >
                    {PREFIJOS_RIF.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    id="rif"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="1234567"
                    value={form.rifDigitos}
                    onChange={(e) => actualizarCampo('rifDigitos', e.target.value.replace(/\D/g, ''))}
                    className={errores.rif ? 'registro-input--error' : ''}
                  />
                </div>
                {errores.rif && <span className="registro-error-texto">{errores.rif}</span>}
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

              <SelectorEstadoCiudad
                estado={form.estado}
                ciudad={form.ciudad}
                onChangeEstado={(v) => actualizarCampo('estado', v)}
                onChangeCiudad={(v) => actualizarCampo('ciudad', v)}
                errorEstado={errores.estado}
                errorCiudad={errores.ciudad}
              />

              <div className="registro-campo">
                <label htmlFor="direccion_fiscal">Dirección fiscal (opcional)</label>
                <textarea
                  id="direccion_fiscal"
                  rows={2}
                  value={form.direccion_fiscal}
                  onChange={(e) => actualizarCampo('direccion_fiscal', e.target.value)}
                  className={errores.direccion_fiscal ? 'registro-input--error' : ''}
                />
                {errores.direccion_fiscal && <span className="registro-error-texto">{errores.direccion_fiscal}</span>}
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
              {errores.rif_archivo && <span className="registro-error-texto">{errores.rif_archivo}</span>}

              <SubidaArchivoDrive
                tipoDocumento="certificado_acreditacion"
                etiqueta="Certificado de acreditación profesional"
                onSubida={setCertificadoUrl}
                onQuitar={() => setCertificadoUrl('')}
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
            {paso === 2 ? (cargando ? 'Creando cuenta...' : 'Crear cuenta') : 'Siguiente'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default RegistroProfesional
