import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AgregarAItemsModal from './AgregarAItemsModal'

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

  // 👇 Lógica de descuento unificada
  const tieneDescuento = producto.precio_original_usd != null && producto.descuento_activo
  const etiquetaDescuento = tieneDescuento ? obtenerEtiquetaDescuento(producto.descuento_activo) : null

  // Cantidad actual en carrito
  const itemEnCarrito = cartItems.find(i => i.producto.id === producto.id)
  const cantidad = itemEnCarrito?.cantidad || 0

  // 👇 Tu lógica de control de cantidad, conservada
  function handleAgregar(e) {
    e.stopPropagation()
    if (cantidad === 0) { addItem(producto, 1) }
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

  useEffect(() => { return () => clearTimeout(timerRef.current) }, [])

  // Placeholders para Rating y Entrega
  const renderRating = (rating) => {
    return <div className="pcard__rating">{"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))} <span className='pcard__rating-count'>({rating})</span></div>;
  }

  return (
    <>
      <div className="pcard">
        {/* Bloque 1: Media (Imagen + Badge) */}
        <div
          className="pcard__media"
          onClick={() => navigate(`/producto/${producto.id}`)}
        >
          {/* 👇 Badge de descuento unificado */}
          {etiquetaDescuento && (
            <span className="pcard__badge-descuento">
              {etiquetaDescuento}
            </span>
          )}

          <img
            src={producto.foto_url || '/placeholder.png'}
            alt={producto.nombre_comercial}
            className="pcard__image"
            loading="lazy"
          />
        </div>

        {/* Bloque 2: Contenido (Precios, Info, Acciones) */}
        <div className="pcard__body">
          
          {/* Bloque de precios unificado (Actual USD, Original USD, VES) */}
          <div className="pcard__precios">
            <span className={`pcard__precio-ahora ${tieneDescuento ? '' : 'pcard__precio-ahora--sin-descuento'}`}>
                 Ahora ${formatUSD(producto.precio_usd)}
            </span>
            {tieneDescuento && (
                <span className="pcard__precio-original">
                    ${formatUSD(producto.precio_original_usd)}
                </span>
            )}
            {precioVes && (
              <span className="pcard__precio-ves">
                  ≈ Bs. {precioVes}
              </span>
            )}
          </div>

          <h3
            className="pcard__nombre"
            onClick={() => navigate(`/producto/${producto.id}`)}
          >
            {producto.nombre_comercial}
          </h3>
          <p className="pcard__marca">
            {producto.marcas?.nombre || producto.laboratorio || ''}
          </p>

          {/* Placeholders for Ratings and Delivery */}
          {renderRating(4.5)} {/* Ejemplo rating */}
          <div className="pcard__delivery-info">
              <p className="delivery-arrive">Llega mañana</p>
              <p className="delivery-pickup">Retira pronto</p>
          </div>

          {/* Bloque de Acciones: Agrupación responsive */}
          <div className="pcard__acciones">
              { (user && (
                    <button
                        className="pcard__btn-items"
                        onClick={(e) => { e.stopPropagation(); setMostrarModal(true) }}
                        title="Agregar a Mis Items"
                        aria-label="Agregar a Mis Items"
                    >
                        📦
                    </button>
              ))}

              {/* Botón agregar / contador, responsive flow */}
              { (mostrarContador || cantidad > 0) ? (
                <div className="pcard__contador">
                    <button className="contador-btn" onClick={handleRestar} aria-label="Quitar uno">−</button>
                    <span className="contador-cantidad">{cantidad}</span>
                    <button className="contador-btn" onClick={handleSumar} aria-label="Agregar uno">+</button>
                </div>
              ) : (
                <button className="pcard__btn-agregar" onClick={handleAgregar}>
                    + Agregar al carrito
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
