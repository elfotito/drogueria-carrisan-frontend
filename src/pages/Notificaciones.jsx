import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

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
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
    } catch (err) {
      console.error('Error al marcar leída:', err)
    }
  }

  async function marcarTodasLeidas() {
    try {
      await api.patch('/notifications/read-all')
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    } catch (err) {
      console.error('Error al marcar todas:', err)
    }
  }

  function handleClick(notificacion) {
    if (!notificacion.leida) {
      marcarLeida(notificacion.id)
    }
    if (notificacion.orden_id) {
      navigate('/ordenes')
    }
  }

  if (cargando) return <p>Cargando notificaciones...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notificaciones</h1>
        {noLeidas > 0 && (
          <button onClick={marcarTodasLeidas}>
            Marcar todas como leídas ({noLeidas})
          </button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <p style={{ marginTop: '30px', color: '#666' }}>No tienes notificaciones</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {notificaciones.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: notif.leida ? '#fafafa' : '#e3f2fd',
                borderLeft: notif.leida ? '3px solid #ccc' : '3px solid #1976d2',
                borderRadius: '5px',
                cursor: notif.orden_id ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{notif.titulo}</strong>
                <small style={{ color: '#999' }}>
                  {new Date(notif.created_at).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#555' }}>{notif.mensaje}</p>
              {!notif.leida && (
                <span style={{ 
                  display: 'inline-block', 
                  marginTop: '8px', 
                  padding: '2px 8px', 
                  background: '#1976d2', 
                  color: 'white', 
                  borderRadius: '10px', 
                  fontSize: '12px' 
                }}>
                  Nueva
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notificaciones