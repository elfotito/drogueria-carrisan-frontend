import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useEnvio } from '../context/EnvioContext'
import { useAuth } from '../context/AuthContext'
import HomeCarrusel from '../components/HomeCarrusel'
import PinCheckout from '../components/PinCheckout'
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

// Componente DireccionSelector (se mantiene igual)
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
        estado: tipo === 'delivery' ? 'Carabobo' : nuevaDireccion.estado,
        tipo_direccion: tipo
      })
      setPaso(2)
      setTimeout(() => {
        setMostrarPanel(false)
        setPaso(1)
        setNuevaDireccion({
          nombre: '',
          direccion: '',
          ciudad: '',
          estado: tipo === 'delivery' ? 'Carabobo' : '',
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

  // 🆕 Cuando se selecciona una dirección, notificar al padre
  const handleSeleccionarDireccion = (dir) => {
    onSeleccionar(dir)
    // El padre (Carrito) se encargará de cerrar el panel
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
                onChange={() => handleSeleccionarDireccion(dir)}
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
                        <input type="text" value="Carabobo" disabled className="direccion-input-disabled" />
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
  const { user } = useAuth()
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
  const [saldoDisponible, setSaldoDisponible] = useState(null)
  const [ordenesVencidas, setOrdenesVencidas] = useState(0)
  const [formaPago, setFormaPago] = useState('contado')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [envioExpandido, setEnvioExpandido] = useState(false)
  const [ofertas, setOfertas] = useState([])
  const [productosRecientes, setProductosRecientes] = useState([])
  const [cargandoCarruseles, setCargandoCarruseles] = useState(true)
  const [subUsuarioId, setSubUsuarioId] = useState(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasaVes(res.data.usd_a_ves))
      .catch(() => setTasaVes(null))
  }, [])

  // Traemos el saldo de crédito disponible del cliente (linea_credito - deuda)
  // y si tiene órdenes vencidas — con vencidas, la línea de crédito se
  // bloquea para compras nuevas hasta que regularice (contado no se ve
  // afectado). Si el usuario no tiene línea de crédito asignada (0 o
  // null), simplemente nunca alcanzará el total y la opción no se ofrece.
  useEffect(() => {
    if (!user?.id) return
    api
      .get(`/clientes/${user.id}/estado-cuenta`)
      .then((res) => {
        setSaldoDisponible(res.data.resumen.saldo)
        setOrdenesVencidas(res.data.resumen.cantidad_ordenes_vencidas || 0)
      })
      .catch(() => setSaldoDisponible(null))
  }, [user?.id])

  useEffect(() => {
    const opcionActual = opcionesEnvio?.find(op => op.id === tipoEnvio)
    if (opcionActual?.requiereDireccion && !direccionSeleccionada) {
      setEnvioExpandido(true)
    }
  }, [tipoEnvio, direccionSeleccionada, opcionesEnvio])

  // Cargar productos para los carruseles
  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const activos = res.data.filter((p) => p.activo)
        setOfertas(activos.filter((p) => p.descuento_activo).slice(0, 12))
        setProductosRecientes(activos.slice(0, 12))
      })
      .catch(() => {})
      .finally(() => setCargandoCarruseles(false))
  }, [])

  // 🆕 Cerrar panel SOLO cuando se selecciona una dirección (no al cambiar tipo de envío)
    const handleCambiarTipoEnvio = (tipo) => {
    cambiarTipoEnvio(tipo) // Esto actualiza el contexto global
    setEnvioExpandido(true) // Expandir para configurar
  }

  const handleSeleccionarDireccion = (dir) => {
    setDireccionSeleccionada(dir)
    setEnvioExpandido(false) // Colapsar después de seleccionar
  }

  async function handleConfirmar() {
    setError('')
    
    if (opcionActual?.requiereDireccion && !direccionSeleccionada) {
      setError('Debes seleccionar una dirección de entrega')
      setEnvioExpandido(true)
      return
    }
    
    if (opcionActual?.requiereAgencia && !agenciaSeleccionada) {
      setError('Debes seleccionar una agencia de envío')
      setEnvioExpandido(true)
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
        agencia_envio: agenciaSeleccionada || null,
        forma_pago: formaPago,
        sub_usuario_id: subUsuarioId,
      }
      await api.post('/orders', payload)
      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar la orden')
    } finally {
      setEnviando(false)
    }
  }

  const cantidadArticulos = items.reduce((acc, item) => acc + item.cantidad, 0)
  const totalConEnvio = total + costoEnvio
  const totalVes = tasaVes ? totalConEnvio * tasaVes : null

  // El crédito solo se ofrece si el usuario tiene saldo suficiente para
  // cubrir el total actual del carrito (incluyendo envío) Y no tiene
  // órdenes vencidas pendientes de pago. Si el carrito cambia y deja de
  // alcanzar (o aparece una orden vencida), volvemos automáticamente a
  // 'contado' para no dejar seleccionada una opción que el backend
  // rechazaría.
  const creditoDisponible = saldoDisponible !== null && saldoDisponible >= totalConEnvio && ordenesVencidas === 0

  useEffect(() => {
    if (formaPago === 'credito' && !creditoDisponible) {
      setFormaPago('contado')
    }
  }, [creditoDisponible, formaPago])


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

  // 🆕 Componente del resumen (sidebar derecho)
  const ResumenPedido = () => (
    <div className="cart-resumen-sidebar">
      <div className="cart-resumen-sticky">
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

        {ordenesVencidas > 0 && (
          <div className="cart-alerta-vencidas">
            <span className="cart-alerta-vencidas__icono">⚠️</span>
            <div>
              <strong>Tenés {ordenesVencidas} {ordenesVencidas === 1 ? 'orden vencida' : 'órdenes vencidas'}</strong>
              <p>Tu línea de crédito está pausada hasta que regularices tu cuenta. Podés seguir comprando de contado.</p>
              <Link to="/estado-cuenta" className="cart-alerta-vencidas__link">Ir a reportar pago →</Link>
            </div>
          </div>
        )}

        {creditoDisponible && (
          <div className="cart-forma-pago">
            <p className="cart-forma-pago__titulo">¿Cómo quieres pagar?</p>
            <div className="cart-forma-pago__opciones">
              <button
                type="button"
                className={`cart-forma-pago__opcion ${formaPago === 'contado' ? 'cart-forma-pago__opcion--activa' : ''}`}
                onClick={() => setFormaPago('contado')}
              >
                <span className="cart-forma-pago__opcion-titulo">De contado</span>
                <span className="cart-forma-pago__opcion-desc">Reportas tu pago cuando confirmemos el pedido</span>
              </button>
              <button
                type="button"
                className={`cart-forma-pago__opcion ${formaPago === 'credito' ? 'cart-forma-pago__opcion--activa' : ''}`}
                onClick={() => setFormaPago('credito')}
              >
                <span className="cart-forma-pago__opcion-titulo">Con mi línea de crédito</span>
                <span className="cart-forma-pago__opcion-desc">Saldo disponible: ${formatUSD(saldoDisponible)}</span>
              </button>
            </div>
          </div>
        )}

        <PinCheckout onResuelto={setSubUsuarioId} />

        {error && <p className="carrito-error carrito-error--sidebar">{error}</p>}

        <button
          type="button"
          className="carrito-bottombar__cta carrito-bottombar__cta--sidebar"
          onClick={handleConfirmar}
          disabled={enviando}
        >
          {enviando ? 'Confirmando...' : 'Confirmar pedido'}
        </button>

        <div className="cart-resumen-seguridad">
          <span>🔒 Compra segura</span>
          <p>Tus datos están protegidos</p>
        </div>

        {/* Cupón de descuento */}
        <div className="cart-cupon">
          <p className="cart-cupon__titulo">¿Tenés un cupón de descuento?</p>
          <div className="cart-cupon__row">
            <input
              type="text"
              className="cart-cupon__input"
              placeholder="Ingresá tu código"
            />
            <button type="button" className="cart-cupon__btn">Aplicar</button>
          </div>
        </div>

        {/* Beneficios */}
        <div className="cart-benefits">
          <div className="cart-benefits__item">
            <span className="cart-benefits__icon">🚚</span>
            <div className="cart-benefits__text">
              <strong>Envío prioritario</strong>
              Despacho el mismo día para pedidos antes de las 2:00 PM.
            </div>
          </div>
          <div className="cart-benefits__item">
            <span className="cart-benefits__icon">🛡️</span>
            <div className="cart-benefits__text">
              <strong>Calidad certificada</strong>
              Todos los productos cuentan con registro sanitario vigente.
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="carrito-page">
      <div className="carrito-container">
        <h1 className="carrito-title">Carrito ({cantidadArticulos} {cantidadArticulos === 1 ? 'artículo' : 'artículos'})</h1>

        {/* 🆕 Layout de 2 columnas */}
        <div className="carrito-layout">
          {/* Columna izquierda: Envío + Productos */}
          <div className="carrito-main">
            {/* Sección de envío colapsable */}
                        <section className="delivery-card">
              <button 
                className="delivery-card__header"
                onClick={() => setEnvioExpandido(!envioExpandido)}
              >
                <span className="delivery-card__header-icon">📦</span>
                <div className="delivery-card__header-text">
                  <h2>Método de envío</h2>
                  {!envioExpandido && opcionActual && (
                    <p className="delivery-card__resumen">
                      <span className="delivery-card__badge delivery-card__badge--tipo">
                        {opcionActual.icono} {opcionActual.label}
                      </span>
                      {direccionSeleccionada && (
                        <span className="delivery-card__badge delivery-card__badge--direccion">
                          📍 {direccionSeleccionada.nombre}
                        </span>
                      )}
                      <span className={`delivery-card__badge delivery-card__badge--costo ${
                        costoEnvio === 0 ? 'delivery-card__badge--gratis' : ''
                      }`}>
                        {costoEnvio === 0 ? '✓ Gratis' : `$${costoEnvio.toFixed(2)}`}
                      </span>
                    </p>
                  )}
                </div>
                <svg 
                  className={`delivery-card__chevron ${envioExpandido ? 'rotated' : ''}`}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {envioExpandido && (
                <div className="delivery-card__body">
                  <div className="delivery-tabs">
                    {opcionesEnvio?.map((opcion) => (
                      <button
                        key={opcion.id}
                        type="button"
                        className={`delivery-tab ${tipoEnvio === opcion.id ? 'delivery-tab--active' : ''}`}
                        onClick={() => handleCambiarTipoEnvio(opcion.id)}
                      >
                        <span className="delivery-tab__icon">{opcion.icono}</span>
                        <span className="delivery-tab__label">{opcion.label}</span>
                        <span className="delivery-tab__costo">{opcion.textoCosto}</span>
                      </button>
                    ))}
                  </div>

                  {opcionActual?.requiereDireccion && (
                    <DireccionSelector
                      direcciones={direcciones}
                      direccionSeleccionada={direccionSeleccionada}
                      onSeleccionar={handleSeleccionarDireccion}
                      onAgregar={guardarDireccion}
                      tipo={opcionActual.tipoDireccion}
                    />
                  )}
                </div>
              )}
            </section>

            {/* Líneas de producto */}
            <section className="cart-lines">
              <p className="cart-lines__count">
                Vendido y enviado por <strong>Droguería Carrisán</strong>
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

            {/* Carruseles de productos */}
            <HomeCarrusel
              titulo="Ofertas del día"
              subtitulo="Descuentos especiales por tiempo limitado"
              productos={ofertas}
              tasaVes={tasaVes}
              cargando={cargandoCarruseles}
              verTodoTo="/catalogo"
            />
            <HomeCarrusel
              titulo="Los más recientes"
              subtitulo="Conocé los últimos productos del catálogo"
              productos={productosRecientes}
              tasaVes={tasaVes}
              cargando={cargandoCarruseles}
              verTodoTo="/catalogo"
            />
          </div>

          {/* Columna derecha: Resumen sticky */}
          <ResumenPedido />
        </div>
      </div>

      {/* 🆕 Barra inferior SOLO para móvil */}
      <div className="carrito-bottombar carrito-bottombar--mobile">
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