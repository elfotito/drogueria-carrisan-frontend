import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useEnvio } from '../components/useEnvios'
import './Carrito.css'

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

// 🆕 Componente para mostrar/agregar direcciones
function DireccionSelector({ 
  direcciones, 
  direccionSeleccionada, 
  onSeleccionar, 
  onAgregar,
  loading 
}) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevaDireccion, setNuevaDireccion] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    estado: '',
    telefono_contacto: '',
    referencia: ''
  })

  const handleAgregar = async (e) => {
    e.preventDefault()
    if (!nuevaDireccion.nombre || !nuevaDireccion.direccion) return
    
    try {
      await onAgregar(nuevaDireccion)
      setMostrarForm(false)
      setNuevaDireccion({
        nombre: '',
        direccion: '',
        ciudad: '',
        estado: '',
        telefono_contacto: '',
        referencia: ''
      })
    } catch (error) {
      console.error('Error al guardar dirección:', error)
    }
  }

  if (loading) return <p className="delivery-info__text">Cargando direcciones...</p>

  return (
    <div className="direccion-selector">
      {direcciones.length > 0 ? (
        <div className="direccion-lista">
          {direcciones.map((dir) => (
            <label 
              key={dir.id} 
              className={`direccion-item ${direccionSeleccionada?.id === dir.id ? 'direccion-item--selected' : ''}`}
            >
              <input
                type="radio"
                name="direccion"
                checked={direccionSeleccionada?.id === dir.id}
                onChange={() => onSeleccionar(dir)}
              />
              <div className="direccion-item__info">
                <strong>{dir.nombre}</strong>
                <p>{dir.direccion}</p>
                {dir.ciudad && <span>{dir.ciudad}{dir.estado ? `, ${dir.estado}` : ''}</span>}
                {dir.telefono_contacto && <span>📞 {dir.telefono_contacto}</span>}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="delivery-info__text">No tienes direcciones guardadas</p>
      )}

      {!mostrarForm ? (
        <button 
          type="button" 
          className="cart-line__link"
          onClick={() => setMostrarForm(true)}
          style={{ marginTop: '8px' }}
        >
          + Agregar nueva dirección
        </button>
      ) : (
        <form onSubmit={handleAgregar} className="direccion-form">
          <input
            type="text"
            placeholder="Nombre (ej: Casa, Oficina)"
            value={nuevaDireccion.nombre}
            onChange={(e) => setNuevaDireccion({...nuevaDireccion, nombre: e.target.value})}
            required
          />
          <textarea
            placeholder="Dirección completa"
            value={nuevaDireccion.direccion}
            onChange={(e) => setNuevaDireccion({...nuevaDireccion, direccion: e.target.value})}
            required
            rows="2"
          />
          <div className="direccion-form__row">
            <input
              type="text"
              placeholder="Ciudad"
              value={nuevaDireccion.ciudad}
              onChange={(e) => setNuevaDireccion({...nuevaDireccion, ciudad: e.target.value})}
            />
            <input
              type="text"
              placeholder="Estado"
              value={nuevaDireccion.estado}
              onChange={(e) => setNuevaDireccion({...nuevaDireccion, estado: e.target.value})}
            />
          </div>
          <input
            type="text"
            placeholder="Teléfono de contacto"
            value={nuevaDireccion.telefono_contacto}
            onChange={(e) => setNuevaDireccion({...nuevaDireccion, telefono_contacto: e.target.value})}
          />
          <input
            type="text"
            placeholder="Referencia (opcional)"
            value={nuevaDireccion.referencia}
            onChange={(e) => setNuevaDireccion({...nuevaDireccion, referencia: e.target.value})}
          />
          <div className="direccion-form__actions">
            <button type="submit" className="carrito-bottombar__cta" style={{ fontSize: '14px', padding: '8px 16px' }}>
              Guardar
            </button>
            <button 
              type="button" 
              className="cart-line__link cart-line__link--danger"
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function AgenciaSelector({ agencias, agenciaSeleccionada, onSeleccionar }) {
  return (
    <div className="agencia-selector">
      <p className="delivery-info__title">Agencia de envío preferida</p>
      <div className="agencia-lista">
        {agencias.map((agencia) => (
          <label 
            key={agencia} 
            className={`agencia-item ${agenciaSeleccionada === agencia ? 'agencia-item--selected' : ''}`}
          >
            <input
              type="radio"
              name="agencia"
              checked={agenciaSeleccionada === agencia}
              onChange={() => onSeleccionar(agencia)}
            />
            <span>{agencia}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function Carrito() {
  const { items, updateCantidad, removeItem, clearCart, total } = useCart()
  const {
    tipoEnvio,
    cambiarTipoEnvio,
    opcionesEnvio,
    opcionActual,
    direcciones,
    direccionSeleccionada,
    setDireccionSeleccionada,
    agenciaSeleccionada,
    setAgenciaSeleccionada,
    agencias,
    loading,
    guardarDireccion,
    costoEnvio
  } = useEnvio() // 🆕

  const [tasaVes, setTasaVes] = useState(null)
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
    
    // Validaciones
    if (opcionActual?.requiereDireccion && !direccionSeleccionada) {
      setError('Debes seleccionar una dirección de entrega')
      return
    }
    
    if (opcionActual?.requiereAgencia && !agenciaSeleccionada) {
      setError('Debes seleccionar una agencia de envío')
      return
    }

    setEnviando(true)

    try {
      const payload = {
        items: items.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
        tipo_envio: tipoEnvio,
        direccion_envio_id: direccionSeleccionada?.id || null,
        costo_delivery: costoEnvio,
        agencia_envio: agenciaSeleccionada || null,
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
  const totalConEnvio = total + costoEnvio
  const totalVes = tasaVes ? totalConEnvio * tasaVes : null

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

        {/* 🆕 Opciones de envío actualizadas */}
        <section className="delivery-card">
          <div className="delivery-card__header">
            <span className="delivery-card__header-icon" aria-hidden="true">📦</span>
            <h2>¿Cómo quieres recibir tu pedido?</h2>
          </div>

          <div className="delivery-tabs">
            {opcionesEnvio.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`delivery-tab ${tipoEnvio === opcion.id ? 'delivery-tab--active' : ''}`}
                onClick={() => cambiarTipoEnvio(opcion.id)}
              >
                <span className="delivery-tab__icon">{opcion.icono}</span>
                <span className="delivery-tab__label">{opcion.label}</span>
                <span className="delivery-tab__costo">{opcion.textoCosto}</span>
              </button>
            ))}
          </div>

          {/* Información de la opción seleccionada */}
          {opcionActual && (
            <div className="delivery-info">
              <span className="delivery-info__icon" aria-hidden="true">{opcionActual.icono}</span>
              <div className="delivery-info__body">
                <p className="delivery-info__title">{opcionActual.label}</p>
                <p className="delivery-info__text">{opcionActual.descripcion}</p>
                
                {/* 🆕 Selector de dirección */}
                {opcionActual.requiereDireccion && (
                  <DireccionSelector
                    direcciones={direcciones}
                    direccionSeleccionada={direccionSeleccionada}
                    onSeleccionar={setDireccionSeleccionada}
                    onAgregar={guardarDireccion}
                    loading={loading}
                  />
                )}
                
                {/* 🆕 Selector de agencia */}
                {opcionActual.requiereAgencia && (
                  <AgenciaSelector
                    agencias={agencias}
                    agenciaSeleccionada={agenciaSeleccionada}
                    onSeleccionar={setAgenciaSeleccionada}
                  />
                )}
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

        {/* 🆕 Resumen actualizado */}
        <section className="cart-summary">
          <h2 className="cart-summary__title">Resumen del pedido</h2>

          <div className="cart-summary__row">
            <span>Subtotal ({cantidadArticulos} {cantidadArticulos === 1 ? 'artículo' : 'artículos'})</span>
            <span>${formatUSD(total)}</span>
          </div>

          <div className="cart-summary__row">
            <span>
              {opcionActual?.label || 'Envío'}
            </span>
            <span className={costoEnvio === 0 ? 'cart-summary__gratis' : ''}>
              {costoEnvio === 0 ? 'Gratis' : `$${formatUSD(costoEnvio)}`}
            </span>
          </div>

          {opcionActual?.id === 'envio_nacional' && (
            <div className="cart-summary__row cart-summary__row--muted">
              <span>Envío nacional</span>
              <span>Pago en destino</span>
            </div>
          )}

          <div className="cart-summary__divider" />

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total estimado</span>
            <div className="cart-summary__total-values">
              <span className="cart-summary__total-usd">${formatUSD(totalConEnvio)}</span>
              {totalVes && <span className="cart-summary__total-ves">Bs. {formatVES(totalVes)}</span>}
            </div>
          </div>
        </section>
      </div>

      {/* Barra inferior sticky */}
      <div className="carrito-bottombar">
        <div className="carrito-bottombar__total">
          <span className="carrito-bottombar__label">Total estimado</span>
          <span className="carrito-bottombar__value">${formatUSD(totalConEnvio)}</span>
        </div>
        <button
          type="button"
          className="carrito-bottombar__cta"
          onClick={handleConfirmar}
          disabled={enviando}
        >
          {enviando ? 'Confirmando...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  )
}

export default Carrito