import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import OrdenDetalleModal from '../components/OrdenDetalleModal'
import './MisOrdenes.css'

// Mapa de estado -> config visual. Cualquier estado nuevo que agregues
// más adelante cae en ESTADO_FALLBACK automáticamente (no rompe el diseño).
const ESTADOS_CONFIG = {
  pendiente: { label: 'Pendiente', clase: 'badge--pendiente' },
  finalizado: { label: 'Finalizado', clase: 'badge--finalizado' },
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

      {/* ⭐ NUEVO: Indicador de tipo de envío */}
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
  // en las órdenes cargadas. Así, si agregas un estado nuevo en el backend,
  // el tab aparece solo sin tocar este archivo.
  const tabs = useMemo(() => {
    const estadosPresentes = [...new Set(ordenes.map((o) => o.estado))]

    const tabsEstados = estadosPresentes.map((estado) => ({
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
