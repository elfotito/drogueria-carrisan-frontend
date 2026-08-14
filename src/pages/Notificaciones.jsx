import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Notificaciones.css'

// Mapa de tipo -> ícono/color. Cualquier tipo nuevo que agregues en el
// backend cae en TIPO_FALLBACK automáticamente (no rompe el diseño).
const TIPOS_CONFIG = {
  orden_creada: { icon: '📦', clase: 'notif-icon--azul' },
  orden_confirmada: { icon: '✓', clase: 'notif-icon--verde' },
  orden_enviada: { icon: '🚚', clase: 'notif-icon--azul' },
  orden_entregada: { icon: '✓', clase: 'notif-icon--verde' },
  orden_cancelada: { icon: '!', clase: 'notif-icon--rojo' },
  pago_recibido: { icon: '✓', clase: 'notif-icon--verde' },
  pago_rechazado: { icon: '!', clase: 'notif-icon--rojo' },
  sistema: { icon: 'i', clase: 'notif-icon--info' },
}

const TIPO_FALLBACK = { icon: '•', clase: 'notif-icon--neutro' }

function getTipoConfig(tipo) {
  return TIPOS_CONFIG[tipo] || TIPO_FALLBACK
}

function formatFecha(fechaISO) {
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diffMs = ahora - fecha
  const diffMin = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMin / 60)
  const diffDias = Math.floor(diffHoras / 24)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`

  return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function NotifSkeleton() {
  return (
    <div className="notif-card notif-card--skeleton">
      <div className="notif-icon notif-icon--skeleton" />
      <div className="notif-card__body">
        <div className="skel-line skel-line--sm" />
        <div className="skel-line skel-line--md" />
      </div>
    </div>
  )
}

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  async function cargarNotificaciones() {
    try {
      const { data } = await api.get('/notifications')
      setNotificaciones(data)
    } catch (err) {
      setError('No se pudieron cargar las notificaciones')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function marcarLeida(id) {
    try {
      await api.patch(`/notifications/${id}`)
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      )
    } catch (err) {
      console.error('Error al marcar leída:', err)
    }
  }

  async function marcarTodasLeidas() {
    try {
      await api.patch('/notifications/read-all')
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch (err) {
      console.error('Error al marcar todas:', err)
    }
  }

  function handleClick(notificacion) {
    if (!notificacion.leida) {
      marcarLeida(notificacion.id)
    }
    if (notificacion.orden_id) {
      navigate('/orders')
    }
  }

  if (error) {
    return (
      <div className="notif-page">
        <p className="notif-error">{error}</p>
      </div>
    )
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <div className="notif-page">
      <div className="notif-container">
        <div className="notif-header">
          <h1 className="notif-title">Notificaciones</h1>
          {noLeidas > 0 && (
            <button type="button" className="notif-marcar-todas" onClick={marcarTodasLeidas}>
              Marcar todas ({noLeidas})
            </button>
          )}
        </div>

        {cargando ? (
          <div className="notif-list">
            {Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="notif-vacio">
            <div className="notif-vacio__icon">🔔</div>
            <h2>No tienes notificaciones</h2>
            <p>Aquí verás novedades sobre tus órdenes y tu cuenta.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notificaciones.map((notif) => {
              const tipoConfig = getTipoConfig(notif.tipo)
              const esClickeable = !!notif.orden_id

              return (
                <div
                  key={notif.id}
                  className={`notif-card ${notif.leida ? '' : 'notif-card--no-leida'} ${esClickeable ? 'notif-card--clickeable' : ''}`}
                  onClick={() => handleClick(notif)}
                  role={esClickeable ? 'button' : undefined}
                  tabIndex={esClickeable ? 0 : undefined}
                >
                  <span className={`notif-icon ${tipoConfig.clase}`}>{tipoConfig.icon}</span>

                  <div className="notif-card__body">
                    <div className="notif-card__top">
                      <strong className="notif-card__titulo">{notif.titulo}</strong>
                      <span className="notif-card__fecha">{formatFecha(notif.created_at)}</span>
                    </div>
                    <p className="notif-card__mensaje">{notif.mensaje}</p>
                    {!notif.leida && <span className="notif-badge-nueva">Nueva</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notificaciones
