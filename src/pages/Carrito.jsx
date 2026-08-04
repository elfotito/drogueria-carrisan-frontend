import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import './Carrito.css'

const METODOS_ENTREGA = [
  {
    id: 'envio',
    label: 'Envío',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13.5 9.5H17.2L21 12.6V15.5C21 15.8 20.8 16 20.5 16H13.5V9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="6" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'retiro',
    label: 'Retiro',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 11L6.5 5.5C6.8 4.8 7.5 4.3 8.3 4.3H15.7C16.5 4.3 17.2 4.8 17.5 5.5L20 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2.5" y="11" width="19" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="6.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'entrega',
    label: 'Entrega',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8L12 3L20 8V19C20 19.6 19.6 20 19 20H5C4.4 20 4 19.6 4 19V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 20V13H15V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function formatUSD(valor) {
  return valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVES(valor) {
  return valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CartLine({ item, tasaVes, onUpdateCantidad, onRemove }) {
  const { producto, cantidad } = item
  const subtotalUsd = producto.precio_usd * cantidad

  return (
    <div className="cart-line">
      <div className="cart-line__media">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre_comercial} />
        ) : (
          <div className="cart-line__media-placeholder">Sin imagen</div>
        )}
      </div>

      <div className="cart-line__body">
        <p className="cart-line__vendedor">Vendido por <strong>Droguería Carrisán</strong></p>

        <h3 className="cart-line__nombre">{producto.nombre_comercial}</h3>

        {producto.laboratorio && (
          <p className="cart-line__meta">{producto.laboratorio}</p>
        )}

        <div className="cart-line__precio-row">
          <span className="cart-line__precio-usd">${formatUSD(producto.precio_usd)}</span>
          {tasaVes && (
            <span className="cart-line__precio-ves">Bs. {formatVES(producto.precio_usd * tasaVes)}</span>
          )}
        </div>

        <div className="cart-line__actions">
          <button type="button" className="cart-line__link cart-line__link--danger" onClick={() => onRemove(producto.id)}>
            Eliminar
          </button>

          <div className="cart-line__stepper">
            <button
              type="button"
              className="cart-line__stepper-btn"
              onClick={() => onUpdateCantidad(producto.id, cantidad - 1)}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="cart-line__stepper-value">{cantidad}</span>
            <button
              type="button"
              className="cart-line__stepper-btn"
              onClick={() => onUpdateCantidad(producto.id, cantidad + 1)}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <p className="cart-line__subtotal">Subtotal: <strong>${formatUSD(subtotalUsd)}</strong></p>
      </div>
    </div>
  )
}

function Carrito() {
  const { items, updateCantidad, removeItem, clearCart, total } = useCart()
  const [tasaVes, setTasaVes] = useState(null)
  const [metodoEntrega, setMetodoEntrega] = useState('envio')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasaVes(res.data.usd_a_ves))
      .catch(() => setTasaVes(null))
  }, [])

  async function handleConfirmar() {
    setError('')
    setEnviando(true)

    try {
      const payload = {
        items: items.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
        metodo_entrega: metodoEntrega,
      }
      await api.post('/orders', payload)
      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al confirmar la orden')
    } finally {
      setEnviando(false)
    }
  }

  const cantidadArticulos = items.reduce((acc, item) => acc + item.cantidad, 0)
  const envioGratis = true
  const totalVes = tasaVes ? total * tasaVes : null

  if (items.length === 0) {
    return (
      <div className="carrito-page carrito-page--vacio">
        <div className="carrito-vacio">
          <div className="carrito-vacio__icon">🛒</div>
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos del catálogo para verlos aquí.</p>
          <Link to="/catalogo" className="carrito-vacio__cta">Ir al catálogo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="carrito-page">
      <div className="carrito-container">
        <h1 className="carrito-title">Carrito</h1>

        {error && <p className="carrito-error">{error}</p>}

        {/* Opciones de retiro y entrega */}
        <section className="delivery-card">
          <div className="delivery-card__header">
            <span className="delivery-card__header-icon" aria-hidden="true">📦</span>
            <h2>Opciones de retiro y entrega</h2>
          </div>

          <div className="delivery-tabs">
            {METODOS_ENTREGA.map((metodo) => (
              <button
                key={metodo.id}
                type="button"
                className={`delivery-tab ${metodoEntrega === metodo.id ? 'delivery-tab--active' : ''}`}
                onClick={() => setMetodoEntrega(metodo.id)}
              >
                <span className="delivery-tab__icon">{metodo.icon}</span>
                <span className="delivery-tab__label">{metodo.label}</span>
                <span className="delivery-tab__status">Disponible</span>
              </button>
            ))}
          </div>

          {metodoEntrega === 'envio' && (
            <div className="delivery-info">
              <span className="delivery-info__icon" aria-hidden="true">🚚</span>
              <div className="delivery-info__body">
                <p className="delivery-info__title">{envioGratis ? 'Envío gratis' : 'Envío'}</p>
                <p className="delivery-info__text">Coordinamos la entrega tras confirmar tu orden</p>
              </div>
            </div>
          )}

          {metodoEntrega === 'retiro' && (
            <div className="delivery-info">
              <span className="delivery-info__icon" aria-hidden="true">🏬</span>
              <div className="delivery-info__body">
                <p className="delivery-info__title">Retiro en almacén</p>
                <p className="delivery-info__text">Retira tu pedido en nuestra sede una vez esté listo</p>
              </div>
            </div>
          )}

          {metodoEntrega === 'entrega' && (
            <div className="delivery-info">
              <span className="delivery-info__icon" aria-hidden="true">🎁</span>
              <div className="delivery-info__body">
                <p className="delivery-info__title">Entrega directa</p>
                <p className="delivery-info__text">Un repartidor de Droguería Carrisán te lo lleva</p>
              </div>
            </div>
          )}
        </section>

        {/* Líneas de producto */}
        <section className="cart-lines">
          <p className="cart-lines__count">
            Vendido y enviado por <strong>Droguería Carrisán</strong> · {cantidadArticulos} {cantidadArticulos === 1 ? 'artículo' : 'artículos'}
          </p>

          {items.map((item) => (
            <CartLine
              key={item.producto.id}
              item={item}
              tasaVes={tasaVes}
              onUpdateCantidad={updateCantidad}
              onRemove={removeItem}
            />
          ))}
        </section>

        {/* Resumen */}
        <section className="cart-summary">
          <h2 className="cart-summary__title">Resumen del pedido</h2>

          <div className="cart-summary__row">
            <span>Subtotal ({cantidadArticulos} {cantidadArticulos === 1 ? 'artículo' : 'artículos'})</span>
            <span>${formatUSD(total)}</span>
          </div>

          <div className="cart-summary__row">
            <span>Envío</span>
            <span className="cart-summary__gratis">Gratis</span>
          </div>

          <div className="cart-summary__row cart-summary__row--muted">
            <span>Impuestos</span>
            <span>Calculado al confirmar</span>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total estimado</span>
            <div className="cart-summary__total-values">
              <span className="cart-summary__total-usd">${formatUSD(total)}</span>
              {totalVes && <span className="cart-summary__total-ves">Bs. {formatVES(totalVes)}</span>}
            </div>
          </div>
        </section>
      </div>

      {/* Barra inferior sticky */}
      <div className="carrito-bottombar">
        <div className="carrito-bottombar__total">
          <span className="carrito-bottombar__label">Total estimado</span>
          <span className="carrito-bottombar__value">${formatUSD(total)}</span>
        </div>
        <button
          type="button"
          className="carrito-bottombar__cta"
          onClick={handleConfirmar}
          disabled={enviando}
        >
          {enviando ? 'Confirmando...' : 'Continuar con el pago'}
        </button>
      </div>
    </div>
  )
}

export default Carrito
