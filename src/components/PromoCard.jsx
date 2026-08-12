import { useNavigate } from 'react-router-dom'
import './PromoCard.css'

function formatUSD(valor) {
  if (valor == null) return '—'
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function obtenerEtiquetaDescuento(descuento) {
  if (!descuento) return null
  if (descuento.tipo === 'monto') return 'Oferta Especial'
  const valor = Number(descuento.valor)
  if (valor >= 30) return 'Super Oferta'
  if (valor >= 20) return 'Descuento Promocional'
  if (valor >= 15) return 'Descuento Flash'
  return 'Descuento'
}

// Card compacta para carruseles estilo Walmart/Amazon: imagen grande,
// badge de oferta (si aplica), precio (USD + Bs. abajo) y nombre.
// Sin botón de agregar/favorito a propósito — es solo vitrina, para eso
// está ProductCard en el catálogo.
function PromoCard({ producto, tasaVes }) {
  const navigate = useNavigate()

  const precioVes = tasaVes && producto.precio_usd != null
    ? (producto.precio_usd * tasaVes).toFixed(2)
    : null

  const tieneDescuento = producto.precio_original_usd != null && producto.descuento_activo
  const etiquetaDescuento = tieneDescuento ? obtenerEtiquetaDescuento(producto.descuento_activo) : null

  return (
    <button
      type="button"
      className="promocard"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      <div className="promocard__media">
        {etiquetaDescuento && (
          <span className="promocard__badge">{etiquetaDescuento}</span>
        )}
        <img
          src={producto.foto_url || '/placeholder.png'}
          alt={producto.nombre_comercial}
          className="promocard__image"
          loading="lazy"
        />
      </div>

      <div className="promocard__precios">
        {tieneDescuento ? (
          <>
            <span className="promocard__precio-ahora">
              <span className="promocard__precio-simbolo">$</span>{formatUSD(producto.precio_usd)}
            </span>
            <span className="promocard__precio-original">${formatUSD(producto.precio_original_usd)}</span>
          </>
        ) : (
          <span className="promocard__precio-normal">
            <span className="promocard__precio-simbolo">$</span>{formatUSD(producto.precio_usd)}
          </span>
        )}
      </div>

      {precioVes && <span className="promocard__precio-ves">≈ Bs. {precioVes}</span>}

      <h4 className="promocard__nombre">{producto.nombre_comercial}</h4>
    </button>
  )
}

export default PromoCard