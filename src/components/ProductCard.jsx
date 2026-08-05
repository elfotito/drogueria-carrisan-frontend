import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AgregarAItemsModal from './AgregarAItemsModal'

function formatUSD(valor) {
  if (valor == null) return '—'
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductCard({ producto, tasaVes }) {
  const { items: cartItems, addItem, removeItem, updateCantidad } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarContador, setMostrarContador] = useState(false)
  const timerRef = useRef(null)

  const precioVes = tasaVes && producto.precio_usd != null
    ? (producto.precio_usd * tasaVes).toFixed(2)
    : null

  // Cantidad actual en carrito
  const itemEnCarrito = cartItems.find(i => i.producto.id === producto.id)
  const cantidad = itemEnCarrito?.cantidad || 0

  // Al hacer clic en "+ Agregar", mostramos el contador por 2 segundos
  function handleAgregar(e) {
    e.stopPropagation()
    if (cantidad === 0) {
      addItem(producto, 1)
    }
    setMostrarContador(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMostrarContador(false), 2500)
  }

  function handleSumar(e) {
    e.stopPropagation()
    updateCantidad(producto.id, cantidad + 1)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMostrarContador(false), 2500)
  }

  function handleRestar(e) {
    e.stopPropagation()
    if (cantidad <= 1) {
      removeItem(producto.id)
      setMostrarContador(false)
    } else {
      updateCantidad(producto.id, cantidad - 1)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setMostrarContador(false), 2500)
    }
  }

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <>
      <div className="product-card">
        {/* Imagen + Badge de precio */}
        <div
          className="product-card__imagen-wrapper"
          onClick={() => navigate(`/producto/${producto.id}`)}
        >
          <img
            src={producto.foto_url || '/placeholder.png'}
            alt={producto.nombre_comercial}
            className="product-card__imagen"
            loading="lazy"
          />

          {/* Badge de precio sobre la imagen */}
          <div className="product-card__precio-badge">
            <span className="product-card__precio-usd">
              ${formatUSD(producto.precio_usd)}
            </span>
            {precioVes && (
              <span className="product-card__precio-ves">Bs. {precioVes}</span>
            )}
          </div>
        </div>

        {/* Info del producto */}
        <div className="product-card__info">
          <h3
            className="product-card__nombre"
            onClick={() => navigate(`/producto/${producto.id}`)}
          >
            {producto.nombre_comercial}
          </h3>
          <p className="product-card__marca">
            {producto.marcas?.nombre || producto.laboratorio || ''}
          </p>

          {/* Botón agregar / contador */}
          <div className="product-card__acciones">
            {mostrarContador || cantidad > 0 ? (
              <div className="product-card__contador">
                <button
                  className="contador-btn"
                  onClick={handleRestar}
                  aria-label="Quitar uno"
                >
                  −
                </button>
                <span className="contador-cantidad">{cantidad}</span>
                <button
                  className="contador-btn"
                  onClick={handleSumar}
                  aria-label="Agregar uno"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="product-card__btn-agregar"
                onClick={handleAgregar}
              >
                + Agregar
              </button>
            )}

            {user && (
              <button
                className="product-card__btn-items"
                onClick={(e) => { e.stopPropagation(); setMostrarModal(true) }}
                title="Agregar a Mis Items"
                aria-label="Agregar a Mis Items"
              >
                📦
              </button>
            )}
          </div>
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