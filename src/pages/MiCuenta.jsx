import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import GestionDirecciones from '../components/GestionDirecciones'
import './MiCuenta.css'

function MiCuenta() {
  const { user } = useAuth()
  const [tabActiva, setTabActiva] = useState('resumen')
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ultimasOrdenes, setUltimasOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const { data: dataCuenta } = await api.get(`/clientes/${user.id}/estado-cuenta`)
      setEstadoCuenta(dataCuenta)

      const { data: dataOrdenes } = await api.get('/orders')
      setUltimasOrdenes(dataOrdenes.slice(0, 5))
    } catch (err) {
      setError('No se pudieron cargar los datos de tu cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return (
    <div className="cuenta-loading">
      <div className="spinner"></div>
      <p>Cargando tu cuenta...</p>
    </div>
  )

  return (
    <div className="mi-cuenta">
      {/* Header */}
      <div className="cuenta-header">
        <div className="cuenta-header__info">
          <div className="cuenta-avatar">
            {user.nombre?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1>¡Hola, {user.nombre || 'Usuario'}!</h1>
            <p className="cuenta-email">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="cuenta-tabs">
        <button 
          className={`cuenta-tab ${tabActiva === 'resumen' ? 'cuenta-tab--active' : ''}`}
          onClick={() => setTabActiva('resumen')}
        >
          📊 Resumen
        </button>
        <button 
          className={`cuenta-tab ${tabActiva === 'direcciones' ? 'cuenta-tab--active' : ''}`}
          onClick={() => setTabActiva('direcciones')}
        >
          📍 Direcciones
        </button>
        <button 
          className={`cuenta-tab ${tabActiva === 'ordenes' ? 'cuenta-tab--active' : ''}`}
          onClick={() => setTabActiva('ordenes')}
        >
          📋 Mis Órdenes
        </button>
      </div>

      {/* Contenido de tabs */}
      {tabActiva === 'resumen' && (
        <div className="cuenta-resumen">
          {error && <div className="cuenta-alert cuenta-alert--error">{error}</div>}

          {/* Tarjetas de resumen */}
          <div className="resumen-cards">
            <div className="resumen-card resumen-card--ordenes">
              <div className="resumen-card__icon">📦</div>
              <div className="resumen-card__info">
                <span className="resumen-card__label">Total Órdenes</span>
                <span className="resumen-card__valor">
                  {estadoCuenta?.resumen?.total_facturado ? 'Activo' : 'Sin datos'}
                </span>
              </div>
              <Link to="/orders" className="resumen-card__link">Ver todas →</Link>
            </div>

            <div className="resumen-card resumen-card--credito">
              <div className="resumen-card__icon">💰</div>
              <div className="resumen-card__info">
                <span className="resumen-card__label">Línea de Crédito</span>
                <span className="resumen-card__valor">
                  ${estadoCuenta?.cliente?.linea_credito?.toFixed(2) || '0.00'}
                </span>
              </div>
              <Link to="/estado-cuenta" className="resumen-card__link">Ver detalle →</Link>
            </div>

            <div className={`resumen-card ${estadoCuenta?.resumen?.deuda_actual > 0 ? 'resumen-card--deuda' : 'resumen-card--aldea'}`}>
              <div className="resumen-card__icon">📊</div>
              <div className="resumen-card__info">
                <span className="resumen-card__label">Deuda Actual</span>
                <span className="resumen-card__valor">
                  ${estadoCuenta?.resumen?.deuda_actual?.toFixed(2) || '0.00'}
                </span>
              </div>
              <Link to="/estado-cuenta" className="resumen-card__link">Ver estado →</Link>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="accesos-rapidos">
            <h2>Accesos Rápidos</h2>
            <div className="accesos-grid">
              <Link to="/catalogo" className="acceso-item">
                <span className="acceso-item__icon">🛍️</span>
                <span className="acceso-item__texto">Catálogo</span>
              </Link>
              <Link to="/carrito" className="acceso-item">
                <span className="acceso-item__icon">🛒</span>
                <span className="acceso-item__texto">Carrito</span>
              </Link>
              <Link to="/mis-items" className="acceso-item">
                <span className="acceso-item__icon">⭐</span>
                <span className="acceso-item__texto">Mis Items</span>
              </Link>
              <Link to="/notificaciones" className="acceso-item">
                <span className="acceso-item__icon">🔔</span>
                <span className="acceso-item__texto">Notificaciones</span>
              </Link>
            </div>
          </div>

          {/* Últimas órdenes */}
          <div className="ultimas-ordenes">
            <div className="ultimas-ordenes__header">
              <h2>Últimas Órdenes</h2>
              <Link to="/orders" className="ver-todas">Ver todas →</Link>
            </div>
            
            {ultimasOrdenes.length === 0 ? (
              <div className="empty-state">
                <span>📋</span>
                <p>Aún no tienes órdenes</p>
                <Link to="/catalogo" className="btn-primary">Ir al catálogo</Link>
              </div>
            ) : (
              <div className="ordenes-table-wrapper">
                <table className="ordenes-table">
                  <thead>
                    <tr>
                      <th>Orden #</th>
                      <th>Tipo</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasOrdenes.map(orden => (
                      <tr key={orden.id}>
                        <td>
                          <Link to={`/orders/${orden.id}`} className="orden-link">
                            #{orden.id}
                          </Link>
                        </td>
                        <td>
                          {orden.tipo_envio === 'delivery' && '🛵 Delivery'}
                          {orden.tipo_envio === 'envio_nacional' && '📦 Envío Nac.'}
                          {(!orden.tipo_envio || orden.tipo_envio === 'retiro') && '🏪 Retiro'}
                        </td>
                        <td>${Number(orden.total_usd).toFixed(2)}</td>
                        <td>
                          <span className={`estado-badge estado-${orden.estado}`}>
                            {orden.estado}
                          </span>
                        </td>
                        <td>{new Date(orden.created_at).toLocaleDateString('es-VE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tabActiva === 'direcciones' && (
        <GestionDirecciones />
      )}

      {tabActiva === 'ordenes' && (
        <div className="cuenta-ordenes">
          <h2>Todas mis órdenes</h2>
          <Link to="/orders" className="btn-primary">Ver todas las órdenes →</Link>
        </div>
      )}
    </div>
  )
}

export default MiCuenta