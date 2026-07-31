import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import OrdenDetalleModal from '../components/OrdenDetalleModal'

function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
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

    cargarOrdenes()
  }, [])

  if (cargando) return <p>Cargando órdenes...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (ordenes.length === 0) return <p>No tenés órdenes todavía</p>

  return (
    <div>
      <h1>{user.es_admin ? 'Todas las Órdenes' : 'Mis Órdenes'}</h1>

      {ordenes.map((orden) => (
        <div key={orden.id} className="orden-card">
          <p><strong>Orden #{orden.id}</strong></p>
          {user.es_admin && <p>Cliente: {orden.users?.nombre}</p>}
          <p>Estado: {orden.estado}</p>
          <p>Total: ${orden.total_usd.toFixed(2)}</p>
          <p>Fecha: {new Date(orden.created_at).toLocaleDateString('es-VE')}</p>
          <button onClick={() => setOrdenSeleccionada(orden)}>Ver detalle</button>
        </div>
      ))}

      <OrdenDetalleModal
        orden={ordenSeleccionada}
        onClose={() => setOrdenSeleccionada(null)}
      />
    </div>
  )
}

export default MisOrdenes