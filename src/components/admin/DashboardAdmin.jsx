import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import OrdenDetalleModal from '../OrdenDetalleModal'
import './DashboardAdmin.css'

const ESTADOS = ['pedido_creado', 'procesando', 'preparando', 'enviado', 'entregado', 'cancelado']

const ESTADO_COLORES = {
  pedido_creado: { color: '#f59e0b', bg: '#fef3c7', label: 'Pedido Creado' },
  procesando: { color: '#3b82f6', bg: '#dbeafe', label: 'Procesando' },
  preparando: { color: '#8b5cf6', bg: '#ede9fe', label: 'Preparando' },
  enviado: { color: '#06b6d4', bg: '#cffafe', label: 'Enviado' },
  entregado: { color: '#10b981', bg: '#d1fae5', label: 'Entregado' },
  cancelado: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelado' }
}

// Estados que todavía requieren acción del admin (aún no salió ni se entregó)
const ESTADOS_PENDIENTES_ACCION = ['pedido_creado', 'procesando', 'preparando']

function formatUSD(valor) {
  return `$${Number(valor || 0).toFixed(2)}`
}

function tiempoRelativo(fechaISO) {
  const fecha = new Date(fechaISO)
  const diffMs = Date.now() - fecha.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'hace un momento'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHoras = Math.floor(diffMin / 60)
  if (diffHoras < 24) return `hace ${diffHoras} h`
  const diffDias = Math.floor(diffHoras / 24)
  if (diffDias === 1) return 'ayer'
  if (diffDias < 7) return `hace ${diffDias} días`
  return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })
}

function DashboardAdmin({ onIrA }) {
  const [ordenes, setOrdenes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setCargando(true)
      setError('')
      const [ordenesRes, usuariosRes, clientesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/users'),
        api.get('/clientes/estado-cuenta')
      ])
      setOrdenes(ordenesRes.data)
      setUsuarios(usuariosRes.data)
      setClientes(clientesRes.data)
    } catch (err) {
      setError('No se pudo cargar el resumen del panel')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function handleCambiarEstado(ordenId, nuevoEstado) {
    try {
      await api.patch(`/orders/${ordenId}/estado`, { estado: nuevoEstado })
      setOrdenes((prev) =>
        prev.map((o) => (o.id === ordenId ? { ...o, estado: nuevoEstado } : o))
      )
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
  }

  const kpis = useMemo(() => {
    const hoy = new Date()
    const esDelMes = (fechaISO) => {
      const f = new Date(fechaISO)
      return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth()
    }

    const pendientesAccion = ordenes.filter(o => ESTADOS_PENDIENTES_ACCION.includes(o.estado)).length

    const ventasMes = ordenes
      .filter(o => o.estado !== 'cancelado' && esDelMes(o.created_at))
      .reduce((sum, o) => sum + Number(o.total_usd), 0)

    const cuentasPorCobrar = clientes.reduce(
      (sum, c) => sum + (c.deuda_actual > 0 ? Number(c.deuda_actual) : 0),
      0
    )

    const clientesActivos = usuarios.filter(u => !u.es_admin).length

    return { pendientesAccion, ventasMes, cuentasPorCobrar, clientesActivos }
  }, [ordenes, usuarios, clientes])

  const distribucionEstados = useMemo(() => {
    return ESTADOS.map(estado => ({
      estado,
      cantidad: ordenes.filter(o => o.estado === estado).length,
      ...ESTADO_COLORES[estado]
    }))
  }, [ordenes])

  const totalOrdenes = ordenes.length || 1 // evita división por cero en las barras

  const ordenesRecientes = useMemo(() => {
    return [...ordenes]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6)
  }, [ordenes])

  const clientesRecientes = useMemo(() => {
    return [...usuarios]
      .filter(u => !u.es_admin)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  }, [usuarios])

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando resumen...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dash-error">
        <p>{error}</p>
        <button onClick={cargarDatos} className="btn-primary">Reintentar</button>
      </div>
    )
  }

  return (
    <div className="dash-container">
      <div className="section-header">
        <h2>Resumen</h2>
        <p className="section-description">Un vistazo general al estado de la tienda</p>
      </div>

      {/* KPIs */}
      <div className="dash-kpis">
        <button className="dash-kpi" onClick={() => onIrA?.('ordenes')}>
          <span className="dash-kpi-icon dash-kpi-icon--warn">⏳</span>
          <div className="dash-kpi-info">
            <span className="dash-kpi-valor">{kpis.pendientesAccion}</span>
            <span className="dash-kpi-label">Órdenes por atender</span>
          </div>
        </button>

        <div className="dash-kpi dash-kpi--static">
          <span className="dash-kpi-icon dash-kpi-icon--good">💵</span>
          <div className="dash-kpi-info">
            <span className="dash-kpi-valor">{formatUSD(kpis.ventasMes)}</span>
            <span className="dash-kpi-label">Ventas del mes</span>
          </div>
        </div>

        <button className="dash-kpi" onClick={() => onIrA?.('estadoCuenta')}>
          <span className="dash-kpi-icon dash-kpi-icon--alert">🏦</span>
          <div className="dash-kpi-info">
            <span className="dash-kpi-valor">{formatUSD(kpis.cuentasPorCobrar)}</span>
            <span className="dash-kpi-label">Cuentas por cobrar</span>
          </div>
        </button>

        <button className="dash-kpi" onClick={() => onIrA?.('usuarios')}>
          <span className="dash-kpi-icon dash-kpi-icon--blue">👤</span>
          <div className="dash-kpi-info">
            <span className="dash-kpi-valor">{kpis.clientesActivos}</span>
            <span className="dash-kpi-label">Clientes activos</span>
          </div>
        </button>
      </div>

      {/* Distribución de órdenes por estado */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h3>Órdenes por estado</h3>
          <span className="dash-card-total">{ordenes.length} en total</span>
        </div>
        <div className="dash-distribucion">
          {distribucionEstados.map(({ estado, cantidad, color, label }) => (
            <div key={estado} className="dash-distribucion-fila">
              <span className="dash-distribucion-label">
                <span className="dash-dot" style={{ background: color }}></span>
                {label}
              </span>
              <div className="dash-distribucion-barra">
                <div
                  className="dash-distribucion-relleno"
                  style={{ width: `${(cantidad / totalOrdenes) * 100}%`, background: color }}
                ></div>
              </div>
              <span className="dash-distribucion-cantidad">{cantidad}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-columnas">
        {/* Órdenes recientes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Órdenes recientes</h3>
            <button className="dash-ver-todas" onClick={() => onIrA?.('ordenes')}>
              Ver todas →
            </button>
          </div>
          {ordenesRecientes.length === 0 ? (
            <p className="dash-vacio">Todavía no hay órdenes registradas.</p>
          ) : (
            <ul className="dash-lista">
              {ordenesRecientes.map(orden => (
                <li key={orden.id}>
                  <button
                    className="dash-orden-fila"
                    onClick={() => setOrdenSeleccionada(orden)}
                  >
                    <div className="dash-orden-info">
                      <span className="dash-orden-id">#{orden.id}</span>
                      <span className="dash-orden-cliente">{orden.users?.nombre || 'Cliente'}</span>
                    </div>
                    <div className="dash-orden-meta">
                      <span
                        className="dash-estado-badge"
                        style={{
                          backgroundColor: ESTADO_COLORES[orden.estado]?.bg,
                          color: ESTADO_COLORES[orden.estado]?.color
                        }}
                      >
                        {ESTADO_COLORES[orden.estado]?.label || orden.estado}
                      </span>
                      <span className="dash-orden-total">{formatUSD(orden.total_usd)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clientes nuevos */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3>Clientes nuevos</h3>
            <button className="dash-ver-todas" onClick={() => onIrA?.('usuarios')}>
              Ver todos →
            </button>
          </div>
          {clientesRecientes.length === 0 ? (
            <p className="dash-vacio">Todavía no hay clientes registrados.</p>
          ) : (
            <ul className="dash-lista">
              {clientesRecientes.map(cliente => (
                <li key={cliente.id} className="dash-cliente-fila">
                  <span className="dash-cliente-avatar">
                    {cliente.nombre?.[0]?.toUpperCase() || 'C'}
                  </span>
                  <div className="dash-cliente-info">
                    <span className="dash-cliente-nombre">{cliente.nombre}</span>
                    <span className="dash-cliente-email">{cliente.email}</span>
                  </div>
                  <span className="dash-cliente-fecha">{tiempoRelativo(cliente.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <OrdenDetalleModal
        orden={ordenSeleccionada}
        onClose={() => setOrdenSeleccionada(null)}
        onCambiarEstado={handleCambiarEstado}
        estados={ESTADOS}
        estadoColores={ESTADO_COLORES}
      />
    </div>
  )
}

export default DashboardAdmin