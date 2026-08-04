import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

function formatUSD(valor) {
  return valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVES(valor) {
  return valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductCard({ producto, tasaVes }) {
  const { addItem } = useCart()
  const {
    id,
    nombre_comercial,
    laboratorio,
    precio_usd,
    imagen,
    disponible,
  } = producto

  function handleAgregar(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem(producto, 1)
  }

  return (
    <Link to={`/producto/${id}`} className="pcard">
      <div className="pcard__media">
        {imagen ? (
          <img src={imagen} alt={nombre_comercial} loading="lazy" />
        ) : (
          <div className="pcard__media-placeholder">Sin imagen</div>
        )}

        {!disponible && (
          <span className="pcard__badge-agotado">Agotado</span>
        )}
      </div>

      <button
        type="button"
        className={`pcard__cta ${!disponible ? 'pcard__cta--disabled' : ''}`}
        onClick={handleAgregar}
        disabled={!disponible}
      >
        {disponible ? '+ Agregar' : 'No disponible'}
      </button>

      <div className="pcard__body">
        <div className="pcard__precio-row">
          <span className="pcard__precio-usd">${formatUSD(precio_usd)}</span>
        </div>

        {tasaVes && (
          <p className="pcard__precio-ves">Bs. {formatVES(precio_usd * tasaVes)}</p>
        )}

        <h3 className="pcard__nombre">{nombre_comercial}</h3>

        {laboratorio && (
          <p className="pcard__laboratorio">{laboratorio}</p>
        )}

        <p className={`pcard__disponibilidad ${disponible ? 'pcard__disponibilidad--ok' : 'pcard__disponibilidad--no'}`}>
          {disponible ? 'En stock' : 'Agotado'}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
