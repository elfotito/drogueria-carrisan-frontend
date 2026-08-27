import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Progress, Switch } from '@chakra-ui/react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useFavoritos } from '../context/FavoritosContext'
import { usePush } from '../hooks/usePush'
import { CATEGORIAS } from '../utils/notificacionesCatalogo'
import {
  Package, ChevronRight, ChevronDown, Loader2, AlertCircle,
  MessageCircle, ShieldCheck, Wallet, Bell, LogOut, Settings, X, Lock, Scale,
} from 'lucide-react'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import BannerOnboarding from '../components/BannerOnboarding'
import { NAV_UNIFICADO } from '../components/paginas-principales/NavUnificado'
import './MiCuenta.css'
import '../components/HojaInferior.jsx'

// ---------------------------------------------------------------
// Mi Cuenta — dashboard visual de la cuenta.
//
// Antes esta página era básicamente navegación repetida (accesos
// rápidos + grid "Tu cuenta" + columnas de links) — todo eso ya lo
// resuelve el sidebar/drawer de <LayoutPaginaPrincipal>. Ahora esta
// página se enfoca en lo que el sidebar NO puede mostrar: información
// real de la cuenta en bloques visuales (crédito, pedidos activos,
// gasto mensual, favoritos).
// ---------------------------------------------------------------

function formatearMonto(valor) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valor || 0)
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

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Últimos 6 meses (incluyendo el actual) con el total gastado en cada uno,
// para el gráfico de barras — meses sin compras quedan en $0, no se omiten.
function calcularGastoMensual(ordenes) {
  const hoy = new Date()
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    meses.push({ anio: fecha.getFullYear(), mes: fecha.getMonth(), label: MESES_CORTOS[fecha.getMonth()], total: 0 })
  }
  ordenes.forEach((orden) => {
    if (!orden.created_at || orden.estado === 'cancelado') return
    const fecha = new Date(orden.created_at)
    const punto = meses.find((m) => m.anio === fecha.getFullYear() && m.mes === fecha.getMonth())
    if (punto) punto.total += orden.total_usd || 0
  })
  return meses
}

// Distribución por estado de las órdenes que todavía están "en curso"
// (ni entregadas ni canceladas) — para la barra apilada de "Pedidos activos".
const ORDEN_ETAPAS = ['pedido_creado', 'procesando', 'preparando', 'enviado']

function calcularPedidosActivos(ordenes) {
  const activas = ordenes.filter((o) => !['entregado', 'cancelado'].includes(o.estado))
  const conteos = ORDEN_ETAPAS.map((estado) => ({
    estado,
    ...getEstadoOrden(estado),
    cantidad: activas.filter((o) => o.estado === estado).length,
  })).filter((e) => e.cantidad > 0)
  return { total: activas.length, conteos }
}

// ---------------------------------------------------------
// Hoja inferior genérica (bottom sheet) — overlay + tarjeta que sube
// desde abajo en móvil, centrada en desktop. Vía portal directo a
// document.body por la misma razón que el modal de MisItems: así
// nunca queda atrapada dentro de .ppal-shift mientras el drawer del
// sidebar está transicionando (overflow:hidden / transform).
//
// Se usa para "Tu cuenta" (selector estilo Amazon) y "Permisos y
// notificaciones" — si en el futuro aparece un tercer lugar que
// necesite este mismo patrón, conviene moverlo a un archivo propio
// dentro de components/.
// ---------------------------------------------------------
function HojaInferior({ titulo, onCerrar, children }) {
  return createPortal(
    <div className="hoja-inferior-overlay" onClick={onCerrar}>
      <div className="hoja-inferior" onClick={(e) => e.stopPropagation()}>
        <div className="hoja-inferior__manija" />
        <div className="hoja-inferior__header">
          <h3>{titulo}</h3>
          <button type="button" className="hoja-inferior__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="hoja-inferior__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------
// Contenido de "Tu cuenta" — selector estilo Amazon (imagen de
// referencia): usuario + "Ver", Reiniciar Contraseña, y abajo
// Cambiar cuenta / Cerrar sesión.
// ---------------------------------------------------------
function ContenidoModalCuenta({ user, inicial, onCerrar, onCambiarCuenta, onCerrarSesion }) {
  return (
    <>
      <div className="modal-cuenta__usuario">
        <div className="mi-cuenta__avatar mi-cuenta__avatar--sm">{inicial}</div>
        <div className="modal-cuenta__usuario-texto">
          <span className="modal-cuenta__usuario-nombre">{user.nombre || 'Usuario'}</span>
          <span className="modal-cuenta__usuario-rol">Titular de la cuenta</span>
        </div>
        <button type="button" className="modal-cuenta__ver" onClick={onCerrar}>Ver</button>
      </div>

      <div className="modal-cuenta__fila modal-cuenta__fila--proximamente">
        <span>Reiniciar Contraseña</span>
        <span className="etiqueta-proximamente">Próximamente</span>
      </div>

      <div className="modal-cuenta__separador" />

      <p className="modal-cuenta__sesion-como">Sesión iniciada como {user.email}</p>

      <button type="button" className="modal-cuenta__cambiar-btn" onClick={onCambiarCuenta}>
        Cambiar cuenta
      </button>

      <button type="button" className="modal-cuenta__cerrar-sesion" onClick={onCerrarSesion}>
        Cerrar sesión
      </button>
    </>
  )
}

// ---------------------------------------------------------
// Contenido de "Permisos y notificaciones" — toggle principal
// de push + toggles por categoría de notificación.
// ---------------------------------------------------------
function ContenidoModalPermisos() {
  const { soportado, suscrito, permiso, pidiendoPermiso, error, activar, desactivar } = usePush()
  const [prefs, setPrefs] = useState(null)
  const [guardando, setGuardando] = useState('')

  const permisoBloqueado = permiso === 'denied'

  useEffect(() => {
    api.get('/notifications/preferences')
      .then(({ data }) => setPrefs(data))
      .catch(() => setPrefs({
        push_activo: true, push_ordenes: true, push_pagos: true,
        push_chat: true, push_credito: true, push_sistema: true, push_ofertas: true,
      }))
  }, [])

  function handleTogglePush() {
    if (pidiendoPermiso || permisoBloqueado) return
    if (suscrito) {
      desactivar()
    } else {
      activar()
    }
  }

  async function handleToggleCategoria(campo) {
    if (!prefs) return
    const nuevo = !prefs[campo]
    const actualizadas = { ...prefs, [campo]: nuevo }
    setPrefs(actualizadas)
    setGuardando(campo)
    try {
      await api.put('/notifications/preferences', { [campo]: nuevo })
    } catch {
      setPrefs(prev => ({ ...prev, [campo]: !nuevo }))
    } finally {
      setGuardando('')
    }
  }

  return (
    <>
      <div className="modal-permisos__fila">
        <div className="modal-permisos__fila-texto">
          <span className="modal-permisos__fila-titulo">Avisos y notificaciones</span>
          <span className="modal-permisos__fila-descripcion">
            {!soportado
              ? 'Tu navegador no soporta notificaciones push'
              : permisoBloqueado
                ? 'Las notificaciones están bloqueadas en la configuración del navegador'
                : suscrito
                  ? 'Recibís avisos push de tu cuenta'
                  : 'Activá para recibir avisos importantes de tu cuenta'}
          </span>
        </div>
        <Switch.Root
          checked={!!suscrito}
          disabled={!soportado || permisoBloqueado || pidiendoPermiso}
          size="md"
          onCheckedChange={handleTogglePush}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </div>

      {pidiendoPermiso && (
        <div className="modal-permisos__fila">
          <Loader2 size={15} className="mi-cuenta__spinner" />
          <span className="modal-permisos__fila-descripcion" style={{ marginLeft: 8 }}>
            {suscrito ? 'Desactivando…' : 'Activando notificaciones…'}
          </span>
        </div>
      )}

      {error && (
        <div className="modal-permisos__fila" style={{ color: '#dc2626' }}>
          <AlertCircle size={15} />
          <span className="modal-permisos__fila-descripcion" style={{ marginLeft: 8 }}>{error}</span>
        </div>
      )}

      {suscrito && prefs && (
        <div className="modal-permisos__categorias">
          <span className="modal-permisos__categorias-titulo">¿Qué notificaciones querés recibir?</span>
          {Object.values(CATEGORIAS).map(cat => {
            const campo = `push_${cat.id}`
            const Icono = cat.icono
            return (
              <div className="modal-permisos__fila" key={cat.id}>
                <div className="modal-permisos__fila-icono" style={{ background: `var(--color-${cat.color}-light, var(--color-bg))` }}>
                  <Icono size={17} />
                </div>
                <div className="modal-permisos__fila-texto">
                  <span className="modal-permisos__fila-titulo">{cat.nombre}</span>
                </div>
                <Switch.Root
                  checked={prefs[campo] !== false}
                  disabled={guardando === campo}
                  size="md"
                  onCheckedChange={() => handleToggleCategoria(campo)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </div>
            )
          })}
        </div>
      )}

      <div className="modal-permisos__fila">
        <div className="modal-permisos__fila-icono">
          <Lock size={17} />
        </div>
        <div className="modal-permisos__fila-texto">
          <span className="modal-permisos__fila-titulo">Reiniciar contraseña</span>
          <span className="modal-permisos__fila-descripcion">Próximamente</span>
        </div>
      </div>

      <Link to="/terminos" className="modal-permisos__fila modal-permisos__fila--link">
        <div className="modal-permisos__fila-icono">
          <Scale size={17} />
        </div>
        <div className="modal-permisos__fila-texto">
          <span className="modal-permisos__fila-titulo">Información legal</span>
          <span className="modal-permisos__fila-descripcion">Términos, condiciones y privacidad</span>
        </div>
        <ChevronRight size={18} className="modal-permisos__fila-flecha" />
      </Link>
    </>
  )
}

// ---------------------------------------------------------
// MiniOrdenCard — tarjeta compacta para el carrusel de "Tus pedidos"
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
        <span className="mini-orden-card__badge" style={{ color: estado.color, background: estado.bg }}>
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

// ---------------------------------------------------------
// Bloque de crédito — barra de progreso (Chakra) si el cliente tiene
// línea de crédito asignada; si es cliente de contado, un bloque
// distinto invitando a Pagos en su lugar.
// ---------------------------------------------------------
function BloqueCredito({ resumen }) {
  const tieneCredito = (resumen?.linea_credito || 0) > 0

  if (!tieneCredito) {
    return (
      <div className="bloque-tarjeta bloque-credito bloque-credito--contado">
        <div className="bloque-tarjeta__icono bloque-tarjeta__icono--azul">
          <Wallet size={20} />
        </div>
        <div className="bloque-credito__texto">
          <span className="bloque-tarjeta__titulo">Cliente de contado</span>
          <p className="bloque-tarjeta__descripcion">Reportá tus pagos y revisá tu historial de facturas.</p>
        </div>
        <Link to="/pagos" className="bloque-tarjeta__cta">
          Ir a Pagos <ChevronRight size={15} />
        </Link>
      </div>
    )
  }

  const porcentaje = Math.min((resumen.deuda_actual / resumen.linea_credito) * 100, 100)
  const colorPalette = porcentaje >= 90 ? 'red' : porcentaje >= 60 ? 'orange' : 'blue'

  return (
    <Link to="/estado-cuenta" className="bloque-tarjeta bloque-credito">
      <div className="bloque-credito__header">
        <span className="bloque-tarjeta__titulo">Línea de crédito</span>
        <span className="bloque-credito__porcentaje">{Math.round(porcentaje)}% usado</span>
      </div>

      <Progress.Root value={porcentaje} colorPalette={colorPalette} size="sm" className="bloque-credito__barra">
        <Progress.Track borderRadius="999px">
          <Progress.Range borderRadius="999px" />
        </Progress.Track>
      </Progress.Root>

      <div className="bloque-credito__cifras">
        <div>
          <span className="bloque-credito__cifra-label">Deuda actual</span>
          <strong className={resumen.deuda_actual > 0 ? 'bloque-credito__cifra--rojo' : ''}>
            {formatearMonto(resumen.deuda_actual)}
          </strong>
        </div>
        <div>
          <span className="bloque-credito__cifra-label">Línea total</span>
          <strong>{formatearMonto(resumen.linea_credito)}</strong>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------
// Bloque de pedidos activos — barra apilada con la distribución por
// estado de las órdenes en curso.
// ---------------------------------------------------------
function BloquePedidosActivos({ ordenes }) {
  const { total, conteos } = ordenes

  return (
    <Link to="/orders" className="bloque-tarjeta bloque-pedidos-activos">
      <div className="bloque-pedidos-activos__header">
        <span className="bloque-tarjeta__titulo">Pedidos activos</span>
        <span className="bloque-pedidos-activos__total">{total}</span>
      </div>

      {total === 0 ? (
        <p className="bloque-tarjeta__descripcion">No tenés pedidos en curso ahora mismo.</p>
      ) : (
        <>
          <div className="bloque-pedidos-activos__barra">
            {conteos.map((c) => (
              <span
                key={c.estado}
                style={{ width: `${(c.cantidad / total) * 100}%`, background: c.color }}
                title={`${c.label}: ${c.cantidad}`}
              />
            ))}
          </div>
          <div className="bloque-pedidos-activos__leyenda">
            {conteos.map((c) => (
              <span key={c.estado} className="bloque-pedidos-activos__leyenda-item">
                <span className="bloque-pedidos-activos__punto" style={{ background: c.color }} />
                {c.label} · {c.cantidad}
              </span>
            ))}
          </div>
        </>
      )}
    </Link>
  )
}

// ---------------------------------------------------------
// Gráfico de gasto mensual — barras simples de los últimos 6 meses
// ---------------------------------------------------------
function GraficoGastoMensual({ datos }) {
  const max = Math.max(1, ...datos.map((m) => m.total))
  const totalPeriodo = datos.reduce((acc, m) => acc + m.total, 0)

  return (
    <div className="bloque-tarjeta gasto-mensual">
      <div className="gasto-mensual__header">
        <span className="bloque-tarjeta__titulo">Tu gasto en los últimos 6 meses</span>
        <span className="gasto-mensual__total">{formatearMonto(totalPeriodo)}</span>
      </div>

      {totalPeriodo === 0 ? (
        <p className="bloque-tarjeta__descripcion">Todavía no hay compras registradas en este período.</p>
      ) : (
        <div className="gasto-mensual__grafico">
          {datos.map((m) => (
            <div className="gasto-mensual__columna" key={`${m.anio}-${m.mes}`}>
              <div className="gasto-mensual__barra-wrap">
                <div
                  className="gasto-mensual__barra"
                  style={{ height: `${Math.max((m.total / max) * 100, m.total > 0 ? 6 : 0)}%` }}
                  title={formatearMonto(m.total)}
                />
              </div>
              <span className="gasto-mensual__mes">{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// Preview de favoritos — mini grid con imagen
// ---------------------------------------------------------
function BloqueFavoritos({ favoritos }) {
  const preview = (favoritos || []).slice(0, 4)

  return (
    <Link to="/mis-items" className="bloque-tarjeta bloque-favoritos">
      <div className="bloque-favoritos__header">
        <span className="bloque-tarjeta__titulo">Favoritos guardados</span>
        <span className="bloque-pedidos-activos__total">{(favoritos || []).length}</span>
      </div>

      {preview.length === 0 ? (
        <p className="bloque-tarjeta__descripcion">Guardá productos que uses seguido para encontrarlos rápido.</p>
      ) : (
        <div className="bloque-favoritos__grid">
          {preview.map((producto) => (
            <div className="bloque-favoritos__item" key={producto.id}>
              {producto.foto_url ? (
                <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
              ) : (
                <div className="bloque-favoritos__item-sin-foto" />
              )}
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}

function MiCuenta() {
  const { user, logout } = useAuth()
  const { favoritos } = useFavoritos()
  const navigate = useNavigate()
  const [estadoCuenta, setEstadoCuenta] = useState(null)
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [mostrarConfirmarLogout, setMostrarConfirmarLogout] = useState(false)
  const [mostrarModalCuenta, setMostrarModalCuenta] = useState(false)
  const [mostrarModalPermisos, setMostrarModalPermisos] = useState(false)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [{ data: dataCuenta }, { data: dataOrdenes }] = await Promise.all([
          api.get(`/clientes/${user.id}/estado-cuenta`),
          api.get('/orders'),
        ])
        setEstadoCuenta(dataCuenta)
        setOrdenes(dataOrdenes)
      } catch (err) {
        setError('No se pudieron cargar los datos de tu cuenta')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resumen = estadoCuenta?.resumen
  const ultimasOrdenes = useMemo(() => ordenes.slice(0, 5), [ordenes])
  const gastoMensual = useMemo(() => calcularGastoMensual(ordenes), [ordenes])
  const pedidosActivos = useMemo(() => calcularPedidosActivos(ordenes), [ordenes])
  const inicial = (user.nombre || user.email || '?').charAt(0).toUpperCase()

  // "Cambiar cuenta": cierra sesión para que otra persona inicie con
  // otra cuenta. No hace falta navegar a mano: PrivateRoute redirige
  // solo a /login en cuanto el usuario queda en null.
  function cambiarCuenta() {
    setMostrarModalCuenta(false)
    logout()
  }

  // "Cerrar sesión" (desde el selector de cuenta): a diferencia de
  // "Cambiar cuenta", esta va a Inicio en vez de al login — usamos "/"
  // (Landing pública) y no "/home", que está detrás de PrivateRoute y
  // rebotaría al login apenas cerramos sesión, sin dejar ver el toast.
  // El toast en sí lo dejamos para cuando lo diseñemos: por ahora solo
  // viaja en el state de navegación, listo para que ese componente lo
  // lea cuando exista.
  function cerrarSesionEIrAInicio() {
    setMostrarModalCuenta(false)
    logout()
    navigate('/', { state: { toast: 'Cerraste sesión correctamente' } })
  }

  return (
    <LayoutPaginaPrincipal activo="cuenta" titulo="Mi Cuenta" subtitulo="Un vistazo general a tu cuenta" nav={NAV_UNIFICADO}>
      <div className="mi-cuenta">
        <header className="mi-cuenta__header">
          <div className="mi-cuenta__header-info">
            <div className="mi-cuenta__avatar">{inicial}</div>
            <button type="button" className="mi-cuenta__saludo-btn" onClick={() => setMostrarModalCuenta(true)}>
              <span className="mi-cuenta__header-texto">
                <h1>Hola, {user.nombre || 'Usuario'}</h1>
                <span className="mi-cuenta__email">{user.email}</span>
              </span>
              <ChevronDown size={18} className="mi-cuenta__saludo-flecha" />
            </button>
          </div>

          <div className="mi-cuenta__header-acciones">
            <button
              type="button"
              className="mi-cuenta__icono-btn"
              aria-label="Permisos y notificaciones"
              onClick={() => setMostrarModalPermisos(true)}
            >
              <Settings size={19} />
            </button>
            <Link to="/notificaciones" className="mi-cuenta__icono-btn" aria-label="Notificaciones">
              <Bell size={19} />
            </Link>
            <button
              type="button"
              className="mi-cuenta__icono-btn"
              aria-label="Cerrar sesión"
              onClick={() => setMostrarConfirmarLogout(true)}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {mostrarModalCuenta && (
          <HojaInferior titulo="Tu cuenta" onCerrar={() => setMostrarModalCuenta(false)}>
            <ContenidoModalCuenta
              user={user}
              inicial={inicial}
              onCerrar={() => setMostrarModalCuenta(false)}
              onCambiarCuenta={cambiarCuenta}
              onCerrarSesion={cerrarSesionEIrAInicio}
            />
          </HojaInferior>
        )}

        {mostrarModalPermisos && (
          <HojaInferior titulo="Permisos y notificaciones" onCerrar={() => setMostrarModalPermisos(false)}>
            <ContenidoModalPermisos />
          </HojaInferior>
        )}

        {mostrarConfirmarLogout && (
          <div className="modal-overlay" onClick={() => setMostrarConfirmarLogout(false)}>
            <div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-confirmar__cerrar"
                aria-label="Cerrar"
                onClick={() => setMostrarConfirmarLogout(false)}
              >
                <X size={16} />
              </button>
              <h3>¿Cerrar sesión?</h3>
              <p>Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.</p>
              <div className="modal-confirmar__acciones">
                <button
                  type="button"
                  className="btn btn--secundario"
                  onClick={() => setMostrarConfirmarLogout(false)}
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

        <BannerOnboarding />

        {cargando ? (
          <div className="mi-cuenta__cargando">
            <Loader2 className="mi-cuenta__spinner" size={28} />
            <p>Cargando tu cuenta…</p>
          </div>
        ) : (
          <>
            <div className="mi-cuenta__grid-2col">
              <BloqueCredito resumen={resumen} />
              <BloquePedidosActivos ordenes={pedidosActivos} />
            </div>

            <GraficoGastoMensual datos={gastoMensual} />

            {/* ---------------------------------------------------------------- */}
            {/* Tus pedidos — título + flecha, carrusel de MiniOrdenCard          */}
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
                  <p>Parece que no tenés pedidos recientes</p>
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

            <div className="mi-cuenta__grid-2col">
              <BloqueFavoritos favoritos={favoritos} />

              <Link to="/contacto" className="bloque-tarjeta soporte-card">
                <div className="bloque-tarjeta__icono bloque-tarjeta__icono--teal">
                  <MessageCircle size={20} />
                </div>
                <div className="bloque-credito__texto">
                  <span className="bloque-tarjeta__titulo">¿Necesitás ayuda?</span>
                  <p className="bloque-tarjeta__descripcion">Escribinos y te respondemos a la brevedad.</p>
                </div>
                <span className="bloque-tarjeta__cta">
                  Contactar <ChevronRight size={15} />
                </span>
              </Link>
            </div>

            <div className="legal-footer">
              <Link to="/terminos">Términos y condiciones</Link>
              <span>·</span>
              <Link to="/privacidad">Aviso de privacidad</Link>
            </div>

            <div className="mi-cuenta__footer">
              <ShieldCheck size={14} />
              <span>Droguería Carrisán · Tu información está protegida</span>
            </div>
          </>
        )}
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default MiCuenta
