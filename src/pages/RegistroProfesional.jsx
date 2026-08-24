import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import SubidaArchivoDrive from '../components/registro/SubidaArchivoDrive'
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
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const PREFIJOS_RIF = ['V', 'E']

/**
 * Formulario de registro del Usuario Profesional de la Salud. Al elegir
 * la profesión, el título (Dr./Dra./Lic./Lcda.) se autocompleta y la
 * lista de especialidades se filtra según esa profesión — para "otro"
 * el título queda editable a mano y no hay lista de especialidad
 * (queda como texto libre).
 */
function RegistroProfesional() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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
  const [errores, setErrores] = useState({})

  const especialidadesDisponibles = obtenerEspecialidades(form.profesion)
  const esProfesionOtro = form.profesion === 'otro'

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  // Al cambiar la profesión: autocompleta el título con la primera
  // opción sugerida (el usuario puede cambiarlo si corresponde el
  // femenino/masculino) y resetea la especialidad, que ya no aplica
  // a la profesión nueva.
  useEffect(() => {
    const opcionesTitulo = TITULOS_POR_DEFECTO[form.profesion]
    setForm((prev) => ({
      ...prev,
      titulo: opcionesTitulo ? opcionesTitulo[0] : '',
      especialidad: ''
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.profesion])

  function validar() {
    const nuevosErrores = {}

    if (!validarEmail(form.email)) nuevosErrores.email = 'Ingresa un correo válido'
    if (!form.profesion) nuevosErrores.profesion = 'Selecciona una profesión'
    if (!form.titulo.trim()) nuevosErrores.titulo = 'Campo requerido'
    if (!form.nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    if (!form.apellido.trim()) nuevosErrores.apellido = 'Campo requerido'
    if (!form.numeroCedula.trim()) nuevosErrores.numeroCedula = 'Campo requerido'

    const rifCheck = validarRifMedico(form.rifPrefijo, form.rifDigitos)
    if (!rifCheck.valido) nuevosErrores.rif = rifCheck.error

    if (!rifArchivoUrl) nuevosErrores.rif_archivo = 'Debes subir el RIF en PDF'
    if (!form.estado) nuevosErrores.estado = 'Selecciona un estado'
    if (!form.ciudad) nuevosErrores.ciudad = 'Selecciona una ciudad'

    const telCheck = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)
    if (!telCheck.valido) nuevosErrores.telefono = telCheck.error

    // Dirección fiscal es opcional para Profesional — solo se valida el
    // formato si el usuario efectivamente escribió algo.
    if (form.direccion_fiscal.trim()) {
      const direccionCheck = validarDireccion(form.direccion_fiscal)
      if (!direccionCheck.valido) nuevosErrores.direccion_fiscal = direccionCheck.error
    }

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

    const { rifFormateado } = validarRifMedico(form.rifPrefijo, form.rifDigitos)
    const { telefonoFormateado } = validarTelefonoVenezuela(form.telCodigo, form.telDigitos)

    navigate('/registro/finalizar', {
      state: {
        email: form.email.trim().toLowerCase(),
        tipo_usuario: 'profesional',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telefonoFormateado,
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
        }
      }
    })
  }

  return (
    <div className="auth-page">
      <main className="auth-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">Registro Profesional de la Salud</h1>
        <p className="auth-subtitle">Médicos, enfermeros, bionalistas y demás profesionales de la salud</p>

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

          <h3 className="registro-seccion-titulo">Requisitos</h3>

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

export default RegistroProfesional