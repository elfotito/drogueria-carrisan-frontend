import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Package, Wallet, MapPin, Star, Bell, ShoppingBag, ShoppingCart,
  ChevronRight, Loader2, AlertCircle
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import './MiCuenta.css'

// Dependencia: npm install lucide-react (la misma que usa EstadoCuenta.jsx)

function formatearMonto(valor) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Secciones de la cuenta: cada una es una tarjeta que enlaza a su propia página,
// al estilo del "Account overview" de Walmart/Amazon.
// OJO: revisa que la ruta /direcciones exista — en el código anterior
// <GestionDirecciones /> se mostraba embebido en un tab, no en una página propia.
// Si aún no tienes esa ruta, créala montando ese mismo componente ahí,
// o cambia el "to" por la ruta que corresponda.
const SECCIONES_CUENTA = [
  { to: '/orders', icono: Package, titulo: 'Mis órdenes', descripcion: 'Historial completo de tus compras' },
  { to: '/estado-cuenta', icono: Wallet, titulo: 'Estado de cuenta', descripcion: 'Crédito, deuda y facturas' },
  { to: '/direcciones', icono: MapPin, titulo: 'Direcciones', descripcion: 'Gestiona tus direcciones de entrega' },
  { to: '/mis-items', icono: Star, titulo: 'Mis items', descripcion: 'Productos guardados y favoritos' },
  { to: '/notificaciones', icono: Bell, titulo: 'Notificaciones', descripcion: 'Alertas y avisos de tu cuenta' },
]

const ACCESOS_RAPIDOS = [
  { to: '/catalogo', icono: ShoppingBag, texto: 'Catálogo' },
  { to: '/carrito', icono: ShoppingCart, texto: 'Carrito' },
]

const ETIQUETAS_ENVIO = {
  delivery: 'Delivery',
  envio_nacional: 'Envío nacional',
  retiro: 'Retiro en tienda',
}

function MiCuenta() {
  const { user } = useAuth()
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ultimasOrdenes, setUltimasOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (cargando) {
    return (
      <div className="mi-cuenta__cargando">
        <Loader2 className="mi-cuenta__spinner" size={28} />
        <p>Cargando tu cuenta…</p>
      </div>
    )
  }

  const resumen = estadoCuenta?.resumen
  const inicial = (user.nombre || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="mi-cuenta">
      <header className="mi-cuenta__header">
        <div className="mi-cuenta__avatar">{inicial}</div>
        <div>
          <h1>¡Hola, {user.nombre || 'Usuario'}!</h1>
          <p className="mi-cuenta__email">{user.email}</p>
        </div>
      </header>

      {error && (
        <div className="mi-cuenta__alerta">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {resumen && (
        <div className="franja-financiera">
          <Link to="/estado-cuenta" className="franja-financiera__item">
            <span className="franja-financiera__label">Línea de crédito</span>
            <strong>{formatearMonto(resumen.linea_credito)}</strong>
          </Link>
          <Link to="/estado-cuenta" className="franja-financiera__item">
            <span className="franja-financiera__label">Deuda actual</span>
            <strong className={resumen.deuda_actual > 0 ? 'franja-financiera__monto--rojo' : ''}>
              {formatearMonto(resumen.deuda_actual)}
            </strong>
          </Link>
          <Link to="/estado-cuenta" className="franja-financiera__item franja-financiera__item--cta">
            Ver estado de cuenta <ChevronRight size={16} />
          </Link>
        </div>
      )}

      <div className="accesos-rapidos">
        {ACCESOS_RAPIDOS.map(({ to, icono: Icono, texto }) => (
          <Link key={to} to={to} className="accesos-rapidos__item">
            <Icono size={18} /> {texto}
          </Link>
        ))}
      </div>

      <section className="secciones-cuenta">
        <h2>Tu cuenta</h2>
        <div className="secciones-cuenta__grid">
          {SECCIONES_CUENTA.map(({ to, icono: Icono, titulo, descripcion }) => (
            <Link key={to} to={to} className="seccion-card">
              <div className="seccion-card__icono"><Icono size={22} /></div>
              <div className="seccion-card__texto">
                <span className="seccion-card__titulo">{titulo}</span>
                <span className="seccion-card__descripcion">{descripcion}</span>
              </div>
              <ChevronRight size={18} className="seccion-card__flecha" />
            </Link>
          ))}
        </div>
      </section>

      <section className="ultimas-ordenes">
        <div className="ultimas-ordenes__header">
          <h2>Últimas órdenes</h2>
          <Link to="/orders" className="ver-todas">Ver todas <ChevronRight size={14} /></Link>
        </div>

        {ultimasOrdenes.length === 0 ? (
          <div className="estado-vacio">
            <Package size={32} />
            <p>Aún no tienes órdenes</p>
            <Link to="/catalogo" className="btn btn--primario">Ir al catálogo</Link>
          </div>
        ) : (
          <ul className="ordenes-lista">
            {ultimasOrdenes.map(orden => (
              <li key={orden.id}>
                <Link to={`/orders/${orden.id}`} className="orden-card">
                  <div className="orden-card__icono"><Package size={18} /></div>
                  <div className="orden-card__info">
                    <span className="orden-card__titulo">Orden #{orden.id}</span>
                    <span className="orden-card__meta">
                      {ETIQUETAS_ENVIO[orden.tipo_envio] || ETIQUETAS_ENVIO.retiro}
                      {' · '}{formatearFecha(orden.created_at)}
                    </span>
                  </div>
                  <span className={`estado-badge estado-badge--${orden.estado}`}>{orden.estado}</span>
                  <strong className="orden-card__monto">{formatearMonto(orden.total_usd)}</strong>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <BottomNav />
    </div>
  )
}

export default MiCuenta