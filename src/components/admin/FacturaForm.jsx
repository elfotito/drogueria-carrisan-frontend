import { useState, useEffect } from 'react'
import api from '../../api/axios'

function FacturaForm({ clienteId, factura, onClose, onGuardado }) {
  const esEdicion = Boolean(factura)

  const [ordenesDisponibles, setOrdenesDisponibles] = useState([])
  const [ordenesSeleccionadas, setOrdenesSeleccionadas] = useState([])
  const [numeroFactura, setNumeroFactura] = useState(factura?.numero_factura || '')
  const [montoFacturado, setMontoFacturado] = useState(factura?.monto_facturado || '')
  const [nota, setNota] = useState(factura?.nota || '')
  const [montoEditadoManualmente, setMontoEditadoManualmente] = useState(esEdicion) // en edición, no auto-calculamos
  const [cargando, setCargando] = useState(!esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!esEdicion) {
      cargarOrdenesSinFacturar()
    }
  }, [])

  async function cargarOrdenesSinFacturar() {
    try {
      const { data } = await api.get(`/facturas/sin-facturar/${clienteId}`)
      setOrdenesDisponibles(data)
    } catch (err) {
      setError('No se pudieron cargar las órdenes del cliente')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (montoEditadoManualmente) return

    const suma = ordenesDisponibles
      .filter((o) => ordenesSeleccionadas.includes(o.id))
      .reduce((acc, o) => acc + Number(o.total_usd), 0)

    setMontoFacturado(suma.toFixed(2))
  }, [ordenesSeleccionadas, ordenesDisponibles, montoEditadoManualmente])

  function toggleOrden(ordenId) {
    setOrdenesSeleccionadas((prev) =>
      prev.includes(ordenId)
        ? prev.filter((id) => id !== ordenId)
        : [...prev, ordenId]
    )
  }

  function handleMontoChange(e) {
    setMontoEditadoManualmente(true)
    setMontoFacturado(e.target.value)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      if (esEdicion) {
        await api.patch(`/facturas/${factura.id}`, {
          numero_factura: numeroFactura,
          monto_facturado: Number(montoFacturado),
          nota: nota || undefined,
        })
      } else {
        await api.post('/facturas', {
          usuario_id: clienteId,
          numero_factura: numeroFactura,
          monto_facturado: Number(montoFacturado),
          nota: nota || undefined,
          orden_ids: ordenesSeleccionadas,
        })
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la factura')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{esEdicion ? 'Editar factura' : 'Nueva factura'}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Número de factura
            <input
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              required
            />
          </label>

          {!esEdicion && (
            <>
              <h4>Órdenes sin facturar</h4>

              {cargando ? (
                <p>Cargando órdenes...</p>
              ) : ordenesDisponibles.length === 0 ? (
                <p>Este cliente no tiene órdenes pendientes de facturar</p>
              ) : (
                <ul className="checklist-ordenes">
                  {ordenesDisponibles.map((orden) => (
                    <li key={orden.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={ordenesSeleccionadas.includes(orden.id)}
                          onChange={() => toggleOrden(orden.id)}
                        />
                        Orden #{orden.id} — ${Number(orden.total_usd).toFixed(2)} —{' '}
                        {new Date(orden.created_at).toLocaleDateString('es-VE')}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <label>
            Monto facturado (USD)
            <input
              type="number"
              step="0.01"
              min="0"
              value={montoFacturado}
              onChange={handleMontoChange}
              required
            />
          </label>

          <label>
            Nota (opcional)
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} />
          </label>

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear factura'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FacturaForm