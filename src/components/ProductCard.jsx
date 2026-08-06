import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AgregarAItemsModal from './AgregarAItemsModal'
import './ProductCard.css'

function formatUSD(valor) {
  if (valor == null) return '—'
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Traduce el descuento vigente (que ya viene resuelto del backend) a una etiqueta comercial.
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
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  // TODO(backend): esto debería venir de un endpoint de favoritos del usuario.
  // Por ahora es solo estado visual local, no se persiste.
  const [esFavorito, setEsFavorito] = useState(false)

  const confirmTimerRef = useRef(null)
  const hideConfirmTimerRef = useRef(null)

  const precioVes = tasaVes && producto.precio_usd != null
    ? (producto.precio_usd * tasaVes).toFixed(2)
    : null

  const tieneDescuento = producto.precio_original_usd != null && producto.descuento_activo
  const etiquetaDescuento = tieneDescuento ? obtenerEtiquetaDescuento(producto.descuento_activo) : null

  // TODO(backend): cuando exista un sistema de métricas de popularidad
  // (compras recientes, "elección principal", etc.) reemplazar por un campo real,
  // ej: producto.badge_social = "En 50+ pedidos esta semana" | "Más pedido este mes"
  const badgeSocial = producto.badge_social || null

  // TODO(backend): campo real de "patrocinado" cuando exista un sistema de pauta interno
  const esPatrocinado = producto.sponsored || false

  const itemEnCarrito = cartItems.find(i => i.producto.id === producto.id)
  const cantidad = itemEnCarrito?.cantidad || 0

  // Agregar: mete 1 unidad, muestra el contador de inmediato para que el usuario
  // pueda ajustar la cantidad, y medio segundo después confirma con una animación.
  function handleAgregar(e) {
    e.stopPropagation()
    if (cantidad === 0) addItem(producto, 1)
    setMostrarContador(true)

    clearTimeout(confirmTimerRef.current)
    clearTimeout(hideConfirmTimerRef.current)

    confirmTimerRef.current = setTimeout(() => {
      setMostrarConfirmacion(true)
      hideConfirmTimerRef.current = setTimeout(() => setMostrarConfirmacion(false), 1800)
    }, 500)
  }

  function handleSumar(e) {
    e.stopPropagation()
    updateCantidad(producto.id, cantidad + 1)
  }

  function handleRestar(e) {
    e.stopPropagation()
    if (cantidad <= 1) {
      removeItem(producto.id)
      setMostrarContador(false)
      setMostrarConfirmacion(false)
      clearTimeout(confirmTimerRef.current)
      clearTimeout(hideConfirmTimerRef.current)
    } else {
      updateCantidad(producto.id, cantidad - 1)
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(confirmTimerRef.current)
      clearTimeout(hideConfirmTimerRef.current)
    }
  }, [])

  // TODO(backend): reemplazar por rating real — producto.rating, producto.rating_count.
  // Se deja fijo en 4.5 / 0 reseñas mientras no exista el campo.
  function renderRating(rating, count) {
    return (
      <div className="pcard__rating">
        <span className="pcard__rating-estrellas">
          {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
        </span>
        <span className="pcard__rating-count">({count})</span>
      </div>
    )
  }

  return (
    <>
      <div className="pcard">
        {/* Badge social: SIEMPRE arriba del bloque de imagen, nunca encima de la foto */}
        {badgeSocial && (
          <div className="pcard__top-badge">
            <span className="pcard__badge-social">{badgeSocial}</span>
          </div>
        )}

        {/* Bloque 1: Media (imagen + badge de descuento + favorito) */}
        <div
          className="pcard__media"
          onClick={() => navigate(`/producto/${producto.id}`)}
        >
          {etiquetaDescuento && (
            <span className="pcard__badge-descuento">{etiquetaDescuento}</span>
          )}

          <button
            type="button"
            className={`pcard__fav ${esFavorito ? 'pcard__fav--activo' : ''}`}
            onClick={(e) => { e.stopPropagation(); setEsFavorito(v => !v) }}
            aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {esFavorito ? '♥' : '♡'}
          </button>

          <img
            src={producto.foto_url || '/placeholder.png'}
            alt={producto.nombre_comercial}
            className="pcard__image"
            loading="lazy"
          />
        </div>

        {/* Bloque 2: Contenido (patrocinado, precios, info, acciones) */}
        <div className="pcard__body">
          {esPatrocinado && (
            <p className="pcard__sponsored">
              Patrocinado <span className="pcard__sponsored-info" title="Producto patrocinado">ⓘ</span>
            </p>
          )}

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

          {renderRating(4.5, 0)}

          {/* TODO(negocio): definir si esto es un programa de descuento por volumen/suscripción real.
              Por ahora es un placeholder visual para mantener la jerarquía del diseño. */}
          <p className="pcard__save-with">Ahorra con <strong>Plan Carrisán+</strong></p>

          {/* TODO(backend): reemplazar por disponibilidad/tiempos de entrega reales (producto.disponible, ETA por zona) */}
          <div className="pcard__delivery-info">
            <p className="pcard__delivery-arrive">Llega mañana</p>
            <p className="pcard__delivery-pickup">Retira pronto</p>
          </div>

          <div className="pcard__acciones">
            {user && (
              <button
                className="pcard__btn-items"
                onClick={(e) => { e.stopPropagation(); setMostrarModal(true) }}
                title="Agregar a Mis Items"
                aria-label="Agregar a Mis Items"
              >
                📦
              </button>
            )}

            {(mostrarContador || cantidad > 0) ? (
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

          {mostrarConfirmacion && (
            <div className="pcard__confirmacion" role="status">
              ✓ Agregado al carrito
            </div>
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