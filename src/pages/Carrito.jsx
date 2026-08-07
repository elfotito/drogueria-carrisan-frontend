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
            <button type="button" className="cart-line__stepper-btn" onClick={() => onUpdateCantidad(producto.id, cantidad - 1)} aria-label="Disminuir cantidad">−</button>
            <span className="cart-line__stepper-value">{cantidad}</span>
            <button type="button" className="cart-line__stepper-btn" onClick={() => onUpdateCantidad(producto.id, cantidad + 1)} aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
        <p className="cart-line__subtotal">Subtotal: <strong>${formatUSD(subtotalUsd)}</strong></p>
      </div>
    </div>
  )
}

// 🆕 Componente DireccionSelector simplificado (igual que antes pero sin duplicar lógica)
function DireccionSelector({ 
  direcciones, 
  direccionSeleccionada, 
  onSeleccionar, 
  onAgregar,
  loading,
  tipo
}) {
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [paso, setPaso] = useState(1)
  const [nuevaDireccion, setNuevaDireccion] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    estado: tipo === 'delivery' ? 'Carabobo' : '',
    telefono_contacto: '',
    referencia: '',
    agencia_preferida: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const CIUDADES_DELIVERY = ['Valencia', 'Naguanagua', 'San Diego', 'Guacara', 'Los Guayos']

  const handleAgregar = async (e) => {
    e.preventDefault()
    
    if (!nuevaDireccion.nombre || !nuevaDireccion.direccion) {
      setError('Nombre y dirección son requeridos')
      return
    }

    if (tipo === 'delivery' && !nuevaDireccion.ciudad) {
      setError('Selecciona una ciudad')
      return
    }

    setGuardando(true)
    setError('')

    try {
      await onAgregar({
        ...nuevaDireccion,
        estado: tipo === 'delivery' ? 'Distrito Capital' : nuevaDireccion.estado
      })
      setPaso(2)
      setTimeout(() => {
        setMostrarPanel(false)
        setPaso(1)
        setNuevaDireccion({
          nombre: '',
          direccion: '',
          ciudad: '',
          estado: tipo === 'delivery' ? 'Distrito Capital' : '',
          telefono_contacto: '',
          referencia: '',
          agencia_preferida: ''
        })
      }, 1500)
    } catch (error) {
      setError('Error al guardar la dirección')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="direccion-loading">
        <div className="direccion-loading__spinner"></div>
        <span>Cargando direcciones...</span>
      </div>
    )
  }

  return (
    <div className="direccion-selector">
      {direcciones.length > 0 && (
        <div className="direccion-lista">
          <p className="direccion-lista__titulo">Selecciona una dirección</p>
          {direcciones.map((dir) => (
            <label 
              key={dir.id} 
              className={`direccion-radio ${direccionSeleccionada?.id === dir.id ? 'direccion-radio--selected' : ''}`}
            >
              <input
                type="radio"
                name="direccion"
                checked={direccionSeleccionada?.id === dir.id}
                onChange={() => onSeleccionar(dir)}
              />
              <div className="direccion-radio__content">
                <div className="direccion-radio__header">
                  <span className="direccion-radio__nombre">{dir.nombre}</span>
                  {dir.telefono_contacto && (
                    <span className="direccion-radio__telefono">{dir.telefono_contacto}</span>
                  )}
                </div>
                <p className="direccion-radio__direccion">{dir.direccion}</p>
                <div className="direccion-radio__meta">
                  {dir.ciudad && <span>📍 {dir.ciudad}{dir.estado ? `, ${dir.estado}` : ''}</span>}
                  {dir.agencia_preferida && <span>🚚 {dir.agencia_preferida}</span>}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      <button 
        type="button" 
        className="direccion-add-btn"
        onClick={() => setMostrarPanel(true)}
      >
        <span className="direccion-add-btn__icon">+</span>
        {direcciones.length === 0 ? 'Agregar dirección de entrega' : 'Agregar otra dirección'}
      </button>

      {mostrarPanel && (
        <>
          <div className="direccion-overlay" onClick={() => setMostrarPanel(false)} />
          <div className="direccion-panel">
            <div className="direccion-panel__handle" />
            
            {paso === 1 ? (
              <>
                <div className="direccion-panel__header">
                  <h3>Nueva dirección {tipo === 'envio_nacional' ? 'nacional' : 'de delivery'}</h3>
                  <button className="direccion-panel__close" onClick={() => setMostrarPanel(false)}>✕</button>
                </div>

                <form onSubmit={handleAgregar} className="direccion-panel__form">
                  {error && <div className="direccion-error">{error}</div>}

                  <div className="direccion-input-group">
                    <label>Nombre de la dirección *</label>
                    <input type="text" value={nuevaDireccion.nombre} onChange={(e) => setNuevaDireccion({...nuevaDireccion, nombre: e.target.value})} placeholder="Ej: Casa, Oficina, Consultorio" required />
                  </div>

                  <div className="direccion-input-group">
                    <label>Dirección completa *</label>
                    <textarea value={nuevaDireccion.direccion} onChange={(e) => setNuevaDireccion({...nuevaDireccion, direccion: e.target.value})} placeholder="Calle, número, urbanización, punto de referencia" required rows="2" />
                  </div>

                  {tipo === 'delivery' ? (
                    <div className="direccion-input-row">
                      <div className="direccion-input-group">
                        <label>Ciudad *</label>
                        <select value={nuevaDireccion.ciudad} onChange={(e) => setNuevaDireccion({...nuevaDireccion, ciudad: e.target.value})} required>
                          <option value="">Seleccionar</option>
                          {CIUDADES_DELIVERY.map(ciudad => (
                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                          ))}
                        </select>
                      </div>
                      <div className="direccion-input-group">
                        <label>Estado</label>
                        <input type="text" value="Distrito Capital" disabled className="direccion-input-disabled" />
                      </div>
                    </div>
                  ) : (
                    <div className="direccion-input-row">
                      <div className="direccion-input-group">
                        <label>Ciudad</label>
                        <input type="text" value={nuevaDireccion.ciudad} onChange={(e) => setNuevaDireccion({...nuevaDireccion, ciudad: e.target.value})} placeholder="Ciudad" />
                      </div>
                      <div className="direccion-input-group">
                        <label>Estado</label>
                        <input type="text" value={nuevaDireccion.estado} onChange={(e) => setNuevaDireccion({...nuevaDireccion, estado: e.target.value})} placeholder="Estado" />
                      </div>
                    </div>
                  )}

                  <div className="direccion-input-group">
                    <label>Teléfono de contacto</label>
                    <input type="text" value={nuevaDireccion.telefono_contacto} onChange={(e) => setNuevaDireccion({...nuevaDireccion, telefono_contacto: e.target.value})} placeholder="Ej: +58 414-1234567" />
                  </div>

                  <div className="direccion-input-group">
                    <label>Referencia (opcional)</label>
                    <input type="text" value={nuevaDireccion.referencia} onChange={(e) => setNuevaDireccion({...nuevaDireccion, referencia: e.target.value})} placeholder="Color de casa, punto de referencia, etc." />
                  </div>

                  {tipo === 'envio_nacional' && (
                    <div className="direccion-input-group">
                      <label>Agencia de envío preferida</label>
                      <select value={nuevaDireccion.agencia_preferida} onChange={(e) => setNuevaDireccion({...nuevaDireccion, agencia_preferida: e.target.value})} className="direccion-select-agencia">
                        <option value="">Seleccionar agencia</option>
                        <option value="MRW">MRW</option>
                        <option value="Domesa">Domesa</option>
                        <option value="Tealca">Tealca</option>
                        <option value="Zoom">Zoom</option>
                        <option value="Servientrega">Servientrega</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  )}

                  <button type="submit" className="direccion-submit-btn" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar dirección'}
                  </button>
                </form>
              </>
            ) : (
              <div className="direccion-success">
                <div className="direccion-success__icon">✅</div>
                <h3>¡Dirección guardada!</h3>
                <p>Tu dirección ha sido agregada correctamente</p>
              </div>
            )}
          </div>
        </>
      )}
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
  } = useEnvio()

  const [tasaVes, setTasaVes] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  
  // 🆕 Controla si la sección de envío está expandida o colapsada
  const [envioExpandido, setEnvioExpandido] = useState(true)
  
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasaVes(res.data.usd_a_ves))
      .catch(() => setTasaVes(null))
  }, [])

  // 🆕 Si ya hay una dirección seleccionada y tipo de envío, colapsar la sección
  useEffect(() => {
    if (tipoEnvio && (tipoEnvio === 'retiro' || direccionSeleccionada)) {
      setEnvioExpandido(false)
    }
  }, [tipoEnvio, direccionSeleccionada])

  async function handleConfirmar() {
    setError('')
    
    if (opcionActual?.requiereDireccion && !direccionSeleccionada) {
      setError('Debes seleccionar una dirección de entrega')
      setEnvioExpandido(true) // 🆕 Expandir para que vea el error
      return
    }
    
    if (opcionActual?.requiereAgencia && !agenciaSeleccionada) {
      setError('Debes seleccionar una agencia de envío')
      setEnvioExpandido(true) // 🆕 Expandir para que vea el error
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

        {/* 🆕 Sección de envío colapsable */}
        <section className="delivery-card">
          <button 
            className="delivery-card__header"
            onClick={() => setEnvioExpandido(!envioExpandido)}
          >
            <span className="delivery-card__header-icon" aria-hidden="true">📦</span>
            <div className="delivery-card__header-text">
              <h2>¿Cómo quieres recibir tu pedido?</h2>
              {!envioExpandido && opcionActual && (
                <p className="delivery-card__resumen">
                  {opcionActual.icono} {opcionActual.label}
                  {direccionSeleccionada && ` • 📍 ${direccionSeleccionada.nombre}`}
                </p>
              )}
            </div>
            <svg 
              className={`delivery-card__chevron ${envioExpandido ? 'rotated' : ''}`}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Contenido expandible */}
          <div className={`delivery-card__body ${envioExpandido ? 'expanded' : 'collapsed'}`}>
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

            {opcionActual && (
              <div className="delivery-info">
                <span className="delivery-info__icon" aria-hidden="true">{opcionActual.icono}</span>
                <div className="delivery-info__body">
                  <p className="delivery-info__title">{opcionActual.label}</p>
                  <p className="delivery-info__text">{opcionActual.descripcion}</p>
                  
                  {opcionActual.requiereDireccion && (
                    <DireccionSelector
                      direcciones={direcciones}
                      direccionSeleccionada={direccionSeleccionada}
                      onSeleccionar={setDireccionSeleccionada}
                      onAgregar={guardarDireccion}
                      loading={loading}
                      tipo={opcionActual.tipoDireccion}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
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
            <span>{opcionActual?.label || 'Envío'}</span>
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