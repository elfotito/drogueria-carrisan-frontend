import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import MapaPicker from '../components/MapaPicker'
import {
  validarEmail,
  validarPassword,
  formatearPasswordAMayuscula,
  validarRifMedico,
  validarRifInstitucion,
  validarTelefonoVenezuela,
  validarNombreMedico,
  validarNombreInstitucion,
  validarDireccion
} from '../utils/validadores'
import './Auth.css'
import './RegistroConTipo.css'

const CODIGOS_TELEFONO = ['414', '424', '412', '422', '416', '426']
const TITULOS = ['Dr.', 'Dra.']

function RegistroConTipo() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Step 1: Seleccionar tipo de cliente
  const [tipoCliente, setTipoCliente] = useState(null)

  // Campos comunes
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [emailBloqueado, setEmailBloqueado] = useState(!!searchParams.get('email'))
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Campos específicos Médico
  const [titulo, setTitulo] = useState('Dr.')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [rifPrefijo, setRifPrefijo] = useState('V')
  const [rifNumeros, setRifNumeros] = useState('')
  const [direccionFiscal, setDireccionFiscal] = useState('')
  const [codigoTelefono, setCodigoTelefono] = useState('414')
  const [telefonoDigitos, setTelefonoDigitos] = useState('')

  // Campos específicos Institución
  const [nombreInstitucion, setNombreInstitucion] = useState('')
  const [rifNumerosInst, setRifNumerosInst] = useState('')
  const [direccionFiscalInst, setDireccionFiscalInst] = useState('')
  const [direccionEntregaInst, setDireccionEntregaInst] = useState('')
  const [codigoTelefonoInst, setCodigoTelefonoInst] = useState('414')
  const [telefonoDigitosInst, setTelefonoDigitosInst] = useState('')

  // Manejo de password con fuerza automática a mayúscula
  function handlePasswordChange(value) {
    const mayuscula = formatearPasswordAMayuscula(value)
    setPassword(mayuscula)

    const validacion = validarPassword(mayuscula)
    setPasswordError(validacion.error)
  }

  async function handleRegistroMedico(e) {
    e.preventDefault()
    setError('')

    // Validaciones
    if (honeypot) {
      setError('No se pudo crear la cuenta. Intentá de nuevo.')
      return
    }

    if (!aceptaTerminos) {
      setError('Tenés que aceptar los términos y condiciones.')
      return
    }

    // Email
    if (!validarEmail(email)) {
      setError('Correo electrónico no válido')
      return
    }

    // Password
    const valPass = validarPassword(password)
    if (!valPass.valido) {
      setError(`Contraseña: ${valPass.error}`)
      return
    }

    // Nombre
    const valNombre = validarNombreMedico(titulo, nombre, apellido)
    if (!valNombre.valido) {
      setError(valNombre.error)
      return
    }

    // RIF
    const valRif = validarRifMedico(rifPrefijo, rifNumeros)
    if (!valRif.valido) {
      setError(`RIF/Cédula: ${valRif.error}`)
      return
    }

    // Dirección
    const valDir = validarDireccion(direccionFiscal)
    if (!valDir.valido) {
      setError(`Dirección: ${valDir.error}`)
      return
    }

    // Teléfono
    const valTel = validarTelefonoVenezuela(codigoTelefono, telefonoDigitos)
    if (!valTel.valido) {
      setError(`Teléfono: ${valTel.error}`)
      return
    }

    setCargando(true)
    try {
      await api.post('/auth/register', {
        email,
        password,
        nombre: valNombre.nombreFormateado,
        etiqueta: 'Medico',
        rif_cedula: valRif.rifFormateado,
        direccion_fiscal: valDir.direccionFormateada,
        telefono: valTel.telefonoFormateado
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setCargando(false)
    }
  }

  async function handleRegistroInstitucion(e) {
    e.preventDefault()
    setError('')

    // Validaciones
    if (honeypot) {
      setError('No se pudo crear la cuenta. Intentá de nuevo.')
      return
    }

    if (!aceptaTerminos) {
      setError('Tenés que aceptar los términos y condiciones.')
      return
    }

    // Email
    if (!validarEmail(email)) {
      setError('Correo electrónico no válido')
      return
    }

    // Password
    const valPass = validarPassword(password)
    if (!valPass.valido) {
      setError(`Contraseña: ${valPass.error}`)
      return
    }

    // Nombre Institución
    const valNombreInst = validarNombreInstitucion(nombreInstitucion)
    if (!valNombreInst.valido) {
      setError(valNombreInst.error)
      return
    }

    // RIF Institución
    const valRifInst = validarRifInstitucion(rifNumerosInst)
    if (!valRifInst.valido) {
      setError(`RIF: ${valRifInst.error}`)
      return
    }

    // Dirección Fiscal
    const valDirFiscal = validarDireccion(direccionFiscalInst)
    if (!valDirFiscal.valido) {
      setError(`Dirección fiscal: ${valDirFiscal.error}`)
      return
    }

    // Dirección Entrega
    const valDirEntrega = validarDireccion(direccionEntregaInst)
    if (!valDirEntrega.valido) {
      setError(`Dirección de entrega: ${valDirEntrega.error}`)
      return
    }

    // Teléfono
    const valTelInst = validarTelefonoVenezuela(codigoTelefonoInst, telefonoDigitosInst)
    if (!valTelInst.valido) {
      setError(`Teléfono: ${valTelInst.error}`)
      return
    }

    setCargando(true)
    try {
      await api.post('/auth/register', {
        email,
        password,
        nombre: valNombreInst.nombreFormateado,
        etiqueta: 'Institucion',
        rif_cedula: valRifInst.rifFormateado,
        direccion_fiscal: valDirFiscal.direccionFormateada,
        direccion_entrega: valDirEntrega.direccionFormateada,
        telefono: valTelInst.telefonoFormateado
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setCargando(false)
    }
  }

  // Step 1: Seleccionar tipo
  if (!tipoCliente) {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <Link to="/" className="auth-logo">
            <img
              src={require('../assets/logo/minilogo color sin fondo.png')}
              alt="Logo"
              className="logologin"
            />
          </Link>

          <h1 className="auth-title">¿Cuál es tu tipo de cliente?</h1>
          <p className="auth-subtitle">
            Selecciona la opción que mejor describe tu perfil para completar tu registro
          </p>

          <div className="registro-tipo__selectores">
            <button
              type="button"
              className="registro-tipo__card"
              onClick={() => setTipoCliente('medico')}
            >
              <div className="registro-tipo__icono">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9h-2.5v2.5h-2v-2.5h-2.5v-2h2.5v-2.5h2v2.5h2.5v2z" />
                </svg>
              </div>
              <h3>Soy Médico o Cirujano</h3>
              <p>Compra insumos y medicamentos para tus procedimientos</p>
            </button>

            <button
              type="button"
              className="registro-tipo__card"
              onClick={() => setTipoCliente('institucion')}
            >
              <div className="registro-tipo__icono">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <h3>Soy una Institución</h3>
              <p>Clínica, farmacia u otra institución de salud</p>
            </button>
          </div>
        </main>

        <footer className="auth-footer">
          <div className="auth-footer-content">
            <span className="auth-footer-rif">RIF J-40068410-2</span>
            <div className="auth-footer-links">
              <Link to="/terminos">Términos de uso</Link>
              <Link to="/privacidad">Aviso de privacidad</Link>
              <Link to="/contacto">Soporte</Link>
            </div>
            © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    )
  }

  // Step 2: Registro Médico
  if (tipoCliente === 'medico') {
    return (
      <div className="auth-page">
        <main className="auth-container">
          <Link to="/" className="auth-logo">
            <img
              src={require('../assets/logo/minilogo color sin fondo.png')}
              alt="Logo"
              className="logologin"
            />
          </Link>

          <h1 className="auth-title">Crear tu cuenta</h1>
          <p className="auth-subtitle">Completa tus datos como profesional médico</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleRegistroMedico}>
            {/* Email */}
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
            ) : (
              <div className="auth-input-group">
                <label htmlFor="email-medico">Correo electrónico</label>
                <input
                  id="email-medico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            )}

            {/* Contraseña */}
            <div className="auth-input-group">
              <label htmlFor="password-medico">Contraseña</label>
              <input
                id="password-medico"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                autoComplete="new-password"
                placeholder="Mín. 6 caracteres, 1 letra y 1 número"
                required
              />
              {passwordError && <span className="auth-field-error">{passwordError}</span>}
            </div>

            {/* Nombre */}
            <div className="auth-input-group-triple">
              <div>
                <label htmlFor="titulo">Título</label>
                <select
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                >
                  {TITULOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nombre-medico">Nombre</label>
                <input
                  id="nombre-medico"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Mario"
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Balotelli"
                  required
                />
              </div>
            </div>

            {/* RIF/Cédula */}
            <div className="auth-input-group-duo">
              <div>
                <label htmlFor="rif-prefijo">Tipo</label>
                <select
                  id="rif-prefijo"
                  value={rifPrefijo}
                  onChange={(e) => setRifPrefijo(e.target.value)}
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                </select>
              </div>
              <div>
                <label htmlFor="rif-numeros">Número (7-9 dígitos)</label>
                <input
                  id="rif-numeros"
                  type="text"
                  inputMode="numeric"
                  value={rifNumeros}
                  onChange={(e) => setRifNumeros(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 12345678"
                  required
                />
              </div>
            </div>

            {/* Dirección Fiscal */}
            <div className="auth-input-group">
              <label>Dirección fiscal</label>
              <MapaPicker
                onDireccionSelected={setDireccionFiscal}
                initialDireccion={direccionFiscal}
              />
            </div>

            {/* Teléfono */}
            <div className="auth-input-group-duo">
              <div>
                <label htmlFor="codigo-tel">Código</label>
                <select
                  id="codigo-tel"
                  value={codigoTelefono}
                  onChange={(e) => setCodigoTelefono(e.target.value)}
                >
                  {CODIGOS_TELEFONO.map((codigo) => (
                    <option key={codigo} value={codigo}>
                      +58 {codigo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="digitos-tel">7 dígitos</label>
                <input
                  id="digitos-tel"
                  type="text"
                  inputMode="numeric"
                  value={telefonoDigitos}
                  onChange={(e) => {
                    const nums = e.target.value.replace(/\D/g, '').slice(0, 7)
                    setTelefonoDigitos(nums)
                  }}
                  placeholder="Ej: 9494532"
                  maxLength="7"
                  required
                />
              </div>
            </div>

            {/* Honeypot */}
            <div className="auth-honeypot" aria-hidden="true">
              <input
                type="text"
                tabIndex="-1"
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Términos */}
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
                    Tus datos (nombre, correo, RIF/Cédula, teléfono y dirección) se usan
                    únicamente para gestionar tu cuenta, procesar tus pedidos y facturación
                    con Droguería Carrisán, C.A. No se comparten con terceros ajenos a esta
                    operación.
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <button
              type="button"
              className="auth-submit auth-submit--secondary"
              onClick={() => setTipoCliente(null)}
            >
              Cambiar tipo de cliente
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </main>

        <footer className="auth-footer">
          <div className="auth-footer-content">
            <span className="auth-footer-rif">RIF J-40068410-2</span>
            <div className="auth-footer-links">
              <Link to="/terminos">Términos de uso</Link>
              <Link to="/privacidad">Aviso de privacidad</Link>
              <Link to="/contacto">Soporte</Link>
            </div>
            © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    )
  }

  // Step 3: Registro Institución
  return (
    <div className="auth-page">
      <main className="auth-container">
        <Link to="/" className="auth-logo">
          <img
            src={require('../assets/logo/minilogo color sin fondo.png')}
            alt="Logo"
            className="logologin"
          />
        </Link>

        <h1 className="auth-title">Crear tu cuenta</h1>
        <p className="auth-subtitle">Completa los datos de tu institución</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleRegistroInstitucion}>
          {/* Email */}
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
          ) : (
            <div className="auth-input-group">
              <label htmlFor="email-institucion">Correo electrónico</label>
              <input
                id="email-institucion"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          )}

          {/* Contraseña */}
          <div className="auth-input-group">
            <label htmlFor="password-institucion">Contraseña</label>
            <input
              id="password-institucion"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              autoComplete="new-password"
              placeholder="Mín. 6 caracteres, 1 letra y 1 número"
              required
            />
            {passwordError && <span className="auth-field-error">{passwordError}</span>}
          </div>

          {/* Nombre Institución */}
          <div className="auth-input-group">
            <label htmlFor="nombre-institucion">
              Nombre de la institución (exactamente como aparece en el RIF)
            </label>
            <input
              id="nombre-institucion"
              type="text"
              value={nombreInstitucion}
              onChange={(e) => setNombreInstitucion(e.target.value)}
              placeholder="Ej: CLÍNICA CARDIOLOGÍA VENEZUELA C.A."
              required
            />
          </div>

          {/* RIF Institución */}
          <div className="auth-input-group">
            <label htmlFor="rif-institucion">
              RIF (9 dígitos + verificador, ej: 40068410-2)
            </label>
            <div className="auth-rif-institucion">
              <span className="auth-rif-prefijo">J-</span>
              <input
                id="rif-institucion"
                type="text"
                inputMode="numeric"
                value={rifNumerosInst}
                onChange={(e) => setRifNumerosInst(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 400684102"
                maxLength="9"
                required
              />
            </div>
          </div>

          {/* Dirección Fiscal */}
          <div className="auth-input-group">
            <label>Dirección fiscal (exactamente como aparece en el RIF)</label>
            <MapaPicker
              onDireccionSelected={setDireccionFiscalInst}
              initialDireccion={direccionFiscalInst}
            />
          </div>

          {/* Dirección Entrega */}
          <div className="auth-input-group">
            <label htmlFor="direccion-entrega">Dirección de entrega preferida</label>
            <textarea
              id="direccion-entrega"
              value={direccionEntregaInst}
              onChange={(e) => setDireccionEntregaInst(e.target.value)}
              placeholder="Calle, número, ciudad, estado, código postal"
              rows="3"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="auth-input-group-duo">
            <div>
              <label htmlFor="codigo-tel-inst">Código</label>
              <select
                id="codigo-tel-inst"
                value={codigoTelefonoInst}
                onChange={(e) => setCodigoTelefonoInst(e.target.value)}
              >
                {CODIGOS_TELEFONO.map((codigo) => (
                  <option key={codigo} value={codigo}>
                    +58 {codigo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="digitos-tel-inst">7 dígitos</label>
              <input
                id="digitos-tel-inst"
                type="text"
                inputMode="numeric"
                value={telefonoDigitosInst}
                onChange={(e) => {
                  const nums = e.target.value.replace(/\D/g, '').slice(0, 7)
                  setTelefonoDigitosInst(nums)
                }}
                placeholder="Ej: 2419876"
                maxLength="7"
                required
              />
            </div>
          </div>

          {/* Honeypot */}
          <div className="auth-honeypot" aria-hidden="true">
            <input
              type="text"
              tabIndex="-1"
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Términos */}
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
                  Los datos de tu institución (nombre, correo, RIF, direcciones y teléfono)
                  se usan únicamente para gestionar tu cuenta, procesar pedidos y facturación
                  con Droguería Carrisán, C.A. No se comparten con terceros.
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <button
            type="button"
            className="auth-submit auth-submit--secondary"
            onClick={() => setTipoCliente(null)}
          >
            Cambiar tipo de cliente
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </main>

      <footer className="auth-footer">
        <div className="auth-footer-content">
          <span className="auth-footer-rif">RIF J-40068410-2</span>
          <div className="auth-footer-links">
            <Link to="/terminos">Términos de uso</Link>
            <Link to="/privacidad">Aviso de privacidad</Link>
            <Link to="/contacto">Soporte</Link>
          </div>
          © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

export default RegistroConTipo
