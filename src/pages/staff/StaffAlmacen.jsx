import { useEffect, useState } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import './StaffAlmacen.css'

function formatUSD(valor) {
  return Number(valor || 0).toFixed(2)
}

const TABS = [
  { id: 'revisar', texto: 'Por revisar' },
  { id: 'preparar', texto: 'Por preparar' },
]

function StaffAlmacen() {
  const [tab, setTab] = useState('revisar')
  const [revisar, setRevisar] = useState([])
  const [preparar, setPreparar] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargarTodo() {
    setError('')
    try {
      const [r, p] = await Promise.all([
        staffApi.get('/staff/almacen/revisar'),
        staffApi.get('/staff/almacen/preparar'),
      ])
      setRevisar(r.data)
      setPreparar(p.data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el almacén')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  const contador = (idTab) => (idTab === 'revisar' ? revisar.length : preparar.length)

  return (
    <LayoutDepartamento departamento="logistica" activo="almacen" titulo="Almacén — pedidos">
      <div className="staff-almacen-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`staff-almacen-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.texto}
            {contador(t.id) > 0 && <span className="staff-almacen-tab-contador">{contador(t.id)}</span>}
          </button>
        ))}
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}

      {!cargando && !error && tab === 'revisar' && (
        <TabPorRevisar ordenes={revisar} onRecargar={cargarTodo} />
      )}
      {!cargando && !error && tab === 'preparar' && (
        <TabPorPreparar ordenes={preparar} onRecargar={cargarTodo} />
      )}
    </LayoutDepartamento>
  )
}

// ------------------------------------------------------------------
// Tab 1: Por revisar — editor de cantidades / anulado + aprobar / cancelar
// ------------------------------------------------------------------
function TabPorRevisar({ ordenes, onRecargar }) {
  const [editando, setEditando] = useState(null)
  const [items, setItems] = useState([])
  const [procesando, setProcesando] = useState(false)

  if (ordenes.length === 0) {
    return <p>No hay pedidos por revisar.</p>
  }

  function abrirEditor(orden) {
    setEditando(orden)
    setItems((orden.ordenes_items || []).map((i) => ({
      id: i.id,
      nombre: i.productos?.nombre_comercial || 'Producto',
      cantidad: i.cantidad,
      cantidadOriginal: i.cantidad,
      precio_unitario: i.precio_unitario,
      anulado: i.anulado || false,
      anuladoOriginal: i.anulado || false,
      nota_anulacion: i.nota_anulacion || '',
      total_item: Number(i.precio_unitario) * i.cantidad,
    })))
  }

  function cerrar() {
    setEditando(null)
    setItems([])
  }

  function cambiarCantidad(id, delta) {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id || i.anulado) return i
      const nueva = i.cantidad + delta
      if (nueva < 1) return i
      return { ...i, cantidad: nueva, total_item: Number(i.precio_unitario) * nueva }
    }))
  }

  function toggleAnulado(id) {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i
      const anulado = !i.anulado
      return { ...i, anulado, total_item: anulado ? 0 : Number(i.precio_unitario) * i.cantidad }
    }))
  }

  function cambiarNota(id, nota) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, nota_anulacion: nota } : i)))
  }

  const total = items.reduce((s, i) => s + i.total_item, 0)
  const huboCambios = items.some((i) => i.cantidad !== i.cantidadOriginal || i.anulado !== i.anuladoOriginal)

  async function aprobar() {
    setProcesando(true)
    try {
      const payload = items.map((i) => {
        const body = { id: i.id }
        if (i.cantidad !== i.cantidadOriginal) body.cantidad = i.cantidad
        if (i.anulado !== i.anuladoOriginal) {
          body.anulado = i.anulado
          if (i.anulado) body.nota_anulacion = i.nota_anulacion || 'Agotado'
        }
        return body
      })
      await staffApi.patch(`/staff/almacen/${editando.id}/aprobar`, { items: payload })
      cerrar()
      await onRecargar()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo aprobar la orden')
    } finally {
      setProcesando(false)
    }
  }

  async function cancelar(orden) {
    if (!window.confirm(`¿Cancelar la orden #${orden.id} de ${orden.users?.nombre || 'cliente'}? Esta acción no se puede deshacer.`)) return
    setProcesando(true)
    try {
      await staffApi.patch(`/staff/almacen/${orden.id}/cancelar`)
      await onRecargar()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la orden')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      {ordenes.map((orden) => (
        <div key={orden.id} className="staff-almacen-card">
          <div className="staff-almacen-card-head">
            <p className="staff-almacen-card-titulo">Orden #{orden.id} — ${formatUSD(orden.total_usd)}</p>
            <span className={`staff-almacen-badge ${orden.forma_pago === 'credito' ? 'staff-almacen-badge--credito' : 'staff-almacen-badge--contado'}`}>
              {orden.forma_pago === 'credito' ? 'Crédito' : 'Contado'}
            </span>
          </div>
          <p className="staff-almacen-card-cliente">
            {orden.users?.nombre} {orden.users?.telefono ? `— ${orden.users.telefono}` : ''}
          </p>
          <ul>
            {(orden.ordenes_items || []).map((item) => (
              <li key={item.id} className={item.anulado ? 'staff-almacen-item--anulado' : ''}>
                {item.cantidad}x {item.productos?.nombre_comercial}
                {item.anulado && <span className="staff-almacen-item-agotado"> — agotado</span>}
              </li>
            ))}
          </ul>
          <div className="staff-almacen-acciones">
            <button className="staff-almacen-btn" onClick={() => abrirEditor(orden)}>Revisar y aprobar</button>
            <button className="staff-almacen-btn staff-almacen-btn--danger" onClick={() => cancelar(orden)} disabled={procesando}>Cancelar pedido</button>
          </div>
        </div>
      ))}

      {editando && (
        <div className="staff-almacen-modal" onClick={cerrar}>
          <div className="staff-almacen-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="staff-almacen-modal-titulo">Revisar orden #{editando.id}</h3>
            <p className="staff-almacen-card-cliente">
              {editando.users?.nombre} — {editando.forma_pago === 'credito' ? 'Crédito' : 'Contado'}
            </p>

            <div className="staff-almacen-editor">
              {items.map((i) => (
                <div key={i.id} className={`staff-almacen-editor-item ${i.anulado ? 'is-anulado' : ''}`}>
                  <div className="staff-almacen-editor-info">
                    <strong>{i.nombre}</strong>
                    <span>${formatUSD(i.precio_unitario)} c/u — subtotal ${formatUSD(i.anulado ? 0 : i.total_item)}</span>
                  </div>
                  <div className="staff-almacen-editor-controles">
                    <button className="staff-almacen-stepper-btn" disabled={i.anulado} onClick={() => cambiarCantidad(i.id, -1)}>−</button>
                    <span className="staff-almacen-stepper-val">{i.anulado ? '—' : i.cantidad}</span>
                    <button className="staff-almacen-stepper-btn" disabled={i.anulado} onClick={() => cambiarCantidad(i.id, 1)}>+</button>
                    <button className={`staff-almacen-btn-anular ${i.anulado ? 'is-anulado' : ''}`} onClick={() => toggleAnulado(i.id)}>
                      {i.anulado ? 'Reactivar' : 'Anular (agotado)'}
                    </button>
                  </div>
                  {i.anulado && (
                    <input
                      className="staff-almacen-nota"
                      placeholder="Nota del agotado (opcional)"
                      value={i.nota_anulacion}
                      onChange={(e) => cambiarNota(i.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="staff-almacen-total">
              Total: <strong>${formatUSD(total)}</strong>
              {huboCambios && <span className="staff-almacen-total-aviso"> — se recalculará al aprobar</span>}
            </p>

            <div className="staff-almacen-acciones">
              <button className="staff-almacen-btn" onClick={cerrar} disabled={procesando}>Volver</button>
              <button className="staff-almacen-btn staff-almacen-btn--principal" onClick={aprobar} disabled={procesando}>
                {procesando ? 'Aprobando...' : 'Aprobar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Tab 2: Por preparar — ver dirección + cantidades finales, enviar / cancelar
// ------------------------------------------------------------------
function TabPorPreparar({ ordenes, onRecargar }) {
  const [procesando, setProcesando] = useState(null)

  if (ordenes.length === 0) {
    return <p>No hay pedidos por preparar.</p>
  }

  function direccion(orden) {
    if (orden.tipo_envio === 'delivery') {
      const d = orden.direcciones_envio
      return d ? `${d.direccion || ''}, ${d.ciudad || ''} ${d.estado || ''}`.replace(/^,\s*/, '').trim() || 'Dirección no disponible' : 'Dirección no disponible'
    }
    if (orden.tipo_envio === 'envio_nacional') return `Envío nacional — ${orden.agencia_envio || 'agencia'}`
    return 'Retiro en tienda'
  }

  async function enviar(orden) {
    setProcesando(orden.id)
    try {
      await staffApi.patch(`/staff/almacen/${orden.id}/enviado`)
      await onRecargar()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo marcar como enviado')
    } finally {
      setProcesando(null)
    }
  }

  async function cancelar(orden) {
    if (!window.confirm(`¿Cancelar la orden #${orden.id} de ${orden.users?.nombre || 'cliente'}? Esta acción no se puede deshacer.`)) return
    setProcesando(orden.id)
    try {
      await staffApi.patch(`/staff/almacen/${orden.id}/cancelar`)
      await onRecargar()
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo cancelar la orden')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div>
      {ordenes.map((orden) => (
        <div key={orden.id} className="staff-almacen-card">
          <div className="staff-almacen-card-head">
            <p className="staff-almacen-card-titulo">
              Orden #{orden.id} — ${formatUSD(orden.total_usd)}
              <span className="staff-almacen-badge staff-almacen-badge--preparando">preparando</span>
            </p>
          </div>
          <p className="staff-almacen-card-cliente">
            {orden.users?.nombre} {orden.users?.telefono ? `— ${orden.users.telefono}` : ''}
          </p>
          <p className="staff-almacen-card-meta">
            <strong>Envío:</strong> {direccion(orden)}
          </p>
          <ul>
            {(orden.ordenes_items || []).map((item) => (
              <li key={item.id} className={item.anulado ? 'staff-almacen-item--anulado' : ''}>
                {item.cantidad}x {item.productos?.nombre_comercial}
                {item.anulado && <span className="staff-almacen-item-agotado"> — agotado</span>}
              </li>
            ))}
          </ul>
          <div className="staff-almacen-acciones">
            <button className="staff-almacen-btn staff-almacen-btn--principal" onClick={() => enviar(orden)} disabled={procesando === orden.id}>
              {procesando === orden.id ? 'Enviando...' : 'Marcar como enviado'}
            </button>
            <button className="staff-almacen-btn staff-almacen-btn--danger" onClick={() => cancelar(orden)} disabled={procesando === orden.id}>
              Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StaffAlmacen