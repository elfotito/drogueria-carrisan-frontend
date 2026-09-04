import { useEffect, useState } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutStaff from '../../components/staff/LayoutStaff'
import './StaffPlaceholder.css'

function StaffDespacho() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(null)

  async function cargarCola() {
    setCargando(true)
    setError('')
    try {
      const { data } = await staffApi.get('/staff/despacho')
      setOrdenes(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la cola de despacho')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCola()
  }, [])

  async function marcarEntregado(id) {
    setProcesando(id)
    try {
      await staffApi.patch(`/staff/despacho/${id}/entregar`)
      setOrdenes((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo marcar como entregado')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <LayoutStaff activo="despacho" titulo="Envíos por despachar">
    <div className="staff-placeholder">
      <h1>Envíos por despachar</h1>

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}
      {!cargando && !error && ordenes.length === 0 && (
        <p>No hay órdenes en estado "enviado" ahora mismo.</p>
      )}

      {ordenes.map((orden) => (
        <div key={orden.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, background: 'white' }}>
          <p><strong>Orden #{orden.id}</strong> — ${orden.total_usd}</p>
          <p>{orden.users?.nombre} {orden.users?.telefono ? `— ${orden.users.telefono}` : ''}</p>

          {orden.tipo_envio === 'delivery' && orden.direcciones_envio && (
            <p>{orden.direcciones_envio.direccion}, {orden.direcciones_envio.ciudad}</p>
          )}
          {orden.tipo_envio === 'envio_nacional' && (
            <p>Envío nacional{orden.agencia_envio ? ` — Agencia: ${orden.agencia_envio}` : ''}</p>
          )}
          {orden.tipo_envio === 'retiro' && <p>Retiro en tienda</p>}

          <ul>
            {(orden.ordenes_items || []).map((item) => (
              <li key={item.id}>{item.cantidad}x {item.productos?.nombre_comercial}</li>
            ))}
          </ul>

          <button
            onClick={() => marcarEntregado(orden.id)}
            disabled={procesando === orden.id}
          >
            {procesando === orden.id ? 'Marcando...' : 'Marcar como entregado'}
          </button>
        </div>
      ))}
    </div>
    </LayoutStaff>
  )
}

export default StaffDespacho