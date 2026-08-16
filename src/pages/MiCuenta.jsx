import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useFavoritos } from '../context/FavoritosContext'
import {
  Package, Wallet, MapPin, Star, Bell, CreditCard, HelpCircle,
  ChevronRight, Loader2, AlertCircle, LogOut, Settings, ShieldCheck, X,
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

// Config visual + reseña de cada estado de orden (mismos ids que MisOrdenes.jsx:
// pedido_creado, procesando, preparando, enviado, entregado, cancelado)
const ESTADOS_ORDEN = {
  pedido_creado: { label: 'Pedido creado', color: '#6b6b7a', bg: '#f1f1ea', resena: 'Esperando confirmación de pago' },
  procesando: { label: 'Procesando', color: '#d97706', bg: '#fff7ed', resena: 'Verificando tu pago' },
  preparando: { label: 'Preparando', color: '#0052DC', bg: '#eaf0ff', resena: 'Preparando la orden para despacho' },
  enviado: { label: 'Enviado', color: '#12A594', bg: '#e7f8f5', resena: 'En camino a tu dirección' },
  entregado: { label: 'Entregado', color: '#15803d', bg: '#f0fdf4', resena: 'Orden lista para retiro' },
  cancelado: { label: 'Cancelado', color: '#dc2626', bg: '#fef2f2', resena: 'Esta orden fue cancelada' },
}

function getEstadoOrden(estado) {
  return ESTADOS_ORDEN[estado] || { label: estado, color: '#6b6b7a', bg: '#f1f1ea', resena: '' }
}

// Pills de acceso rápido — carrusel horizontal, enlaces más usados
const ACCESOS_RAPIDOS = [
  { to: '/mis-items', icono: Star, texto: 'Mis items' },
  { to: '/orders', icono: Package, texto: 'Mis órdenes' },
  { to: '/estado-cuenta', icono: Wallet, texto: 'Estado de cuenta' },
  { to: '/pagos', icono: CreditCard, texto: 'Pagar orden' },
  { to: '/direcciones', icono: MapPin, texto: 'Direcciones' },
  { to: '/ayuda', icono: HelpCircle, texto: 'Ayuda' },
]

// Grid de categorías tipo "hub" (equivalente a la vista de escritorio de Amazon:
// Tus pedidos / Inicio de sesión / Amazon Prime / etc.) — se usa en desktop
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

// ---------------------------------------------------------
// MiniOrdenCard — tarjeta compacta para el carrusel de "Tus pedidos",
// estilo la referencia de envíos (imagen 3): icono, destino/id, badge de
// estado a la derecha, reseña breve, y flecha "›" sobre círculo oscuro
// que indica que toda la tarjeta es clickeable hacia el detalle.
// ---------------------------------------------------------
function MiniOrdenCard({ orden }) {
  const estado = getEstadoOrden(orden.estado)
  return (
    <Link to={`/orders/${orden.id}`} className="mini-orden-card">
      <div className="mini-orden-card__top">
        <div className="mini-orden-card__icono">
          <Package size={18} />
        </div>
        <div className="mini-orden-card__info">
          <span className="mini-orden-card__titulo">Orden #{orden.id}</span>
          <span className="mini-orden-card__meta">
            {ETIQUETAS_ENVIO[orden.tipo_envio] || ETIQUETAS_ENVIO.retiro}
          </span>
        </div>
        <span
          className="mini-orden-card__badge"
          style={{ color: estado.color, background: estado.bg }}
        >
          {estado.label}
        </span>
      </div>

      <div className="mini-orden-card__bottom">
        <div className="mini-orden-card__texto">
          <span className="mini-orden-card__resena">{estado.resena}</span>
          <span className="mini-orden-card__monto">{formatearMonto(orden.total_usd)}</span>
        </div>
        <span className="mini-orden-card__flecha">
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  )
}

function MiCuenta() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { favoritos, loading: cargandoFav } = useFavoritos()
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ultimasOrdenes, setUltimasOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [confirmandoLogout, setConfirmandoLogout] = useState(false)

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
  const pedidosPendientes = ultimasOrdenes.filter(
    (o) => o.estado && !['entregado', 'cancelado'].includes(o.estado)
  ).length

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
        <div className="mi-cuenta__header-acciones">
          <Link to="/notificaciones" className="mi-cuenta__icono-btn" aria-label="Notificaciones">
            <Bell size={20} />
          </Link>
          <button
            type="button"
            className="mi-cuenta__icono-btn"
            aria-label="Cerrar sesión"
            onClick={() => setConfirmandoLogout(true)}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {confirmandoLogout && (
        <div className="modal-overlay" onClick={() => setConfirmandoLogout(false)}>
          <div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-confirmar__cerrar"
              aria-label="Cerrar"
              onClick={() => setConfirmandoLogout(false)}
            >
              <X size={16} />
            </button>
            <h3>¿Cerrar sesión?</h3>
            <p>Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.</p>
            <div className="modal-confirmar__acciones">
              <button
                type="button"
                className="btn btn--secundario"
                onClick={() => setConfirmandoLogout(false)}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn--peligro" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mi-cuenta__alerta">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Pills de acceso rápido — carrusel horizontal con los enlaces      */}
      {/* más usados de la cuenta                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="accesos-rapidos">
        {ACCESOS_RAPIDOS.map(({ to, icono: Icono, texto }) => (
          <Link key={to} to={to} className="accesos-rapidos__item">
            <Icono size={16} /> {texto}
          </Link>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Resumen financiero — carrusel de mini estadísticas                */}
      {/* ---------------------------------------------------------------- */}
      <section className="resumen-financiero">
        <h2 className="resumen-financiero__titulo">Resumen Financiero</h2>
        <div className="resumen-financiero__carrusel">
          <Link to="/estado-cuenta" className="stat-card">
            <span className="stat-card__label">Línea de crédito</span>
            <strong className="stat-card__valor">{formatearMonto(resumen?.linea_credito)}</strong>
          </Link>
          <Link to="/estado-cuenta" className="stat-card">
            <span className="stat-card__label">Deuda actual</span>
            <strong className={`stat-card__valor ${resumen?.deuda_actual > 0 ? 'stat-card__valor--rojo' : ''}`}>
              {formatearMonto(resumen?.deuda_actual)}
            </strong>
          </Link>
          <Link to="/orders" className="stat-card">
            <span className="stat-card__label">Pedidos pendientes</span>
            <strong className="stat-card__valor">{pedidosPendientes}</strong>
          </Link>
          <Link to="/mis-items" className="stat-card">
            <span className="stat-card__label">Favoritos guardados</span>
            <strong className="stat-card__valor">{(favoritos || []).length}</strong>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Tus pedidos — título + flecha (estilo Amazon), carrusel de        */}
      {/* MiniOrdenCard sin bordes ni fondo propio                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="seccion-pedidos">
        <div className="seccion-pedidos__header">
          <h2>Tus pedidos</h2>
          <Link to="/orders" className="seccion-pedidos__flecha" aria-label="Ver todos los pedidos">
            <ChevronRight size={20} />
          </Link>
        </div>

        {ultimasOrdenes.length === 0 ? (
          <div className="bloque-preview__vacio">
            <p>Parece que no tienes pedidos recientes</p>
            <Link to="/catalogo" className="btn btn--primario">Ir al catálogo</Link>
          </div>
        ) : (
          <div className="mini-ordenes-carrusel">
            {ultimasOrdenes.map((orden) => (
              <MiniOrdenCard key={orden.id} orden={orden} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Grid de categorías tipo "hub" — solo visible en escritorio,       */}
      {/* equivalente a la vista de Amazon (Tus pedidos / Prime / etc.)     */}
      {/* ---------------------------------------------------------------- */}
      <section className="hub-cuenta hub-cuenta--desktop">
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
      {/* Columnas de links de texto — solo visible en escritorio           */}
      {/* ---------------------------------------------------------------- */}
      <section className="columnas-links columnas-links--desktop">
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

      {/* ---------------------------------------------------------------- */}
      {/* ¿Necesitas ayuda? — cierre de la página, enlaza a contacto        */}
      {/* ---------------------------------------------------------------- */}
      <Link to="/contacto" className="ayuda-footer">
        <span>¿Necesitas ayuda? Contacta con nosotros</span>
        <ChevronRight size={18} />
      </Link>

      <div className="mi-cuenta__footer">
        <ShieldCheck size={14} />
        <span>Droguería Carrisán · Tu información está protegida</span>
      </div>

      <BottomNav />
    </div>
  )
}

export default MiCuenta
