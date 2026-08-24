import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import SelectorEstadoCiudad from '../components/registro/SelectorEstadoCiudad'
import SelectorHorarioSemanal from '../components/registro/SelectorHorarioSemanal'
import SubidaArchivoDrive from '../components/registro/SubidaArchivoDrive'
import { TIPOS_INSTITUCION } from '../data/tiposInstitucion'
import {
  validarEmail,
  validarRifInstitucion,
  validarTelefonoVenezuela,
  validarDireccion,
  validarNombreInstitucion
} from '../utils/validadores'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'

/**
 * Formulario de registro del Usuario Institucional. Al enviar, arma el
 * payload { email, tipo_usuario, estado, ciudad, telefono, perfil } y
 * navega a /registro/finalizar (paso compartido de contraseña + push),
 * que es quien hace el submit real a POST /auth/register.
 */
const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']

function RegistroInstitucional() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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
  const [errores, setErrores] = useState({})

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar() {
    const nuevosErrores = {}

    if (!validarEmail(form.email)) nuevosErrores.email = 'Ingresa un correo válido'

    const nombreCheck = validarNombreInstitucion(form.razon_social)
    if (!nombreCheck.valido) nuevosErrores.razon_social = nombreCheck.error

    if (!form.tipo_institucion) nuevosErrores.tipo_institucion = 'Selecciona un tipo'

    const rifCheck = validarRifInstitucion(form.rifDigitos)
    if (!rifCheck.valido) nuevosErrores.rif = rifCheck.error

    if (!rifArchivoUrl) nuevosErrores.rif_archivo = 'Debes subir el RIF en PDF'
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

    if (!aceptaTerminos) nuevosErrores.terminos = 'Debes aceptar los términos para continuar'

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) {
      // Lleva la vista al primer error para que no quede "perdido" más abajo del formulario.
      document.querySelector('.registro-input--error, [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const { rifFormateado } = validarRifInstitucion(form.rifDigitos)
    const { telefonoFormateado: telInstFormateado } = validarTelefonoVenezuela(form.telInstCodigo, form.telInstDigitos)
    const { telefonoFormateado: telRepFormateado } = validarTelefonoVenezuela(form.telRepCodigo, form.telRepDigitos)

    navigate('/registro/finalizar', {
      state: {
        email: form.email.trim().toLowerCase(),
        tipo_usuario: 'institucional',
        estado: form.estado,
        ciudad: form.ciudad,
        telefono: telInstFormateado,
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

        <h1 className="auth-title">Registro Institucional</h1>
        <p className="auth-subtitle">Clínicas, farmacias, centros quirúrgicos y demás instituciones de salud</p>

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
            <label htmlFor="razon_social">Razón social</label>
            <input
              id="razon_social"
              value={form.razon_social}
              onChange={(e) => actualizarCampo('razon_social', e.target.value)}
              className={errores.razon_social ? 'registro-input--error' : ''}
            />
            {errores.razon_social && <span className="registro-error-texto">{errores.razon_social}</span>}
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
            >
              <option value="">Selecciona un tipo</option>
              {TIPOS_INSTITUCION.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errores.tipo_institucion && <span className="registro-error-texto">{errores.tipo_institucion}</span>}
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
              />
            </div>
            {errores.rif && <span className="registro-error-texto">{errores.rif}</span>}
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
            />
            {errores.direccion_fiscal && <span className="registro-error-texto">{errores.direccion_fiscal}</span>}
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
                />
              </div>
              {errores.telefono_institucional && <span className="registro-error-texto">{errores.telefono_institucional}</span>}
            </div>
            <div className="registro-campo">
              <label htmlFor="correo_institucional">Correo institucional</label>
              <input
                id="correo_institucional"
                type="email"
                value={form.correo_institucional}
                onChange={(e) => actualizarCampo('correo_institucional', e.target.value)}
                className={errores.correo_institucional ? 'registro-input--error' : ''}
              />
              {errores.correo_institucional && <span className="registro-error-texto">{errores.correo_institucional}</span>}
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
              />
              {errores.nombre_representante && <span className="registro-error-texto">{errores.nombre_representante}</span>}
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
                />
              </div>
              {errores.telefono_representante && <span className="registro-error-texto">{errores.telefono_representante}</span>}
            </div>
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
          {errores.terminos && <span className="registro-error-texto">{errores.terminos}</span>}

          <button type="submit" className="auth-btn-primary">Continuar</button>
        </form>
      </main>
    </div>
  )
}

export default RegistroInstitucional