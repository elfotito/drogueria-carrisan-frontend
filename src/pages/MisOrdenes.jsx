import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ArrowRight, User } from 'lucide-react'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { getEstadoConfig, getLabelEstado, normalizarEstado } from '../config/estadosOrden'
import './MisOrdenes.css'

// ---------------------------------------------------------------
// Mis Órdenes — dos niveles:
//   1. Grupos: Activos (pedido_creado, preparando, listo_para_retiro,
//      enviado) vs Historial (entregado, retirado, cancelado).
//   2. Dentro de cada grupo, pills de filtro sobre esas ordenes.
// "Pendiente de Pago" es una CONDICIÓN del pago (contado no verificado),
// no un order.status — por eso no vive en estadosOrden.js (ver la regla
// ORDER STATUS ≠ PAYMENT STATUS en el AGENTS raíz).
// ---------------------------------------------------------------

// Badge de estado. Labels vienen de la ÚNICA fuente de verdad
// (src/config/estadosOrden.js); la clase CSS local es solo un hook de
// presentación ligado al id del estado (normalizado para estados legacy).
function getEstadoBadge(estado) {
  const normalizado = normalizarEstado(estado)
  const cfg = getEstadoConfig(normalizado)
  if (!cfg) return { label: estado || 'Desconocido', clase: 'mo-badge--neutro' }
  return { label: getLabelEstado(normalizado, { rol: 'cliente' }), clase: `mo-badge--${normalizado}` }
}

// Estados que ya cerraron su ciclo: viven en la pestaña Historial.
const ESTADOS_HISTORIAL = new Set(['entregado', 'retirado', 'cancelado'])
const esHistorial = (orden) => ESTADOS_HISTORIAL.has(normalizarEstado(orden.estado))

// Contado cuya aprobación abrió la ventana de pago y todavía no se pagó.
// estado_pago: esperando / reportado / rechazado ⇒ pendiente; verificado
// (o NULL en crédito) ⇒ no aplica.
function requierePago(orden) {
  if (orden.forma_pago !== 'contado') return false
  const ep = orden.estado_pago
  return ep !== null && ep !== '' && ep !== 'verificado'
}

// Pills por grupo. El orden de definición es el orden de la UI y religa el
// ciclo de vida (todas la tests se evalúan sobre el estado NORMALIZADO).
const FILTROS_ACTIVOS = [
  { id: 'pedido_creado', label: 'Orden Creada', test: (o) => normalizarEstado(o.estado) === 'pedido_creado' },
  { id: 'pendiente_pago', label: 'Pendiente de Pago', test: requierePago },
  { id: 'preparando', label: 'Preparando', test: (o) => normalizarEstado(o.estado) === 'preparando' },
  { id: 'enviado', label: 'Enviados', test: (o) => normalizarEstado(o.estado) === 'enviado' },
  { id: 'listo_para_retiro', label: 'Listo para retiro', test: (o) => normalizarEstado(o.estado) === 'listo_para_retiro' },
]

const FILTROS_HISTORIAL = [
  { id: 'entregado', label: 'Entregados', test: (o) => ['entregado', 'retirado'].includes(normalizarEstado(o.estado)) },
  { id: 'cancelado', label: 'Cancelados', test: (o) => normalizarEstado(o.estado) === 'cancelado' },
]

const GRUPOS = [
  { id: 'activos', label: 'Activos', esDeGrupo: (o) => !esHistorial(o) },
  { id: 'historial', label: 'Historial', esDeGrupo: esHistorial },
]

function OrdenFilaSkeleton() {
  return (
    <div className="mo-fila mo-fila--skeleton">
      <div className="mo-fila__main">
        <div className="mo-skeleton-line mo-skeleton-line--numero" />
        <div className="mo-skeleton-line mo-skeleton-line--fecha" />
      </div>
      <div className="mo-fila__side">
        <div className="mo-skeleton-line mo-skeleton-line--total" />
        <div className="mo-skeleton-line mo-skeleton-line--btn" />
      </div>
    </div>
  )
}

function OrdenFila({ orden, esAdmin, onVerDetalle }) {
  const estadoBadge = getEstadoBadge(orden.estado)
  const fecha = new Date(orden.created_at).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const comprador = orden.sub_usuarios?.nombre

  return (
    <div className="mo-fila">
      <div className="mo-fila__main">
        <div className="mo-fila__id">
          <p className="mo-fila__numero">Orden #{orden.id}</p>
          <div className="mo-fila__badges">
            <span className={`mo-badge ${estadoBadge.clase}`}>{estadoBadge.label}</span>
            {requierePago(orden) && <span className="mo-badge mo-badge--pago">Pago pendiente</span>}
          </div>
        </div>
        <p className="mo-fila__fecha">{fecha}</p>

        {comprador && (
          <p className="mo-fila__comprador">
            <User size={13} />
            Realizado por: <strong>{comprador}</strong>
          </p>
        )}

        {esAdmin && orden.users?.nombre && (
          <p className="mo-fila__cliente">
            Cliente: <strong>{orden.users.nombre}</strong>
          </p>
        )}
      </div>

      <div className="mo-fila__side">
        <p className="mo-fila__total">
          {orden.total_usd?.toFixed(2) ? `$${orden.total_usd.toFixed(2)}` : '—'}
        </p>
        <button type="button" className="mo-fila__ver" onClick={() => onVerDetalle(orden)}>
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
  const [grupo, setGrupo] = useState('activos')
  const [filtro, setFiltro] = useState('todos')
  const navigate = useNavigate()
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

  // Cambiar de grupo resetea el filtro — cada tab trae sus propias pills.
  function cambiarGrupo(g) {
    setGrupo(g)
    setFiltro('todos')
  }

  const grupoActivo = GRUPOS.find((g) => g.id === grupo)

  const ordenesDelGrupo = useMemo(
    () => ordenes.filter((o) => grupoActivo.esDeGrupo(o)),
    [ordenes, grupoActivo]
  )

  const filtrosDelGrupo = grupo === 'activos' ? FILTROS_ACTIVOS : FILTROS_HISTORIAL

  const ordenesFiltradas = useMemo(() => {
    if (filtro === 'todos') return ordenesDelGrupo
    const f = filtrosDelGrupo.find((x) => x.id === filtro)
    return f ? ordenesDelGrupo.filter(f.test) : []
  }, [ordenesDelGrupo, filtro, filtrosDelGrupo])

  // Cuántas órdenes propias (no aplica a la vista admin) están esperando
  // pago o fueron rechazadas — para ofrecer el acceso directo a /pagos.
  const ordenesPendientesPago = useMemo(() => ordenes.filter(requierePago), [ordenes])

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

        {cargando ? (
          <div className="mo-lista">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrdenFilaSkeleton key={i} />
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
        ) : (
          <>
            <div className="mo-grupos">
              {GRUPOS.map((g) => {
                const conteo = ordenes.filter(g.esDeGrupo).length
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`mo-grupo ${grupo === g.id ? 'mo-grupo--activo' : ''}`}
                    onClick={() => cambiarGrupo(g.id)}
                  >
                    {g.label}
                    <span className="mo-grupo__count">{conteo}</span>
                  </button>
                )
              })}
            </div>

            {ordenesDelGrupo.length > 0 && (
              <div className="mo-filtros">
                <button
                  type="button"
                  className={`mo-filtro ${filtro === 'todos' ? 'mo-filtro--activo' : ''}`}
                  onClick={() => setFiltro('todos')}
                >
                  Todos
                  <span className="mo-filtro__count">{ordenesDelGrupo.length}</span>
                </button>
                {filtrosDelGrupo.map((f) => {
                  const conteo = ordenesDelGrupo.filter(f.test).length
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`mo-filtro ${filtro === f.id ? 'mo-filtro--activo' : ''}`}
                      onClick={() => setFiltro(f.id)}
                    >
                      {f.label}
                      <span className="mo-filtro__count">{conteo}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {ordenesDelGrupo.length === 0 ? (
              <p className="mo-vacio-filtro">
                {grupo === 'activos'
                  ? 'No tenés órdenes en curso por ahora.'
                  : 'Aún no tenés órdenes completadas.'}
              </p>
            ) : ordenesFiltradas.length === 0 ? (
              <p className="mo-vacio-filtro">No hay órdenes con este filtro.</p>
            ) : (
              <div className="mo-lista">
                {ordenesFiltradas.map((orden) => (
                  <OrdenFila
                    key={orden.id}
                    orden={orden}
                    esAdmin={user?.es_admin}
                    onVerDetalle={() => navigate(`/orders/${orden.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default MisOrdenes