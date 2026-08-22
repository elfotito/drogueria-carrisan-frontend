import { useMemo, useState, useEffect } from 'react'
import './OrdenDetalleModal.css'

// Estados en los que ya no tiene sentido editar productos — la orden
// está cerrada (entregada) o muerta (cancelada).
const ESTADOS_NO_EDITABLES = ['entregado', 'cancelado']

// Mismos 4 estados operativos definidos en MisOrdenes.jsx — pagado/cancelado
// no viven acá, se gestionan en Estado de Cuenta.
const ESTADOS_CONFIG = {
  pedido_creado: { label: 'Pedido Creado', color: '#f59e0b', bg: '#fef3c7' },
  procesando: { label: 'Procesando', color: '#3b82f6', bg: '#dbeafe' },
  preparando: { label: 'Preparando', color: '#8b5cf6', bg: '#ede9fe' },
  enviado: { label: 'Enviado', color: '#06b6d4', bg: '#cffafe' },
  entregado: { label: 'Entregado', color: '#10b981', bg: '#d1fae5' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2' }
}

const ESTADOS_LEGACY = {
  pendiente: 'pedido_creado',
  confirmado: 'procesando',
  en_preparacion: 'preparando',
  finalizado: 'entregado'
}

function getEstadoConfig(estado) {
  const normalizado = ESTADOS_LEGACY[estado] || estado
  return ESTADOS_CONFIG[normalizado] || { label: estado || 'Desconocido', color: '#64748b', bg: '#f1f5f9' }
}

function formatUSD(valor) {
  return Number(valor || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function OrdenDetalleModal({ orden, onClose, onCambiarEstado, estados, estadoColores, onGuardarItems }) {
  // Estado local de edición: mapa item.id -> cantidad. Solo se activa
  // cuando el admin toca "Editar productos" — así la vista de lectura
  // (cliente, u otras aperturas del modal) queda intacta por defecto.
  const [editandoItems, setEditandoItems] = useState(false)
  const [cantidadesEditadas, setCantidadesEditadas] = useState({})
  const [guardandoItems, setGuardandoItems] = useState(false)

  const itemsOrden = orden?.items || orden?.ordenes_items || orden?.productos || []

  useEffect(() => {
    // Al cambiar de orden (o al cancelar edición) resetea el borrador.
    setEditandoItems(false)
    setCantidadesEditadas({})
  }, [orden?.id])

  function iniciarEdicion() {
    const inicial = {}
    itemsOrden.forEach((item) => { inicial[item.id] = item.cantidad ?? 1 })
    setCantidadesEditadas(inicial)
    setEditandoItems(true)
  }

  function cancelarEdicion() {
    setEditandoItems(false)
    setCantidadesEditadas({})
  }

  function cambiarCantidad(itemId, delta) {
    setCantidadesEditadas((prev) => {
      const actual = prev[itemId] ?? 0
      const nueva = Math.max(0, actual + delta)
      return { ...prev, [itemId]: nueva }
    })
  }

  function eliminarItem(itemId) {
    setCantidadesEditadas((prev) => ({ ...prev, [itemId]: 0 }))
  }

  const hayCambios = useMemo(() => {
    return itemsOrden.some((item) => (cantidadesEditadas[item.id] ?? item.cantidad) !== item.cantidad)
  }, [itemsOrden, cantidadesEditadas])

  const totalEditado = useMemo(() => {
    return itemsOrden.reduce((sum, item) => {
      const cantidad = cantidadesEditadas[item.id] ?? item.cantidad
      const precio = item.precio || item.precio_unitario || 0
      return sum + cantidad * precio
    }, 0)
  }, [itemsOrden, cantidadesEditadas])

  async function guardarCambiosItems() {
    if (!onGuardarItems) return
    const payload = itemsOrden
      .filter((item) => (cantidadesEditadas[item.id] ?? item.cantidad) !== item.cantidad)
      .map((item) => ({ id: item.id, cantidad: cantidadesEditadas[item.id] ?? item.cantidad }))

    if (payload.length === 0) return

    try {
      setGuardandoItems(true)
      await onGuardarItems(orden.id, payload)
      setEditandoItems(false)
      setCantidadesEditadas({})
    } catch (err) {
      // El padre ya muestra el error (alert/toast) — acá solo evitamos
      // que la UI quede colgada en "guardando".
      console.error('Error al guardar ajuste de items:', err)
    } finally {
      setGuardandoItems(false)
    }
  }

  const envioDetalle = useMemo(() => {
    if (!orden) return null

    if (!orden.tipo_envio || orden.tipo_envio === 'retiro') {
      return {
        icono: '🏪',
        tipo: 'Retiro en Tienda',
        costo: 'Gratis',
        direccion: null,
        agencia: null,
        color: '#1A1A3A'
      }
    }

    if (orden.tipo_envio === 'delivery') {
      const esGratis = orden.usuario?.delivery_gratis || orden.costo_delivery === 0
      return {
        icono: '🛵',
        tipo: 'Delivery',
        costo: esGratis ? '¡Gratis!' : `$${formatUSD(orden.costo_delivery || 8)}`,
        direccion: orden.direccion_envio_texto || null,
        agencia: null,
        color: '#D97706'
      }
    }

    if (orden.tipo_envio === 'envio_nacional') {
      return {
        icono: '🚚',
        tipo: 'Envío Nacional',
        costo: 'Pago en destino',
        direccion: orden.direccion_envio_texto || null,
        agencia: orden.agencia_envio || null,
        color: '#0052DC'
      }
    }

    return {
      icono: '📦',
      tipo: 'No especificado',
      costo: 'N/A',
      direccion: null,
      agencia: null,
      color: '#6C6E8A'
    }
  }, [orden])

  if (!orden) return null

  const estadoConfig = getEstadoConfig(orden.estado)
  const items = itemsOrden

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm-content" onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button className="odm-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="odm-header">
          <div>
            <h2 className="odm-numero">Orden #{orden.id}</h2>
            <p className="odm-fecha">
              {new Date(orden.created_at).toLocaleDateString('es-VE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
              {' · '}
              {new Date(orden.created_at).toLocaleTimeString('es-VE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {/* Antes: className={`odm-badge ${estadoConfig.clase}`} — estadoConfig.clase
              nunca existió, así que el badge siempre caía en el estilo por defecto.
              Ahora el color/fondo se aplica directo desde ESTADOS_CONFIG. */}
          <span
            className="odm-badge"
            style={{ color: estadoConfig.color, background: estadoConfig.bg }}
          >
            {estadoConfig.label}
          </span>
        </div>

        {/* Cliente */}
        <div className="odm-cliente">
          <div className="odm-cliente-avatar">
            {orden.users?.nombre?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="odm-cliente-info">
            <strong>{orden.users?.nombre || 'Cliente'}</strong>
            <span>{orden.users?.email || 'Sin email'}</span>
            {orden.users?.telefono && (
              <span>📱 {orden.users.telefono}</span>
            )}
          </div>
        </div>

        <div className="odm-divider" />

        {/* Envío */}
        {envioDetalle && (
          <div className="odm-section">
            <h3 className="odm-section-title">
              <span className="odm-section-icon">{envioDetalle.icono}</span>
              Información de Envío
            </h3>
            <div className="odm-envio-card" style={{ borderLeftColor: envioDetalle.color }}>
              <div className="odm-envio-row">
                <span className="odm-envio-label">Tipo</span>
                <span className="odm-envio-valor">{envioDetalle.tipo}</span>
              </div>
              <div className="odm-envio-row">
                <span className="odm-envio-label">Costo</span>
                <span className={`odm-envio-valor ${envioDetalle.costo === '¡Gratis!' ? 'odm-gratis' : ''}`}>
                  {envioDetalle.costo}
                </span>
              </div>
              {envioDetalle.agencia && (
                <div className="odm-envio-row">
                  <span className="odm-envio-label">Agencia</span>
                  <span className="odm-envio-valor">{envioDetalle.agencia}</span>
                </div>
              )}
              {envioDetalle.direccion && (
                <div className="odm-envio-direccion">
                  <span className="odm-envio-label">Dirección</span>
                  <span className="odm-envio-valor">{envioDetalle.direccion}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="odm-divider" />

        {/* Productos */}
        <div className="odm-section">
          <div className="odm-section-header-flex">
            <h3 className="odm-section-title">
              <span className="odm-section-icon">🛒</span>
              Productos ({items.length})
            </h3>
            {onGuardarItems && !editandoItems && !ESTADOS_NO_EDITABLES.includes(orden.estado) && (
              <button className="odm-editar-btn" onClick={iniciarEdicion}>
                Editar productos
              </button>
            )}
          </div>
          <div className="odm-items">
            {items.map((item, index) => {
              const cantidadMostrada = editandoItems
                ? (cantidadesEditadas[item.id] ?? item.cantidad ?? 1)
                : (item.cantidad || 1)
              const eliminado = editandoItems && cantidadMostrada === 0
              const precioUnit = item.precio || item.precio_unitario || 0

              return (
                <div key={item.id || index} className={`odm-item ${eliminado ? 'odm-item--eliminado' : ''}`}>
                  <div className="odm-item-media">
                    {item.foto_url || item.producto?.foto_url ? (
                      <img
                        src={item.foto_url || item.producto?.foto_url}
                        alt={item.nombre || item.producto?.nombre_comercial}
                      />
                    ) : (
                      <span className="odm-item-placeholder">📦</span>
                    )}
                  </div>
                  <div className="odm-item-body">
                    <p className="odm-item-nombre">
                      {item.nombre || item.producto?.nombre_comercial || 'Producto'}
                    </p>
                    {!editandoItems ? (
                      <p className="odm-item-cantidad">
                        {cantidadMostrada} × ${formatUSD(precioUnit)}
                      </p>
                    ) : (
                      <div className="odm-item-stepper">
                        <button
                          type="button"
                          className="odm-stepper-btn"
                          onClick={() => cambiarCantidad(item.id, -1)}
                          disabled={cantidadMostrada === 0}
                        >
                          −
                        </button>
                        <span className="odm-stepper-valor">{cantidadMostrada}</span>
                        <button
                          type="button"
                          className="odm-stepper-btn"
                          onClick={() => cambiarCantidad(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="odm-item-eliminar"
                          onClick={() => eliminarItem(item.id)}
                          title="Quitar producto"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="odm-item-subtotal">
                    {eliminado ? 'Eliminado' : `$${formatUSD(cantidadMostrada * precioUnit)}`}
                  </p>
                </div>
              )
            })}
          </div>

          {editandoItems && (
            <div className="odm-editar-acciones">
              <span className="odm-editar-nuevo-total">
                Nuevo total: <strong>${formatUSD(totalEditado)}</strong>
              </span>
              <div className="odm-editar-botones">
                <button className="odm-btn-cancelar" onClick={cancelarEdicion} disabled={guardandoItems}>
                  Cancelar
                </button>
                <button
                  className="odm-btn-guardar"
                  onClick={guardarCambiosItems}
                  disabled={!hayCambios || guardandoItems}
                >
                  {guardandoItems ? 'Guardando…' : 'Guardar ajustes'}
                </button>
              </div>
              <p className="odm-editar-ayuda">
                El cliente recibirá una notificación con el detalle del ajuste y el nuevo total.
              </p>
            </div>
          )}
        </div>

        <div className="odm-divider" />

        {/* Totales */}
        <div className="odm-totales">
          <div className="odm-total-row">
            <span>Subtotal</span>
            <span>${formatUSD(orden.total_usd)}</span>
          </div>
          {orden.costo_delivery > 0 && (
            <div className="odm-total-row">
              <span>Envío</span>
              <span>${formatUSD(orden.costo_delivery)}</span>
            </div>
          )}
          <div className="odm-total-final">
            <span>Total</span>
            <span className="odm-total-valor">${formatUSD(orden.total_usd)}</span>
          </div>
        </div>

        {/* Cambiar estado — lo usará OrdenAdmin pasando onCambiarEstado + estados */}
        {onCambiarEstado && estados && (
          <>
            <div className="odm-divider" />
            <div className="odm-section">
              <h3 className="odm-section-title">
                <span className="odm-section-icon">🔄</span>
                Actualizar Estado
              </h3>
              <select
                value={orden.estado}
                onChange={(e) => onCambiarEstado(orden.id, e.target.value)}
                className="odm-estado-select"
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>
                    {estadoColores?.[estado]?.label || getEstadoConfig(estado).label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Notas adicionales */}
        {orden.notas && (
          <>
            <div className="odm-divider" />
            <div className="odm-section">
              <h3 className="odm-section-title">
                <span className="odm-section-icon">📝</span>
                Notas
              </h3>
              <p className="odm-notas">{orden.notas}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrdenDetalleModal
