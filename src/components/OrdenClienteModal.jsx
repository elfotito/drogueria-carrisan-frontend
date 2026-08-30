import { X, Package } from 'lucide-react'
import './OrdenClienteModal.css'

const PASOS = ['pedido_creado', 'procesando', 'preparando', 'enviado', 'entregado']

const LABELS = {
  pedido_creado: 'Pedido creado',
  procesando: 'Procesando',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const LEGACY = {
  pendiente: 'pedido_creado',
  confirmado: 'procesando',
  en_preparacion: 'preparando',
  finalizado: 'entregado',
}

function formatUSD(valor) {
  return Number(valor || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function OrdenClienteModal({ orden, onClose }) {
  if (!orden) return null

  const estadoNormalizado = LEGACY[orden.estado] || orden.estado
  const esCancelada = estadoNormalizado === 'cancelado'
  const pasoActual = PASOS.indexOf(estadoNormalizado)
  const items = orden.items || orden.ordenes_items || orden.productos || []

  return (
    <div className="ocm-overlay" onClick={onClose}>
      <div className="ocm-content" onClick={(e) => e.stopPropagation()}>
        <button className="ocm-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="ocm-header">
          <h2 className="ocm-numero">Orden #{orden.id}</h2>
          <p className="ocm-fecha">
            {new Date(orden.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Progreso con puntos */}
        {esCancelada ? (
          <div className="ocm-estado-cancelado">
            <span className="ocm-badge ocm-badge--cancelado">Cancelada</span>
          </div>
        ) : (
          <div className="ocm-progreso">
            <div className="ocm-progreso-dots">
              {PASOS.map((paso, i) => (
                <div key={paso} className={`ocm-dot ${i <= pasoActual ? 'ocm-dot--activo' : ''} ${i === pasoActual ? 'ocm-dot--actual' : ''}`} />
              ))}
            </div>
            <p className="ocm-progreso-label">
              {LABELS[estadoNormalizado] || orden.estado}
              <span className="ocm-progreso-contador"> · Paso {pasoActual + 1} de {PASOS.length}</span>
            </p>
          </div>
        )}

        <div className="ocm-divider" />

        {/* Resumen de productos, compacto */}
        <div className="ocm-section">
          <h3 className="ocm-section-title"><Package size={16} /> Productos ({items.length})</h3>
          <div className="ocm-items">
            {items.map((item, i) => (
              <div key={item.id || i} className="ocm-item">
                <span className="ocm-item-nombre">
                  {item.nombre || item.producto?.nombre_comercial || item.productos?.nombre_comercial || 'Producto'}
                </span>
                <span className="ocm-item-cant">×{item.cantidad || 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ocm-divider" />

        <div className="ocm-total-row">
          <span>Total</span>
          <strong>${formatUSD(orden.total_usd)}</strong>
        </div>

        <p className="ocm-estado-pago-nota">
          {orden.estado_pago === 'verificado'
            ? '✅ Esta orden ya fue pagada'
            : orden.estado_pago === 'reportado'
              ? '⏳ Pago reportado, en revisión'
              : '💳 Pendiente de pago'}
        </p>
      </div>
    </div>
  )
}