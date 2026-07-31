import { useState } from 'react'
import api from '../../api/axios'

function PagoForm({ clienteId, facturasPendientes, onClose, onGuardado }) {
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('abono')
  const [detalle, setDetalle] = useState('')
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState([]) // array de ids
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const detalleObligatorio = tipo !== 'abono'

  function toggleFactura(facturaId) {
    setFacturasSeleccionadas((prev) =>
      prev.includes(facturaId)
        ? prev.filter((id) => id !== facturaId)
        : [...prev, facturaId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (detalleObligatorio && !detalle.trim()) {
      setError('El detalle es obligatorio para devoluciones y notas de crédito')
      return
    }

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
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Nuevo abono</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="abono">Abono</option>
              <option value="devolucion">Devolución</option>
              <option value="nota_credito">Nota de crédito</option>
            </select>
          </label>

          <label>
            Monto (USD)
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </label>

          <label>
            Detalle {detalleObligatorio ? '(obligatorio)' : '(opcional)'}
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              required={detalleObligatorio}
            />
          </label>

          <h4>Facturas pendientes (opcional)</h4>

          {facturasPendientes.length === 0 ? (
            <p>Este cliente no tiene facturas pendientes</p>
          ) : (
            <ul className="checklist-facturas">
              {facturasPendientes.map((factura) => (
                <li key={factura.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={facturasSeleccionadas.includes(factura.id)}
                      onChange={() => toggleFactura(factura.id)}
                    />
                    #{factura.numero_factura} — ${Number(factura.monto_facturado).toFixed(2)}
                  </label>
                </li>
              ))}
            </ul>
          )}

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar pago'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PagoForm