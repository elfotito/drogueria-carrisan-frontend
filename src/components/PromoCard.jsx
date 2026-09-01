import { useNavigate } from 'react-router-dom'
import './PromoCard.css'

function PrecioSuperIndice({ valor }) {
  if (valor == null) return <span>—</span>
  const partes = Number(valor).toFixed(2).split('.')
  return (
    <>
      <span className="promocard__precio-simbolo">$</span>
      <span className="promocard__precio-entero">{partes[0]}</span>
      <sup className="promocard__precio-centavos">{partes[1]}</sup>
    </>
  )
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
              <PrecioSuperIndice valor={producto.precio_usd} />
            </span>
            <span className="promocard__precio-original">
              <PrecioSuperIndice valor={producto.precio_original_usd} />
            </span>
          </>
        ) : (
          <span className="promocard__precio-normal">
            <PrecioSuperIndice valor={producto.precio_usd} />
          </span>
        )}
      </div>

      {precioVes && <span className="promocard__precio-ves">≈ Bs. {precioVes}</span>}

      <h4 className="promocard__nombre">{producto.nombre_comercial}</h4>
    </button>
  )
}

export default PromoCard