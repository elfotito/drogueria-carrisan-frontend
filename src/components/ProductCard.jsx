import { useCart } from '../context/CartContext'

function ProductCard({ producto, tasaVes }) {
  const { addItem } = useCart()
  const precioVes =
    tasaVes && producto.precio_usd != null
      ? (producto.precio_usd * tasaVes).toFixed(2)
      : null

  return (
    <div className="product-card">
      <img
        src={producto.foto_url || '/placeholder.png'}
        alt={producto.nombre_comercial}
      />
      <h3>{producto.nombre_comercial}</h3>
      <p className="marca">{producto.marcas?.nombre}</p>
      <p className="descripcion">{producto.descripcion}</p>
      <p className="precio">
        {producto.precio_usd != null ? `$${producto.precio_usd.toFixed(2)}` : 'Consultar precio'}
        {precioVes && <span> — Bs. {precioVes}</span>}
      </p>
      <button onClick={() => addItem(producto)}>Agregar al carrito</button>
    </div>
  )
}

export default ProductCard