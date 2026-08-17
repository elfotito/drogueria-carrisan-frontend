import { X, DollarSign } from 'lucide-react'
import './OrdenClienteModal.css' // reutiliza overlay/content/close/divider

function formatUSD(valor) {
  return Number(valor || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatBs(valor) {
  return Number(valor || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PagoClienteModal({ pago, onClose }) {
  if (!pago) return null

  // pago viene del historial: para un pago verificado, el monto_bs y tasa_usada
  // salen del reporte_pago que lo originó (ver nota debajo del componente)
  const montoBs = pago.monto_bs ?? (pago.monto * (pago.tasa_usada || 0))

  return (
    <div className="ocm-overlay" onClick={onClose}>
      <div className="ocm-content" onClick={(e) => e.stopPropagation()}>
        <button className="ocm-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="ocm-header">
          <h2 className="ocm-numero">Pago #{pago.id}</h2>
          <p className="ocm-fecha">
            {new Date(pago.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="pcm-monto-hero">
          <DollarSign size={20} />
          <span>Bs. {formatBs(montoBs)}</span>
        </div>
        <p className="pcm-tasa">
          Tasa aplicada: <strong>Bs. {formatBs(pago.tasa_usada)}</strong> / $
        </p>

        <div className="ocm-divider" />

        <div className="ocm-total-row">
          <span>Equivalente en $</span>
          <strong>${formatUSD(pago.monto)}</strong>
        </div>

        {pago.detalle && (
          <>
            <div className="ocm-divider" />
            <div className="ocm-section">
              <h3 className="ocm-section-title">Detalle</h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>{pago.detalle}</p>
            </div>
          </>
        )}

        <p className="ocm-estado-pago-nota">✅ Pago verificado</p>
      </div>
    </div>
  )
}