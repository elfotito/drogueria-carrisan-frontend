import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import OrdenDetalleModal from '../components/OrdenDetalleModal'
import './MisOrdenes.css'

// Etapas del ciclo de vida de una orden, en orden cronológico.
// El estado de PAGO (pagado/cancelado/etc.) vive en Estado de Cuenta, no acá:
// esta pantalla solo refleja el avance operativo del pedido, que asigna el
// administrador manualmente a medida que lo va procesando.
const ETAPAS_ORDEN = [
  { id: 'pendiente_verificacion', label: 'Pendiente por verificar' },
  { id: 'verificado', label: 'Verificado' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregado', label: 'Entregado' },
]

// Mapa de estado -> config visual. Cualquier estado nuevo que agregues
// más adelante cae en ESTADO_FALLBACK automáticamente (no rompe el diseño).
const ESTADOS_CONFIG = {
  pendiente_verificacion: { label: 'Pendiente por verificar', clase: 'badge--pendiente' },
  verificado: { label: 'Verificado', clase: 'badge--verificado' },
  enviado: { label: 'Enviado', clase: 'badge--enviado' },
  entregado: { label: 'Entregado', clase: 'badge--entregado' },
}

const ESTADO_FALLBACK = { label: null, clase: 'badge--neutro' }

function getEstadoConfig(estado) {
  const config = ESTADOS_CONFIG[estado] || { ...ESTADO_FALLBACK, label: estado }
  return config
}

function OrdenCardSkeleton() {
  return (
    <div className="orden-card orden-card--skeleton">
      <div className="skeleton-line skeleton-line--sm" />
      <div className="skeleton-line skeleton-line--md" />
      <div className="skeleton-line skeleton-line--sm" />
      <div className="skeleton-line skeleton-line--btn" />
    </div>
  )
}

// Indicador visual de avance (puntos conectados). Si el estado de la orden
// no está en ETAPAS_ORDEN (por ejemplo, uno legado), no se muestra —
// el badge de arriba sigue funcionando igual gracias al fallback.
function ProgresoOrden({ estado }) {
  const pasoActual = ETAPAS_ORDEN.findIndex((e) => e.id === estado)
  if (pasoActual === -1) return null

  return (
    <div className="orden-progreso">
      {ETAPAS_ORDEN.map((etapa, i) => (
        <div className="orden-progreso__paso" key={etapa.id}>
          <span className={`orden-progreso__punto ${i <= pasoActual ? 'orden-progreso__punto--activo' : ''}`} />
          {i < ETAPAS_ORDEN.length - 1 && (
            <span className={`orden-progreso__linea ${i < pasoActual ? 'orden-progreso__linea--activa' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function OrdenCard({ orden, esAdmin, onVerDetalle }) {
  const estadoConfig = getEstadoConfig(orden.estado)
  const fecha = new Date(orden.created_at).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  // ── Icono y etiqueta de tipo de envío ──
  const envioInfo = useMemo(() => {
    switch (orden.tipo_envio) {
      case 'retiro':
        return { icono: '🏪', texto: 'Retiro en tienda' }
      case 'delivery':
        return { 
          icono: '🛵', 
          texto: orden.usuario?.delivery_gratis 
            ? 'Delivery (¡Gratis!)' 
            : `Delivery (+$${orden.costo_delivery?.toFixed(2) || '8.00'})` 
        }
      case 'envio_nacional':
        return { icono: '📦', texto: `Envío Nac. (${orden.agencia_envio || 'N/A'})` }
      default:
        return { icono: '📋', texto: 'Sin especificar' }
    }
  }, [orden.tipo_envio, orden.costo_delivery, orden.agencia_envio, orden.usuario?.delivery_gratis])

  return (
    <div className="orden-card">
      <div className="orden-card__top">
        <div>
          <p className="orden-card__numero">Orden #{orden.id}</p>
          <p className="orden-card__fecha">{fecha}</p>
        </div>
        <span className={`orden-badge ${estadoConfig.clase}`}>{estadoConfig.label}</span>
      </div>

      <ProgresoOrden estado={orden.estado} />

      <div className="orden-card__envio">
        <span>{envioInfo.icono}</span>
        <span>{envioInfo.texto}</span>
      </div>

      {esAdmin && orden.users?.nombre && (
        <p className="orden-card__cliente">Cliente: <strong>{orden.users.nombre}</strong></p>
      )}

      <div className="orden-card__bottom">
        <p className="orden-card__total">
          Total: <span>${orden.total_usd.toFixed(2)}</span>
        </p>
        <button
          type="button"
          className="orden-card__ver-btn"
          onClick={() => onVerDetalle(orden)}
        >
          Ver detalle
        </button>
      </div>
    </div>
  )
}

function MisOrdenes() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const { user } = useAuth()

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        const { data } = await api.get('/orders')
        setOrdenes(data)
      } catch (err) {
        setError('No se pudieron cargar las órdenes')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }

    cargarOrdenes()
  }, [])

  // Tabs dinámicos: "Todos" + un tab por cada estado que exista realmente
  // en las órdenes cargadas, ordenados según el ciclo de vida (ETAPAS_ORDEN).
  // Si agregas un estado nuevo en el backend que no está en ETAPAS_ORDEN,
  // el tab igual aparece, solo que al final de la lista.
  const tabs = useMemo(() => {
    const estadosPresentes = [...new Set(ordenes.map((o) => o.estado))]
    const ordenEtapas = ETAPAS_ORDEN.map((e) => e.id)

    const tabsEstados = estadosPresentes
      .sort((a, b) => {
        const ia = ordenEtapas.indexOf(a)
        const ib = ordenEtapas.indexOf(b)
        if (ia === -1 && ib === -1) return 0
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
      .map((estado) => ({
        id: estado,
        label: getEstadoConfig(estado).label,
        count: ordenes.filter((o) => o.estado === estado).length,
      }))

    return [
      { id: 'todos', label: 'Todos', count: ordenes.length },
      ...tabsEstados,
    ]
  }, [ordenes])

  const ordenesFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return ordenes
    return ordenes.filter((o) => o.estado === filtroEstado)
  }, [ordenes, filtroEstado])

  if (error) {
    return (
      <div className="misordenes-page">
        <p className="misordenes-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="misordenes-page">
      <div className="misordenes-container">
        <h1 className="misordenes-title">
          {user?.es_admin ? 'Todas las Órdenes' : 'Mis Órdenes'}
        </h1>

        {!cargando && ordenes.length > 0 && (
          <div className="misordenes-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`misordenes-tab ${filtroEstado === tab.id ? 'misordenes-tab--activo' : ''}`}
                onClick={() => setFiltroEstado(tab.id)}
              >
                {tab.label}
                <span className="misordenes-tab__count">{tab.count}</span>
              </button>
            ))}
          </div>
        )}

        {cargando ? (
          <div className="ordenes-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrdenCardSkeleton key={i} />
            ))}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="misordenes-vacio">
            <div className="misordenes-vacio__icon">📦</div>
            <h2>No tenés órdenes todavía</h2>
            <p>Cuando confirmes un pedido, aparecerá aquí.</p>
            <Link to="/catalogo" className="misordenes-vacio__cta">Ir al catálogo</Link>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <p className="misordenes-vacio-filtro">No hay órdenes con este estado.</p>
        ) : (
          <div className="ordenes-grid">
            {ordenesFiltradas.map((orden) => (
              <OrdenCard
                key={orden.id}
                orden={orden}
                esAdmin={user?.es_admin}
                onVerDetalle={setOrdenSeleccionada}
              />
            ))}
          </div>
        )}
      </div>

      <OrdenDetalleModal
        orden={ordenSeleccionada}
        onClose={() => setOrdenSeleccionada(null)}
      />
    </div>
  )
}

export default MisOrdenes
