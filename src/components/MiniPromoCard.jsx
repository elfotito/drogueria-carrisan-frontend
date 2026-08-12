import { useNavigate } from 'react-router-dom'
import './MiniPromoCard.css'

function formatUSD(valor) {
  if (valor == null) return '—'
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function obtenerEtiquetaDescuento(descuento) {
  if (!descuento) return null
  if (descuento.tipo === 'monto') return 'Oferta'
  const valor = Number(descuento.valor)
  if (valor >= 30) return 'Super Oferta'
  if (valor >= 20) return 'Promoción'
  if (valor >= 15) return 'Flash'
  return 'Descuento'
}

// Card mínima para los mini-grids de categoría (estilo "Rollbacks & more"
// de Walmart): etiqueta, foto, precio (USD + Bs. abajo) y nombre en una
// sola línea con ellipsis. Aún más compacta que PromoCard — pensada para
// verse 2x2 dentro de una sección angosta.
function MiniPromoCard({ producto, tasaVes }) {
  const navigate = useNavigate()

  const precioVes = tasaVes && producto.precio_usd != null
    ? (producto.precio_usd * tasaVes).toFixed(2)
    : null

  const tieneDescuento = producto.precio_original_usd != null && producto.descuento_activo
  const etiqueta = tieneDescuento ? obtenerEtiquetaDescuento(producto.descuento_activo) : null

  return (
    <button
      type="button"
      className="minipromocard"
      onClick={() => navigate(`/producto/${producto.id}`)}
    >
      {etiqueta && <span className="minipromocard__badge">{etiqueta}</span>}

      <div className="minipromocard__media">
        <img
          src={producto.foto_url || '/placeholder.png'}
          alt={producto.nombre_comercial}
          className="minipromocard__image"
          loading="lazy"
        />
      </div>

      <div className="minipromocard__precios">
        {tieneDescuento ? (
          <span className="minipromocard__precio-ahora">${formatUSD(producto.precio_usd)}</span>
        ) : (
          <span className="minipromocard__precio-normal">${formatUSD(producto.precio_usd)}</span>
        )}
        {precioVes && <span className="minipromocard__precio-ves">Bs. {precioVes}</span>}
      </div>

      <span className="minipromocard__nombre">{producto.nombre_comercial}</span>
    </button>
  )
}

export default MiniPromoCard