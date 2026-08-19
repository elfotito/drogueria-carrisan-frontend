import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import './OrdenDetalle.css'
import { MessageCircle } from 'lucide-react'


// ---------------------------------------------------------
// Pipeline de estados — debe coincidir con el backend
// (ordenes.controller.js: ESTADOS_VALIDOS). Las descripciones de
// 'pedido_creado' y 'procesando' se ajustan según forma_pago porque
// el paso de pago solo existe para órdenes de contado.
// ---------------------------------------------------------
function getEtapas(formaPago) {
  return [
    {
      id: 'pedido_creado',
      label: 'Pedido Creado',
      desc: 'Recibimos tu pedido y estamos verificando disponibilidad y cantidades.',
    },
    {
      id: 'procesando',
      label: 'Procesando',
      desc: formaPago === 'credito'
        ? 'Tu pedido pasará a preparación usando tu línea de crédito.'
        : 'Confirmamos tu pedido. Ya puedes proceder con el pago.',
    },
    {
      id: 'preparando',
      label: 'Preparando',
      desc: 'Estamos empacando tu pedido. Ya no se pueden hacer cambios a la dirección de entrega.',
    },
    {
      id: 'enviado',
      label: 'Enviado',
      desc: 'Tu pedido salió de nuestro almacén rumbo a destino.',
    },
    {
      id: 'entregado',
      label: 'Entregado',
      desc: 'Tu pedido fue entregado con éxito.',
    },
  ]
}

const ESTADOS_CONFIG = {
  pedido_creado: { label: 'Pedido Creado', color: '#f59e0b', bg: '#fef3c7' },
  procesando: { label: 'Procesando', color: '#3b82f6', bg: '#dbeafe' },
  preparando: { label: 'Preparando', color: '#8b5cf6', bg: '#ede9fe' },
  enviado: { label: 'Enviado', color: '#06b6d4', bg: '#cffafe' },
  entregado: { label: 'Entregado', color: '#10b981', bg: '#d1fae5' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2' },
}

function formatUSD(valor) {
  return Number(valor || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString('es-VE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Timeline({ estadoActual, historial, formaPago }) {
  const etapas = getEtapas(formaPago)
  const cancelada = estadoActual === 'cancelado'
  const indiceActual = etapas.findIndex((e) => e.id === estadoActual)

  return (
    <div className="od-timeline">
      {cancelada && (
        <div className="od-timeline__cancelado">
          <span className="od-timeline__cancelado-icono">✕</span>
          <div>
            <strong>Esta orden fue cancelada</strong>
            {historial.find((h) => h.estado === 'cancelado') && (
              <p>{formatFecha(historial.find((h) => h.estado === 'cancelado').fecha)}</p>
            )}
          </div>
        </div>
      )}

      {etapas.map((etapa, index) => {
        const entrada = historial.find((h) => h.estado === etapa.id)
        const completado = !cancelada && index <= indiceActual
        const esActual = !cancelada && index === indiceActual
        const alcanzadaAntesDeCancelar = cancelada && !!entrada

        return (
          <div
            key={etapa.id}
            className={`od-timeline__paso ${completado || alcanzadaAntesDeCancelar ? 'od-timeline__paso--completo' : ''} ${esActual ? 'od-timeline__paso--actual' : ''}`}
          >
            <div className="od-timeline__marcador">
              <span className="od-timeline__punto" />
              {index < etapas.length - 1 && <span className="od-timeline__linea" />}
            </div>
            <div className="od-timeline__contenido">
              <p className="od-timeline__label">{etapa.label}</p>
              <p className="od-timeline__desc">{etapa.desc}</p>
              {entrada && <p className="od-timeline__fecha">{formatFecha(entrada.fecha)}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OrdenDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [orden, setOrden] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [pidiendoDeNuevo, setPidiendoDeNuevo] = useState(false)

  useEffect(() => {
    setCargando(true)
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrden(data))
      .catch((err) => {
        console.error(err)
        setError('No pudimos cargar esta orden. Puede que no exista o no tengas acceso a ella.')
      })
      .finally(() => setCargando(false))
  }, [id])

  async function volverAPedir() {
    if (!orden) return
    setPidiendoDeNuevo(true)
    const items = orden.ordenes_items || []
    let fallidos = 0

    for (const item of items) {
      try {
        const { data: producto } = await api.get(`/products/${item.producto_id}`)
        addItem(producto, item.cantidad)
      } catch {
        fallidos++
      }
    }

    setPidiendoDeNuevo(false)
    if (fallidos > 0) {
      alert(`${fallidos} producto(s) de esta orden ya no están disponibles y no se agregaron.`)
    }
    navigate('/carrito')
  }

  if (cargando) {
    return <div className="od-page od-page--centrado">Cargando orden...</div>
  }

  if (error || !orden) {
    return (
      <div className="od-page od-page--centrado">
        <p>{error}</p>
        <Link to="/orders" className="od-volver">← Volver a Mis Órdenes</Link>
      </div>
    )
  }

  const estadoConfig = ESTADOS_CONFIG[orden.estado] || { label: orden.estado, color: '#64748b', bg: '#f1f5f9' }
  const items = orden.ordenes_items || []
  const historial = orden.historial || []

  return (
    <div className="od-page">
      <div className="od-container">
        <Link to="/orders" className="od-volver">← Volver a Mis Órdenes</Link>

        <div className="od-header">
          <div>
            <h1>Orden #{orden.id}</h1>
            <p className="od-header__fecha">
              {new Date(orden.created_at).toLocaleDateString('es-VE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <span
            className="od-badge"
            style={{ backgroundColor: estadoConfig.bg, color: estadoConfig.color }}
          >
            {estadoConfig.label}
          </span>
        </div>

        {/* Descripción explicativa */}
        <div className="od-intro">
          Tu pedido pasa por varias etapas antes de llegar a tus manos. Acá podés seguir su
          progreso — cada etapa muestra la fecha y hora en que ocurrió.
        </div>

        {/* Timeline */}
        <section className="od-seccion">
          <Timeline estadoActual={orden.estado} historial={historial} formaPago={orden.forma_pago} />
        </section>

        {/* Productos */}
        <section className="od-seccion">
          <h2 className="od-seccion__titulo">Productos ({items.length})</h2>
          <div className="od-items">
            {items.map((item, index) => (
              <div key={item.id || index} className="od-item">
                <div className="od-item__body">
                  <p className="od-item__nombre">{item.productos?.nombre_comercial || 'Producto'}</p>
                  <p className="od-item__cantidad">
                    {item.cantidad} × ${formatUSD(item.precio_unitario)}
                  </p>
                </div>
                <p className="od-item__subtotal">${formatUSD(item.cantidad * item.precio_unitario)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Totales */}
        <section className="od-seccion">
          <div className="od-totales">
            <div className="od-total-final">
              <span>Total</span>
              <span className="od-total-valor">${formatUSD(orden.total_usd)}</span>
            </div>
          </div>
        </section>

        {/* Aviso de pago (solo contado, y solo mientras es relevante) */}
        {orden.forma_pago === 'contado' && orden.estado_pago && orden.estado_pago !== 'verificado' && (
          <section className={`od-aviso-pago od-aviso-pago--${orden.estado_pago}`}>
            {orden.estado_pago === 'esperando' && (
              <p>Tu pedido está listo. Puedes proceder con el pago cuando quieras.</p>
            )}
            {orden.estado_pago === 'reportado' && (
              <p>Reportaste tu pago. Lo estamos verificando.</p>
            )}
            {orden.estado_pago === 'rechazado' && (
              <p>Tu comprobante fue rechazado. Puedes volver a reportar el pago.</p>
            )}
          </section>
        )}

        {/* Acciones */}
        <section className="od-acciones">
          {orden.forma_pago === 'contado' && ['esperando', 'rechazado'].includes(orden.estado_pago) && (
            <button
              type="button"
              className="od-boton od-boton--pagar"
              onClick={() => navigate('/pagos', { state: { ordenIds: [orden.id] } })}
            >
              Pagar orden
            </button>
          )}
          <button
            type="button"
            className="od-boton od-boton--primario"
            onClick={volverAPedir}
            disabled={pidiendoDeNuevo}
          >
            {pidiendoDeNuevo ? 'Agregando...' : 'Volver a pedir'}
          </button>
          <button
  type="button"
  className="od-boton od-boton--secundario"
  onClick={() => navigate(`/chat/orden/${orden.id}`)}
>
  <MessageCircle size={16} style={{ marginRight: 6 }} />
  ¿Necesitás ayuda con esta orden?
</button>
        </section>
      </div>
    </div>
  )
}

export default OrdenDetalle