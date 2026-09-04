import { useEffect, useState } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutStaff from '../../components/staff/LayoutStaff'
import './StaffAlmacen.css'

function StaffAlmacen() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(null)

  async function cargarCola() {
    setCargando(true)
    setError('')
    try {
      const { data } = await staffApi.get('/staff/almacen')
      setOrdenes(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la cola de preparación')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCola()
  }, [])

  async function avanzar(id, estadoDestino) {
    setProcesando(`${id}-${estadoDestino}`)
    try {
      await staffApi.patch(`/staff/almacen/${id}/${estadoDestino}`)
      setOrdenes((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar la orden')
    } finally {
      setProcesando(null)
    }
  }

  const pendientes = ordenes.filter((o) => o.estado === 'procesando')
  const preparando = ordenes.filter((o) => o.estado === 'preparando')

  function renderOrden(orden) {
    const esProcesando = orden.estado === 'procesando'
    return (
      <div key={orden.id} className="staff-almacen-card">
        <div className="staff-almacen-card-head">
          <p className="staff-almacen-card-titulo">Orden #{orden.id} — ${orden.total_usd}</p>
          <span className={`staff-almacen-badge ${esProcesando ? 'staff-almacen-badge--procesando' : 'staff-almacen-badge--preparando'}`}>
            {orden.estado}
          </span>
        </div>
        <p className="staff-almacen-card-cliente">
          {orden.users?.nombre} {orden.users?.telefono ? `— ${orden.users.telefono}` : ''}
        </p>
        {orden.forma_pago === 'credito' && (
          <p className="staff-almacen-card-meta">A crédito · Forma de pago: {orden.forma_pago}</p>
        )}

        <ul>
          {(orden.ordenes_items || []).map((item) => (
            <li key={item.id}>{item.cantidad}x {item.productos?.nombre_comercial}</li>
          ))}
        </ul>

        {esProcesando ? (
          <button className="staff-almacen-btn" onClick={() => avanzar(orden.id, 'preparando')} disabled={procesando === `${orden.id}-preparando`}>
            {procesando === `${orden.id}-preparando` ? 'Preparando...' : 'Pasar a preparando'}
          </button>
        ) : (
          <button className="staff-almacen-btn staff-almacen-btn--principal" onClick={() => avanzar(orden.id, 'enviado')} disabled={procesando === `${orden.id}-enviado`}>
            {procesando === `${orden.id}-enviado` ? 'Enviando...' : 'Marcar como enviado'}
          </button>
        )}
      </div>
    )
  }

  return (
    <LayoutStaff activo="almacen" titulo="Preparación de pedidos">
      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}

      {!cargando && !error && ordenes.length === 0 && (
        <p>No hay órdenes en preparación ahora mismo.</p>
      )}

      {!cargando && !error && ordenes.length > 0 && (
        <>
          {preparando.length > 0 && (
            <section className="staff-almacen-grupo">
              <h2 className="staff-almacen-grupo-titulo">Listas para enviar</h2>
              {preparando.map(renderOrden)}
            </section>
          )}
          {pendientes.length > 0 && (
            <section className="staff-almacen-grupo">
              <h2 className="staff-almacen-grupo-titulo">Por preparar</h2>
              {pendientes.map(renderOrden)}
            </section>
          )}
        </>
      )}
    </LayoutStaff>
  )
}

export default StaffAlmacen
