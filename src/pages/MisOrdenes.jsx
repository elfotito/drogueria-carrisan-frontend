import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Truck, Store, Boxes, ArrowRight } from 'lucide-react'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { getEtapas, getEstadoConfig, getLabelEstado, normalizarEstado, ESTADOS_ORDEN } from '../config/estadosOrden'
import './MisOrdenes.css'

// Badge de estado. Labels vienen de la ÚNICA fuente de verdad
// (src/config/estadosOrden.js); la clase CSS local es solo un hook de
// presentación ligado al id del estado (normalizado para estados legacy).
function getEstadoBadge(estado) {
  const normalizado = normalizarEstado(estado)
  const cfg = getEstadoConfig(normalizado)
  if (!cfg) return { label: estado || 'Desconocido', clase: 'mo-badge--neutro' }
  return { label: getLabelEstado(normalizado, { rol: 'cliente' }), clase: `mo-badge--${normalizado}` }
}

// Órdenes viejas sin tipo_envio se tratan como delivery (línea histórica).
const fulfillmentDe = (orden) => orden?.tipo_envio || 'delivery'

function OrdenCardSkeleton() {
  return (
    <div className="mo-card mo-card--skeleton">
      <div className="mo-skeleton-line mo-skeleton-line--sm" />
      <div className="mo-skeleton-line mo-skeleton-line--md" />
      <div className="mo-skeleton-line mo-skeleton-line--sm" />
      <div className="mo-skeleton-line mo-skeleton-line--btn" />
    </div>
  )
}

// Indicador visual de avance (puntos conectados), derivado del fulfillment
// method (ver getEtapas en estadosOrden.js). Si el estado de la orden no
// pertenece a esa línea (p.ej. cancelado o uno legacy), no se muestra —
// el badge de arriba sigue funcionando igual.
function ProgresoOrden({ orden }) {
  const etapas = getEtapas(fulfillmentDe(orden))
  const pasoActual = etapas.findIndex((e) => e.id === normalizarEstado(orden.estado))
  if (pasoActual === -1) return null

  return (
    <div className="mo-progreso">
      {etapas.map((etapa, i) => (
        <div className="mo-progreso__paso" key={etapa.id}>
          <span className={`mo-progreso__punto ${i <= pasoActual ? 'mo-progreso__punto--activo' : ''}`} />
          {i < etapas.length - 1 && (
            <span className={`mo-progreso__linea ${i < pasoActual ? 'mo-progreso__linea--activa' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function OrdenCard({ orden, esAdmin, onVerDetalle }) {
  const estadoBadge = getEstadoBadge(orden.estado)
  const fecha = new Date(orden.created_at).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const envioInfo = useMemo(() => {
    switch (orden.tipo_envio) {
      case 'retiro':
        return { Icono: Store, texto: 'Retiro en tienda' }
      case 'delivery':
        return {
          Icono: Truck,
          texto: orden.users?.delivery_gratis
            ? 'Delivery (¡Gratis!)'
            : `Delivery (+$${orden.costo_envio_usd?.toFixed(2) || '8.00'})`,
        }
      case 'envio_nacional':
        return { Icono: Boxes, texto: `Envío Nac. (${orden.agencia_envio || 'N/A'})` }
      default:
        return { Icono: Package, texto: 'Sin especificar' }
    }
  }, [orden.tipo_envio, orden.costo_envio_usd, orden.agencia_envio, orden.users?.delivery_gratis])

  return (
    <div className="mo-card">
      <div className="mo-card__top">
        <div>
          <p className="mo-card__numero">Orden #{orden.id}</p>
          <p className="mo-card__fecha">{fecha}</p>
        </div>
        <span className={`mo-badge ${estadoBadge.clase}`}>{estadoBadge.label}</span>
      </div>

      <ProgresoOrden orden={orden} />

      <div className="mo-card__envio">
        <envioInfo.Icono size={16} />
        <span>{envioInfo.texto}</span>
      </div>

      {esAdmin && orden.users?.nombre && (
        <p className="mo-card__cliente">Cliente: <strong>{orden.users.nombre}</strong></p>
      )}

      <div className="mo-card__bottom">
        <p className="mo-card__total">
          Total: <span>${orden.total_usd.toFixed(2)}</span>
        </p>
        <button type="button" className="mo-card__ver-btn" onClick={() => onVerDetalle(orden)}>
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
  const navigate = useNavigate()
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
  // en las órdenes cargadas (legacy normalizados al set actual), ordenados
  // según el ciclo de vida (orden de ESTADOS_ORDEN en estadosOrden.js).
  const tabs = useMemo(() => {
    const estadosPresentes = [...new Set(ordenes.map((o) => normalizarEstado(o.estado)))]
    const ordenEtapas = Object.keys(ESTADOS_ORDEN).filter((id) => !ESTADOS_ORDEN[id].legacy)

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
        label: getEstadoBadge(estado).label,
        count: ordenes.filter((o) => normalizarEstado(o.estado) === estado).length,
      }))

    return [{ id: 'todos', label: 'Todos', count: ordenes.length }, ...tabsEstados]
  }, [ordenes])

  const ordenesFiltradas = useMemo(() => {
    if (filtroEstado === 'todos') return ordenes
    return ordenes.filter((o) => normalizarEstado(o.estado) === filtroEstado)
  }, [ordenes, filtroEstado])

  // Cuántas órdenes propias (no aplica a la vista admin) están esperando
  // pago o fueron rechazadas — para ofrecer el acceso directo a /pagos.
  const ordenesPendientesPago = useMemo(
    () => ordenes.filter((o) => o.forma_pago === 'contado' && ['esperando', 'rechazado'].includes(o.estado_pago)),
    [ordenes]
  )

  const titulo = user?.es_admin ? 'Todas las Órdenes' : 'Mis Órdenes'
  const subtitulo = user?.es_admin
    ? 'Seguimiento operativo de todos los pedidos de la plataforma'
    : 'Revisa el estado y el historial de tus pedidos'

  return (
    <LayoutPaginaPrincipal activo="ordenes" titulo={titulo} subtitulo={subtitulo}>
      <div className="mo-page">
        {error && <p className="mo-error">{error}</p>}

        {!user?.es_admin && ordenesPendientesPago.length > 0 && (
          <button type="button" className="mo-banner-pago" onClick={() => navigate('/pagos')}>
            <span>
              Tienes {ordenesPendientesPago.length}{' '}
              {ordenesPendientesPago.length === 1 ? 'orden pendiente de pago' : 'órdenes pendientes de pago'}
            </span>
            <span className="mo-banner-pago__cta">
              Gestionar pagos <ArrowRight size={15} />
            </span>
          </button>
        )}

        {!cargando && ordenes.length > 0 && (
          <div className="mo-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mo-tab ${filtroEstado === tab.id ? 'mo-tab--activo' : ''}`}
                onClick={() => setFiltroEstado(tab.id)}
              >
                {tab.label}
                <span className="mo-tab__count">{tab.count}</span>
              </button>
            ))}
          </div>
        )}

        {cargando ? (
          <div className="mo-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrdenCardSkeleton key={i} />
            ))}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="mo-vacio">
            <div className="mo-vacio__icon">
              <Package size={32} />
            </div>
            <h2>No tenés órdenes todavía</h2>
            <p>Cuando confirmes un pedido, aparecerá aquí.</p>
            <Link to="/catalogo" className="mo-vacio__cta">Ir al catálogo</Link>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <p className="mo-vacio-filtro">No hay órdenes con este estado.</p>
        ) : (
          <div className="mo-grid">
            {ordenesFiltradas.map((orden) => (
              <OrdenCard
                key={orden.id}
                orden={orden}
                esAdmin={user?.es_admin}
                onVerDetalle={() => navigate(`/orders/${orden.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default MisOrdenes
