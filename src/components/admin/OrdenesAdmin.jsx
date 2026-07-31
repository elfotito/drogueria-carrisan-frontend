import { useState, useEffect } from 'react'
import api from '../../api/axios'
import OrdenDetalleModal from '../OrdenDetalleModal'

function OrdenesAdmin() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  async function cargarOrdenes() {
    try {
      const { data } = await api.get('/orders')
      setOrdenes(data)
    } catch (err) {
      setError('No se pudieron cargar las órdenes')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function handleCambiarEstado(ordenId, nuevoEstado) {
    try {
      await api.patch(`/orders/${ordenId}/estado`, { estado: nuevoEstado })
      // Actualizamos localmente en vez de volver a pedir todo -- más rápido
      setOrdenes((prev) =>
        prev.map((o) => (o.id === ordenId ? { ...o, estado: nuevoEstado } : o))
      )
    } catch (err) {
      alert('No se pudo actualizar el estado')
      console.error(err)
    }
  }

  if (cargando) return <p>Cargando órdenes...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Órdenes</h2>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <tr key={orden.id}>
              <td>{orden.id}</td>
              <td>{orden.users?.nombre || orden.users?.email}</td>
              <td>${orden.total_usd.toFixed(2)}</td>
              <td>
                <select
                  value={orden.estado}
                  onChange={(e) => handleCambiarEstado(orden.id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </td>
              <td>{new Date(orden.created_at).toLocaleDateString('es-VE')}</td>
              <td>
                <button onClick={() => setOrdenSeleccionada(orden)}>Ver detalle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <OrdenDetalleModal
        orden={ordenSeleccionada}
        onClose={() => setOrdenSeleccionada(null)}
      />
    </div>
  )
}

export default OrdenesAdmin