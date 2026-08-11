import { useState } from 'react'
import api from '../../api/axios'
import './PagoForm.css'

function PagoForm({ clienteId, facturasPendientes, onClose, onGuardado }) {
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('abono')
  const [detalle, setDetalle] = useState('')
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  const detalleObligatorio = tipo !== 'abono'

  function toggleFactura(facturaId) {
    setFacturasSeleccionadas((prev) =>
      prev.includes(facturaId)
        ? prev.filter((id) => id !== facturaId)
        : [...prev, facturaId]
    )
  }

  function validar() {
    const errs = {}
    if (!monto || Number(monto) <= 0) errs.monto = 'Ingresa un monto válido'
    if (detalleObligatorio && !detalle.trim()) errs.detalle = 'El detalle es obligatorio para este tipo'
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validar()) return

    setGuardando(true)

    try {
      await api.post('/pagos', {
        usuario_id: clienteId,
        monto: Number(monto),
        tipo,
        detalle: detalle || undefined,
        factura_ids: facturasSeleccionadas,
      })
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el pago')
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pago-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Registrar Pago</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>Tipo de Movimiento</label>
              <div className="tipo-pago-selector">
                <label className={`tipo-option ${tipo === 'abono' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="abono"
                    checked={tipo === 'abono'}
                    onChange={(e) => setTipo(e.target.value)}
                  />
                  <span className="tipo-icon">💵</span>
                  <span className="tipo-label">Abono</span>
                </label>
                <label className={`tipo-option ${tipo === 'devolucion' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="devolucion"
                    checked={tipo === 'devolucion'}
                    onChange={(e) => setTipo(e.target.value)}
                  />
                  <span className="tipo-icon">↩️</span>
                  <span className="tipo-label">Devolución</span>
                </label>
                <label className={`tipo-option ${tipo === 'nota_credito' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="nota_credito"
                    checked={tipo === 'nota_credito'}
                    onChange={(e) => setTipo(e.target.value)}
                  />
                  <span className="tipo-icon">📝</span>
                  <span className="tipo-label">Nota Crédito</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Monto (USD) *</label>
              <div className="input-precio">
                <span className="precio-simbolo">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => { setMonto(e.target.value); setErrores({...errores, monto: ''}) }}
                  className={errores.monto ? 'error' : ''}
                  placeholder="0.00"
                  required
                />
              </div>
              {errores.monto && <span className="error-text">{errores.monto}</span>}
            </div>

            <div className="form-group">
              <label>
                Detalle {detalleObligatorio ? '(obligatorio)' : '(opcional)'}
              </label>
              <textarea
                value={detalle}
                onChange={(e) => { setDetalle(e.target.value); setErrores({...errores, detalle: ''}) }}
                className={errores.detalle ? 'error' : ''}
                rows="2"
                placeholder={
                  tipo === 'abono' 
                    ? 'Ej: Transferencia bancaria...' 
                    : 'Describí el motivo de este movimiento...'
                }
              />
              {errores.detalle && <span className="error-text">{errores.detalle}</span>}
            </div>

            <div className="form-group">
              <label>Facturas pendientes (opcional)</label>
              {facturasPendientes.length === 0 ? (
                <p className="text-muted">Este cliente no tiene facturas pendientes</p>
              ) : (
                <div className="facturas-checklist">
                  <div className="checklist-header">
                    <span>{facturasSeleccionadas.length} seleccionadas</span>
                  </div>
                  {facturasPendientes.map((factura) => (
                    <label key={factura.id} className="checklist-item">
                      <input
                        type="checkbox"
                        checked={facturasSeleccionadas.includes(factura.id)}
                        onChange={() => toggleFactura(factura.id)}
                      />
                      <div className="checklist-item-info">
                        <strong>#{factura.numero_factura}</strong>
                      </div>
                      <span className="checklist-item-monto">
                        ${Number(factura.monto_facturado).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-navegacion">
            <button type="button" onClick={onClose} className="btn-secundario">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="btn-guardar">
              {guardando ? (
                <><span className="spinner-small"></span> Guardando...</>
              ) : (
                '💾 Registrar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PagoForm