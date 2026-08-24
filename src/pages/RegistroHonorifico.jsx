import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import { validarEmail, validarTelefonoVenezuela } from '../utils/validadores'
import api from '../api/axios'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const TRATAMIENTOS = ['Sr.', 'Sra.', 'Lic.', 'Lcda.']

/**
 * Formulario de registro del Usuario Honorífico. A diferencia de los
 * otros dos, empieza pidiendo el código de invitación y lo verifica
 * contra el backend (POST /auth/verificar-codigo) antes de mostrar el
 * resto del formulario — el código no se "gasta" en esta verificación,
 * solo se confirma que existe y no fue usado; el consumo real ocurre
 * recién en el submit final del registro (backend, register()).
 */
function RegistroHonorifico() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [codigo, setCodigo] = useState('')
  const [verificandoCodigo, setVerificandoCodigo] = useState(false)
  const [codigoValido, setCodigoValido] = useState(false)
  const [errorCodigo, setErrorCodigo] = useState('')

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
  const [errores, setErrores] = useState({})

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

  function validar() {
    const nuevosErrores = {}

    if (!validarEmail(form.email)) nuevosErrores.email = 'Ingresa un correo válido'
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Campo requerido'

    const telCheck = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)
    if (!telCheck.valido) nuevosErrores.telefono = telCheck.error

    if (!form.estado) nuevosErrores.estado = 'Selecciona un estado'
    if (!form.ciudad) nuevosErrores.ciudad = 'Selecciona una ciudad'
    if (!aceptaTerminos) nuevosErrores.terminos = 'Debes aceptar los términos para continuar'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) {
      document.querySelector('.registro-input--error, [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const { telefonoFormateado } = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)

    navigate('/registro/finalizar', {
      state: {
        email: form.email.trim().toLowerCase(),
        tipo_usuario: 'honorifico',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telefonoFormateado,
        perfil: {
          tratamiento: form.tratamiento,
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          codigo_invitacion: codigo.trim().toUpperCase()
        }
      }
    })
  }

  // Paso 1: pedir y verificar el código antes de mostrar el formulario.
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

  // Paso 2: código válido, mostrar el formulario completo.
  return (
    <div className="auth-page">
      <main className="auth-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Completa tu registro</h1>
        <p className="auth-subtitle">Código verificado — ya podés completar tus datos</p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-btn-primary">Continuar</button>
        </form>
      </main>
    </div>
  )
}

export default RegistroHonorifico