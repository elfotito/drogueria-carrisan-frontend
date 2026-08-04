import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AgregarAItemsModal from './AgregarAItemsModal'

function ProductCard({ producto, tasaVes }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mostrarModal, setMostrarModal] = useState(false)

  const precioVes =
    tasaVes && producto.precio_usd != null
      ? (producto.precio_usd * tasaVes).toFixed(2)
      : null

  return (
    <>
      <div className="product-card">
        <img
          src={producto.foto_url || '/placeholder.png'}
          alt={producto.nombre_comercial}
          onClick={() => navigate(`/producto/${producto.id}`)}
          style={{ cursor: 'pointer' }}
        />
        <h3
          onClick={() => navigate(`/producto/${producto.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {producto.nombre_comercial}
        </h3>
        <p className="marca">{producto.marcas?.nombre}</p>
        <p className="descripcion">{producto.descripcion}</p>
        <p className="precio">
          {producto.precio_usd != null ? `$${producto.precio_usd.toFixed(2)}` : 'Consultar precio'}
          {precioVes && <span> — Bs. {precioVes}</span>}
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); addItem(producto); }}>
            Agregar al carrito
          </button>
          {user && (
            <button
              onClick={(e) => { e.stopPropagation(); setMostrarModal(true); }}
              title="Agregar a Mis Items"
            >
              📦
            </button>
          )}
        </div>
      </div>

      {mostrarModal && (
        <AgregarAItemsModal
          producto={producto}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </>
  )
}

export default ProductCard