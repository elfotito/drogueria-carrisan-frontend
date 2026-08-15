import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useFavoritos } from '../context/FavoritosContext'
import {
  Package, Wallet, MapPin, Star, Bell, CreditCard,
  ChevronRight, Loader2, AlertCircle, LogOut, Settings, ShieldCheck,
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

const ETIQUETAS_ENVIO = {
  delivery: 'Delivery',
  envio_nacional: 'Envío nacional',
  retiro: 'Retiro en tienda',
}

// Grid de categorías tipo "hub" (equivalente a la vista de escritorio de Amazon:
// Tus pedidos / Inicio de sesión / Amazon Prime / etc.)
const HUB_CUENTA = [
  { to: '/orders', icono: Package, titulo: 'Tus órdenes', descripcion: 'Rastrea, revisa el historial y descarga tus facturas' },
  { to: '/estado-cuenta', icono: Wallet, titulo: 'Estado de cuenta', descripcion: 'Consulta tu línea de crédito y tu deuda actual' },
  { to: '/direcciones', icono: MapPin, titulo: 'Direcciones', descripcion: 'Edita o agrega direcciones de entrega' },
  { to: '/mis-items', icono: Star, titulo: 'Mis items', descripcion: 'Productos y listas que has guardado' },
  { to: '/notificaciones', icono: Bell, titulo: 'Notificaciones', descripcion: 'Alertas y avisos de tu cuenta' },
  { to: '/pagos', icono: CreditCard, titulo: 'Pagos', descripcion: 'Métodos de pago y reportes de pago' },
]

// Columnas de links de texto (equivalente a la parte inferior de la vista de
// escritorio de Amazon: "Preferencias de pedidos", "Contenido digital", etc.)
const COLUMNAS_LINKS = [
  {
    titulo: 'Cuenta y seguridad',
    links: [
      { to: '/cuenta', texto: 'Editar perfil' },
      { to: '/direcciones', texto: 'Direcciones del usuario' },
    ],
  },
  {
    titulo: 'Compras',
    links: [
      { to: '/orders', texto: 'Mis órdenes' },
      { to: '/estado-cuenta', texto: 'Estado de cuenta' },
      { to: '/mis-items', texto: 'Mis items y favoritos' },
      { to: '/pagos', texto: 'Pagos' },
    ],
  },
  {
    titulo: 'Soporte',
    links: [
      { to: '/ayuda', texto: 'Centro de ayuda' },
      { to: '/faq', texto: 'Preguntas frecuentes' },
      { to: '/contacto', texto: 'Contáctanos' },
      { to: '/notificaciones', texto: 'Notificaciones' },
    ],
  },
  {
    titulo: 'Legal',
    links: [
      { to: '/terminos', texto: 'Términos y condiciones' },
      { to: '/privacidad', texto: 'Aviso de privacidad' },
    ],
  },
]

function MiCuenta() {
  const { user, logout } = useAuth()
  const { favoritos, loading: cargandoFav } = useFavoritos()
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ultimasOrdenes, setUltimasOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargarDatos() {
    try {
      const { data: dataCuenta } = await api.get(`/clientes/${user.id}/estado-cuenta`)
      setEstadoCuenta(dataCuenta)

      const { data: dataOrdenes } = await api.get('/orders')
      setUltimasOrdenes(dataOrdenes.slice(0, 3))
    } catch (err) {
      setError('No se pudieron cargar los datos de tu cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const previewFavoritos = (favoritos || []).slice(0, 4)

  return (
    <div className="mi-cuenta">
      <header className="mi-cuenta__header">
        <div className="mi-cuenta__header-info">
          <div className="mi-cuenta__avatar">{inicial}</div>
          <div>
            <h1>Hola, {user.nombre || 'Usuario'}</h1>
            <p className="mi-cuenta__email">{user.email}</p>
          </div>
        </div>
        <button type="button" className="mi-cuenta__logout" onClick={logout}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </header>

      {error && (
        <div className="mi-cuenta__alerta">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Bloques grandes con preview — equivalente a "Tus pedidos" /       */}
      {/* "Comprar otra vez" / "Listas" en la vista móvil de Amazon.        */}
      {/* En desktop, mi-cuenta__previews los pone lado a lado (ver CSS).   */}
      {/* ---------------------------------------------------------------- */}
      <div className="mi-cuenta__previews">
      <section className="bloque-preview">
        <div className="bloque-preview__header">
          <h2>Tus órdenes</h2>
          <Link to="/orders" className="bloque-preview__flecha" aria-label="Ver todas las órdenes">
            <ChevronRight size={20} />
          </Link>
        </div>

        {ultimasOrdenes.length === 0 ? (
          <div className="bloque-preview__vacio">
            <p>Parece que no tienes órdenes recientes</p>
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

      <section className="bloque-preview">
        <div className="bloque-preview__header">
          <h2>Estado de cuenta</h2>
          <Link to="/estado-cuenta" className="bloque-preview__flecha" aria-label="Ver estado de cuenta completo">
            <ChevronRight size={20} />
          </Link>
        </div>

        {resumen ? (
          <div className="franja-financiera">
            <div className="franja-financiera__item">
              <span className="franja-financiera__label">Línea de crédito</span>
              <strong>{formatearMonto(resumen.linea_credito)}</strong>
            </div>
            <div className="franja-financiera__item">
              <span className="franja-financiera__label">Deuda actual</span>
              <strong className={resumen.deuda_actual > 0 ? 'franja-financiera__monto--rojo' : ''}>
                {formatearMonto(resumen.deuda_actual)}
              </strong>
            </div>
            <Link to="/estado-cuenta" className="franja-financiera__item franja-financiera__item--cta">
              Ver detalle <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="bloque-preview__vacio">
            <p>No tienes información de crédito disponible todavía</p>
          </div>
        )}
      </section>

      <section className="bloque-preview">
        <div className="bloque-preview__header">
          <h2>Mis favoritos</h2>
          <Link to="/mis-items" className="bloque-preview__flecha" aria-label="Ver todos los favoritos">
            <ChevronRight size={20} />
          </Link>
        </div>

        {cargandoFav ? (
          <div className="bloque-preview__vacio">
            <Loader2 className="mi-cuenta__spinner" size={22} />
          </div>
        ) : previewFavoritos.length === 0 ? (
          <div className="bloque-preview__vacio">
            <p>Todavía no tienes productos guardados</p>
            <Link to="/catalogo" className="btn btn--primario">Explorar catálogo</Link>
          </div>
        ) : (
          <div className="favoritos-carrusel">
            {previewFavoritos.map((producto) => (
              <Link key={producto.id} to={`/producto/${producto.id}`} className="favorito-chip">
                <div className="favorito-chip__media">
                  {producto.foto_url ? (
                    <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
                  ) : (
                    <div className="favorito-chip__media-placeholder">Sin imagen</div>
                  )}
                </div>
                <span className="favorito-chip__nombre">{producto.nombre_comercial}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Grid de categorías tipo "hub" — equivalente a la vista de         */}
      {/* escritorio de Amazon (Tus pedidos / Inicio de sesión / Prime...)  */}
      {/* ---------------------------------------------------------------- */}
      <section className="hub-cuenta">
        <h2 className="hub-cuenta__titulo"><Settings size={18} /> Tu cuenta</h2>
        <div className="hub-cuenta__grid">
          {HUB_CUENTA.map(({ to, icono: Icono, titulo, descripcion }) => (
            <Link key={to} to={to} className="hub-card">
              <div className="hub-card__icono"><Icono size={22} /></div>
              <div className="hub-card__texto">
                <span className="hub-card__titulo">{titulo}</span>
                <span className="hub-card__descripcion">{descripcion}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Columnas de links de texto — equivalente a la sección inferior    */}
      {/* de la vista de escritorio de Amazon                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="columnas-links">
        {COLUMNAS_LINKS.map((columna) => (
          <div key={columna.titulo} className="columna-links">
            <h3>{columna.titulo}</h3>
            <ul>
              {columna.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.texto}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <div className="mi-cuenta__footer">
        <ShieldCheck size={14} />
        <span>Droguería Carrisán · Tu información está protegida</span>
      </div>

      <BottomNav />
    </div>
  )
}

export default MiCuenta