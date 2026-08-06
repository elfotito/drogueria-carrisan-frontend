import './OrdenDetalleModal.css'

// Mismo mapa de estados que MisOrdenes.jsx — si agregas estados nuevos
// en el backend, agrégalos aquí también para mantener el mismo color de badge.
const ESTADOS_CONFIG = {
  pendiente: { label: 'Pendiente', clase: 'badge--pendiente' },
  finalizado: { label: 'Finalizado', clase: 'badge--finalizado' },
}

function getEstadoConfig(estado) {
  return ESTADOS_CONFIG[estado] || { label: estado, clase: 'badge--neutro' }
}

function formatUSD(valor) {
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function OrdenDetalleModal({ orden, onClose }) {
  if (!orden) return null

  const envioDetalle = useMemo(() => {
    if (!orden.tipo_envio || orden.tipo_envio === 'retiro') {
      return {
        tipo: 'Retiro en tienda',
        costo: 'Gratis',
        direccion: 'N/A',
        agencia: 'N/A',
      }
    }

    if (orden.tipo_envio === 'delivery') {
      const esGratis = orden.usuario?.delivery_gratis || orden.costo_delivery === 0
      return {
        tipo: 'Delivery',
        costo: esGratis ? '¡Gratis!' : `$${orden.costo_delivery?.toFixed(2) || '8.00'}`,
        direccion: orden.direccion_envio_texto || 'Dirección no disponible',
        agencia: 'N/A',
      }
    }

    if (orden.tipo_envio === 'envio_nacional') {
      return {
        tipo: 'Envío Nacional',
        costo: 'Pago en destino',
        direccion: orden.direccion_envio_texto || 'Dirección no disponible',
        agencia: orden.agencia_envio || 'No especificada',
      }
    }

    return {
      tipo: 'No especificado',
      costo: 'N/A',
      direccion: 'N/A',
      agencia: 'N/A',
    }
  }, [orden])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Orden #{orden.id}</h2>

        <div className="modal-section">
          <h3>📦 Información de envío</h3>
          <div className="modal-info-grid">
            <div className="modal-info-item">
              <span className="modal-label">Tipo</span>
              <span>{envioDetalle.tipo}</span>
            </div>
            <div className="modal-info-item">
              <span className="modal-label">Costo</span>
              <span>{envioDetalle.costo}</span>
            </div>
            {envioDetalle.agencia !== 'N/A' && (
              <div className="modal-info-item">
                <span className="modal-label">Agencia</span>
                <span>{envioDetalle.agencia}</span>
              </div>
            )}
            {envioDetalle.direccion !== 'N/A' && (
              <div className="modal-info-item modal-info-item--full">
                <span className="modal-label">Dirección</span>
                <span>{envioDetalle.direccion}</span>
              </div>
            )}
          </div>
        </div>

        {/* ... resto del modal (productos, totales, etc.) ... */}
      </div>
    </div>
  )
}

export default OrdenDetalleModal
