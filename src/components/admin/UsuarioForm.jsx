import { useState } from 'react'
import api from '../../api/axios'
import './UsuarioForm.css'

function UsuarioForm({ usuario, onClose, onGuardado }) {
  const esEdicion = Boolean(usuario)

  const [email, setEmail] = useState(usuario?.email || '')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [etiqueta, setEtiqueta] = useState(usuario?.etiqueta || 'distribuidor')
  const [rifCedula, setRifCedula] = useState(usuario?.rif_cedula || '')
  const [direccionFiscal, setDireccionFiscal] = useState(usuario?.direccion_fiscal || '')
  const [direccionEntrega, setDireccionEntrega] = useState(usuario?.direccion_entrega || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || '')
  const [lineaCredito, setLineaCredito] = useState(usuario?.linea_credito || '')
  const [activo, setActivo] = useState(usuario?.activo ?? true)
  const [deliveryGratis, setDeliveryGratis] = useState(usuario?.delivery_gratis || false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [paso, setPaso] = useState(1)

  function validarPaso1() {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Email inválido'
    }
    
    if (!esEdicion && !password) {
      errs.password = 'La contraseña es requerida'
    } else if (password && password.length < 6) {
      errs.password = 'Mínimo 6 caracteres'
    }
    
    if (!nombre.trim()) {
      errs.nombre = 'El nombre es requerido'
    }
    
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function validarPaso2() {
    const errs = {}
    // Las validaciones del paso 2 son opcionales, solo validar formato si hay datos
    if (rifCedula && rifCedula.length < 6) {
      errs.rifCedula = 'RIF/Cédula muy corto'
    }
    if (telefono && telefono.length < 7) {
      errs.telefono = 'Teléfono muy corto'
    }
    if (lineaCredito && Number(lineaCredito) < 0) {
      errs.lineaCredito = 'El crédito no puede ser negativo'
    }
    
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function handleSiguiente() {
    if (paso === 1) {
      if (validarPaso1()) {
        setPaso(2)
      }
    } else if (paso === 2) {
      // Paso 2 no requiere validación estricta, solo validar formato
      validarPaso2()
      setPaso(3)
    }
  }

  function handleAnterior() {
    setPaso(p => Math.max(1, p - 1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validar todo antes de guardar
    if (!validarPaso1()) {
      setPaso(1)
      return
    }

    setGuardando(true)

    const payload = {
      email,
      nombre,
      etiqueta,
      rif_cedula: rifCedula || null,
      direccion_fiscal: direccionFiscal || null,
      direccion_entrega: direccionEntrega || null,
      telefono: telefono || null,
      linea_credito: Number(lineaCredito) || 0,
      delivery_gratis: deliveryGratis,
      ...(esEdicion && { activo })
    }

    if (!esEdicion) {
      payload.password = password
    } else if (password) {
      payload.password = password
    }

    try {
      if (esEdicion) {
        await api.patch(`/users/${usuario.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario')
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content usuario-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{esEdicion ? '✏️ Editar Usuario' : '🆕 Nuevo Usuario'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Pasos */}
        <div className="form-pasos">
          <div className={`paso ${paso === 1 ? 'active' : paso > 1 ? 'completed' : ''}`}>
            <div className="paso-numero">{paso > 1 ? '✓' : '1'}</div>
            <span>Cuenta</span>
          </div>
          <div className="paso-linea"></div>
          <div className={`paso ${paso === 2 ? 'active' : paso > 2 ? 'completed' : ''}`}>
            <div className="paso-numero">{paso > 2 ? '✓' : '2'}</div>
            <span>Contacto</span>
          </div>
          <div className="paso-linea"></div>
          <div className={`paso ${paso === 3 ? 'active' : ''}`}>
            <div className="paso-numero">3</div>
            <span>Preferencias</span>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Paso 1: Cuenta */}
          {paso === 1 && (
            <div className="form-section">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrores({...errores, email: ''}) }}
                  className={errores.email ? 'error' : ''}
                  placeholder="usuario@ejemplo.com"
                />
                {errores.email && <span className="error-text">{errores.email}</span>}
              </div>

              <div className="form-group">
                <label>
                  Contraseña {esEdicion && '(dejar vacío para mantener la actual)'}
                  {!esEdicion && ' *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrores({...errores, password: ''}) }}
                  className={errores.password ? 'error' : ''}
                  placeholder={esEdicion ? '•••••••• (sin cambios)' : 'Mínimo 6 caracteres'}
                  minLength={!esEdicion ? 6 : undefined}
                />
                {errores.password && <span className="error-text">{errores.password}</span>}
              </div>

              <div className="form-group">
                <label>Nombre completo *</label>
                <input
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrores({...errores, nombre: ''}) }}
                  className={errores.nombre ? 'error' : ''}
                  placeholder="Nombre y apellido"
                />
                {errores.nombre && <span className="error-text">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Etiqueta / Rol</label>
                <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)}>
                  <option value="distribuidor">🏢 Distribuidor</option>
                  <option value="admin">🛡️ Administrador</option>
                  <option value="cliente">👤 Cliente</option>
                </select>
              </div>
            </div>
          )}

          {/* Paso 2: Contacto */}
          {paso === 2 && (
            <div className="form-section">
              <div className="form-group">
                <label>RIF / Cédula</label>
                <input
                  value={rifCedula}
                  onChange={(e) => { setRifCedula(e.target.value); setErrores({...errores, rifCedula: ''}) }}
                  className={errores.rifCedula ? 'error' : ''}
                  placeholder="J-12345678-9"
                />
                {errores.rifCedula && <span className="error-text">{errores.rifCedula}</span>}
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => { setTelefono(e.target.value); setErrores({...errores, telefono: ''}) }}
                  className={errores.telefono ? 'error' : ''}
                  placeholder="+58 212-555-1234"
                />
                {errores.telefono && <span className="error-text">{errores.telefono}</span>}
              </div>

              <div className="form-group">
                <label>Dirección Fiscal</label>
                <textarea
                  value={direccionFiscal}
                  onChange={(e) => setDireccionFiscal(e.target.value)}
                  rows="2"
                  placeholder="Dirección principal de la empresa"
                />
              </div>

              <div className="form-group">
                <label>Dirección de Entrega</label>
                <textarea
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  rows="2"
                  placeholder="Dirección para envíos"
                />
              </div>
            </div>
          )}

          {/* Paso 3: Preferencias */}
          {paso === 3 && (
            <div className="form-section">
              <div className="form-group">
                <label>Línea de Crédito (USD)</label>
                <div className="input-precio">
                  <span className="precio-simbolo">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lineaCredito}
                    onChange={(e) => setLineaCredito(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Delivery Gratis */}
              <div className="form-group">
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={deliveryGratis}
                    onChange={(e) => setDeliveryGratis(e.target.checked)}
                  />
                  <div className="checkbox-card-content">
                    <div className="checkbox-card-header">
                      <span className="checkbox-card-icon">🛵</span>
                      <strong>Delivery Gratis</strong>
                    </div>
                    <small>El cliente no pagará los $8.00 de envío en moto dentro de la ciudad</small>
                  </div>
                </label>
              </div>

              {/* Estado (solo edición) */}
              {esEdicion && (
                <div className="form-group">
                  <label className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                    />
                    <div className="checkbox-card-content">
                      <div className="checkbox-card-header">
                        <span className="checkbox-card-icon">{activo ? '✅' : '❌'}</span>
                        <strong>Usuario Activo</strong>
                      </div>
                      <small>Los usuarios inactivos no pueden iniciar sesión</small>
                    </div>
                  </label>
                </div>
              )}

              {/* Resumen */}
              <div className="resumen-card">
                <h4>📋 Resumen del Usuario</h4>
                <div className="resumen-item">
                  <span>Email:</span>
                  <strong>{email || '-'}</strong>
                </div>
                <div className="resumen-item">
                  <span>Nombre:</span>
                  <strong>{nombre || '-'}</strong>
                </div>
                <div className="resumen-item">
                  <span>Rol:</span>
                  <span className={`etiqueta-badge etiqueta-${etiqueta}`}>
                    {etiqueta === 'admin' ? '🛡️ Admin' :
                     etiqueta === 'distribuidor' ? '🏢 Distribuidor' : '👤 Cliente'}
                  </span>
                </div>
                <div className="resumen-item">
                  <span>Crédito:</span>
                  <strong>${Number(lineaCredito || 0).toFixed(2)}</strong>
                </div>
                <div className="resumen-item">
                  <span>Delivery:</span>
                  <strong>{deliveryGratis ? '🛵 Gratis' : 'Pago normal'}</strong>
                </div>
                {esEdicion && (
                  <div className="resumen-item">
                    <span>Estado:</span>
                    <strong>{activo ? '✅ Activo' : '❌ Inactivo'}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="form-navegacion">
            {paso > 1 ? (
              <button type="button" onClick={handleAnterior} className="btn-secundario">
                ← Anterior
              </button>
            ) : (
              <button type="button" onClick={onClose} className="btn-secundario">
                Cancelar
              </button>
            )}
            
            {paso < 3 ? (
              <button 
                type="button" 
                onClick={handleSiguiente}
                className="btn-primario"
              >
                Siguiente →
              </button>
            ) : (
              <button type="submit" disabled={guardando} className="btn-guardar">
                {guardando ? (
                  <>
                    <span className="spinner-small"></span>
                    Guardando...
                  </>
                ) : (
                  esEdicion ? '💾 Guardar Cambios' : '✨ Crear Usuario'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm