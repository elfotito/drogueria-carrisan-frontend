import { useState } from 'react'
import api from '../../api/axios'

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
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
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
      ...(esEdicion && { activo })
    }

    // Solo enviar password si se está creando o si se cambió en edición
    if (!esEdicion) {
      if (!password) {
        setError('La contraseña es requerida para nuevos usuarios')
        setGuardando(false)
        return
      }
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
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label>
            Email *
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Contraseña {esEdicion && '(dejar vacío para mantener)'}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!esEdicion}
              minLength="6"
            />
          </label>

          <label>
            Nombre completo
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Etiqueta / Rol
            <select 
              value={etiqueta} 
              onChange={(e) => setEtiqueta(e.target.value)}
            >
              <option value="distribuidor">Distribuidor</option>
              <option value="admin">Administrador</option>
              <option value="cliente">Cliente</option>
            </select>
          </label>

          <label>
            RIF / Cédula
            <input
              value={rifCedula}
              onChange={(e) => setRifCedula(e.target.value)}
              placeholder="J-12345678-9"
            />
          </label>

          <label>
            Dirección Fiscal
            <textarea
              value={direccionFiscal}
              onChange={(e) => setDireccionFiscal(e.target.value)}
              rows="2"
              placeholder="Dirección principal de la empresa"
            />
          </label>

          <label>
            Dirección de Entrega
            <textarea
              value={direccionEntrega}
              onChange={(e) => setDireccionEntrega(e.target.value)}
              rows="2"
              placeholder="Dirección para envíos"
            />
          </label>

          <label>
            Teléfono
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+58 212-555-1234"
            />
          </label>

          <label>
            Línea de Crédito (USD)
            <input
              type="number"
              step="0.01"
              min="0"
              value={lineaCredito}
              onChange={(e) => setLineaCredito(e.target.value)}
              placeholder="0.00"
            />
          </label>

<div style={{ marginTop: '16px' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input
      type="checkbox"
      checked={formData.delivery_gratis || false}
      onChange={(e) => setFormData({...formData, delivery_gratis: e.target.checked})}
    />
    <div>
      <strong>🚚 Delivery Gratis</strong>
      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>
        El cliente no pagará los $8.00 de envío en moto
      </p>
    </div>
  </label>
</div>

          {esEdicion && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              Usuario activo
            </label>
          )}

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm