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

  const estadoConfig = getEstadoConfig(orden.estado)
  const fecha = new Date(orden.created_at).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm-content" onClick={(e) => e.stopPropagation()}>
        <button className="odm-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="odm-header">
          <p className="odm-numero">Orden #{orden.id}</p>
          <span className={`odm-badge ${estadoConfig.clase}`}>{estadoConfig.label}</span>
        </div>

        <p className="odm-fecha">{fecha}</p>

        {orden.users && (
          <p className="odm-cliente">
            Cliente: <strong>{orden.users.nombre}</strong> ({orden.users.email})
          </p>
        )}

        <div className="odm-divider" />

        <div className="odm-items">
          {orden.ordenes_items.map((item) => (
            <div key={item.id} className="odm-item">
              <div className="odm-item__media">
                {item.productos?.foto_url ? (
                  <img src={item.productos.foto_url} alt={item.productos.nombre_comercial} />
                ) : (
                  <div className="odm-item__media-placeholder">Sin imagen</div>
                )}
              </div>

              <div className="odm-item__body">
                <p className="odm-item__nombre">{item.productos?.nombre_comercial}</p>
                <p className="odm-item__cantidad">
                  {item.cantidad} × ${formatUSD(item.precio_unitario)}
                </p>
              </div>

              <p className="odm-item__subtotal">
                ${formatUSD(item.precio_unitario * item.cantidad)}
              </p>
            </div>
          ))}
        </div>

        <div className="odm-divider" />

        <div className="odm-total">
          <span>Total</span>
          <span className="odm-total__valor">${formatUSD(orden.total_usd)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrdenDetalleModal
