import { useCart } from '../context/CartContext'

function ProductCard({ producto, tasaVes }) {
  const { addItem } = useCart()
  const precioVes = tasaVes ? (producto.precio_usd * tasaVes).toFixed(2) : null

  return (
    <div className="product-card">
      <img
        src={producto.foto_url || '/placeholder.png'}
        alt={producto.nombre}
      />
      <h3>{producto.nombre}</h3>
      <p className="marca">{producto.marcas?.nombre}</p>
      <p className="descripcion">{producto.descripcion}</p>
      <p className="precio">
        ${producto.precio_usd.toFixed(2)}
        {precioVes && <span> — Bs. {precioVes}</span>}
      </p>
      <button onClick={() => addItem(producto)}>Agregar al carrito</button>
    </div>
  )
}

export default ProductCard