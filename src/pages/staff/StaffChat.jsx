import { useState, useEffect, useMemo, useRef } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import './StaffChat.css'

// ---------------------------------------------------------------
// Comunicaciones (Comercial staff). Centro de mensajes cliente-empresa:
// lista plana de conversaciones (más recientes primero) a la izquierda
// y panel de chat a la derecha. Sin agrupación por cliente — el staff
// ve todos los hilos ordenados por actividad. Endpoints /staff/chat/*.
// ---------------------------------------------------------------

function tituloConversacion(conv) {
  return conv.tipo === 'general' ? 'Chat general' : `Orden #${conv.orden_id}`
}

function formatFecha(fechaISO) {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const esHoy = fecha.toDateString() === ahora.toDateString()
  return esHoy
    ? fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
    : fecha.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' })
}

function ordenarConversaciones(lista) {
  return [...lista].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
}

function StaffChat() {
  const [conversaciones, setConversaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [conversacionActiva, setConversacionActiva] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef(null)
  const activaIdRef = useRef(null)

  useEffect(() => {
    activaIdRef.current = conversacionActiva?.id ?? null
  }, [conversacionActiva])

  async function cargarConversaciones() {
    try {
      setCargando(true)
      const { data } = await staffApi.get('/staff/chat/conversaciones')
      setConversaciones(ordenarConversaciones(data))
      setError('')
    } catch (err) {
      setError('No se pudieron cargar las conversaciones')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  // Refresco silencioso: nueva actividad del cliente aparece sin
  // resetear la UI (mismo alcance que el admin, ordenado por updated_at).
  async function refrescarConversaciones() {
    try {
      const { data } = await staffApi.get('/staff/chat/conversaciones')
      setConversaciones(ordenarConversaciones(data))
      const actId = activaIdRef.current
      if (actId) {
        const actual = data.find((c) => c.id === actId)
        if (actual) setConversacionActiva((prev) => (prev && prev.id === actId ? actual : prev))
        const { data: msgs } = await staffApi.get(`/staff/chat/conversaciones/${actId}/mensajes`)
        setMensajes(msgs)
      }
    } catch (err) {
      console.error('Error al refrescar conversaciones:', err)
    }
  }

  useEffect(() => {
    const interval = setInterval(refrescarConversaciones, 30000)
    return () => clearInterval(interval)
  }, [])

  async function abrirConversacion(conv) {
    setConversacionActiva(conv)
    setCargandoMensajes(true)
    try {
      const { data } = await staffApi.get(`/staff/chat/conversaciones/${conv.id}/mensajes`)
      setMensajes(data)
      setConversaciones((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, no_leidos: 0 } : c))
      )
    } catch (err) {
      console.error('Error al cargar mensajes:', err)
    } finally {
      setCargandoMensajes(false)
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [mensajes, cargandoMensajes])

  async function enviarMensaje(e) {
    e.preventDefault()
    if (!texto.trim() || !conversacionActiva || enviando) return

    const contenido = texto.trim()
    setTexto('')
    setEnviando(true)

    try {
      const { data: nuevoMensaje } = await staffApi.post(
        `/staff/chat/conversaciones/${conversacionActiva.id}/mensajes`,
        { contenido }
      )
      setMensajes((prev) => [...prev, nuevoMensaje])
      setConversaciones((prev) =>
        ordenarConversaciones(
          prev.map((c) =>
            c.id === conversacionActiva.id
              ? { ...c, ultimo_mensaje: nuevoMensaje, updated_at: nuevoMensaje.created_at, no_leidos: 0 }
              : c
          )
        )
      )
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      setTexto(contenido)
    } finally {
      setEnviando(false)
    }
  }

  const conversacionesFiltradas = useMemo(() => {
    if (!busqueda) return conversaciones
    const texto = busqueda.toLowerCase()
    return conversaciones.filter(
      (c) =>
        c.users?.nombre?.toLowerCase().includes(texto) ||
        c.users?.email?.toLowerCase().includes(texto) ||
        (c.orden_id && c.orden_id.toString().includes(texto))
    )
  }, [conversaciones, busqueda])

  return (
    <LayoutDepartamento departamento="comercial" activo="chat" titulo="Comunicaciones">
      <div className="scc">
        {error && (
          <div className="scc-error">
            <span>{error}</span>
            <button type="button" className="scc-error__btn" onClick={cargarConversaciones}>
              Reintentar
            </button>
          </div>
        )}

        <div className="scc-inbox">
          <aside className={`scc-list ${conversacionActiva ? 'scc-list--oculto-movil' : ''}`}>
            <div className="scc-list__toolbar">
              <div className="scc-buscar">
                <span className="scc-buscar__icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por cliente, email u orden..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="scc-buscar__input"
                />
              </div>
              <button
                type="button"
                className="scc-refrescar"
                onClick={refrescarConversaciones}
                title="Actualizar"
              >
                🔄
              </button>
            </div>

            <div className="scc-list__scroll">
              {cargando ? (
                <p className="scc-vacio">Cargando conversaciones...</p>
              ) : conversacionesFiltradas.length === 0 ? (
                <p className="scc-vacio">No se encontraron conversaciones</p>
              ) : (
                conversacionesFiltradas.map((conv) => (
                  <button
                    type="button"
                    key={conv.id}
                    className={`scc-item ${conversacionActiva?.id === conv.id ? 'scc-item--activo' : ''}`}
                    onClick={() => abrirConversacion(conv)}
                  >
                    <div className="scc-item__cabecera">
                      <span className="scc-item__cliente">{conv.users?.nombre || 'Cliente'}</span>
                      <span className="scc-item__fecha">
                        {formatFecha(conv.ultimo_mensaje?.created_at)}
                      </span>
                    </div>
                    <span className="scc-item__titulo">{tituloConversacion(conv)}</span>
                    <div className="scc-item__pie">
                      <span className="scc-item__preview">
                        {conv.ultimo_mensaje?.contenido || 'Sin mensajes'}
                      </span>
                      {conv.no_leidos > 0 && (
                        <span className="scc-item__badge">{conv.no_leidos}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="scc-panel">
            {!conversacionActiva ? (
              <div className="scc-vacio scc-vacio--panel">
                <span>💬</span>
                <p>Selecciona una conversación para responder</p>
              </div>
            ) : (
              <>
                <header className="scc-panel__header">
                  <button
                    type="button"
                    className="scc-panel__back"
                    onClick={() => setConversacionActiva(null)}
                    title="Volver"
                  >
                    ←
                  </button>
                  <div>
                    <p className="scc-panel__cliente">
                      {conversacionActiva.users?.nombre || 'Cliente'}
                    </p>
                    <p className="scc-panel__subtitulo">
                      {tituloConversacion(conversacionActiva)}
                    </p>
                  </div>
                </header>

                <div className="scc-panel__mensajes" ref={scrollRef}>
                  {cargandoMensajes ? (
                    <p className="scc-vacio">Cargando mensajes...</p>
                  ) : (
                    mensajes.map((m) => (
                      <div
                        key={m.id}
                        className={`scc-burbuja ${m.remitente_tipo === 'admin' ? 'scc-burbuja--propio' : ''}`}
                      >
                        <p className="scc-burbuja__texto">{m.contenido}</p>
                        <span className="scc-burbuja__hora">{formatFecha(m.created_at)}</span>
                      </div>
                    ))
                  )}
                </div>

                <form className="scc-panel__form" onSubmit={enviarMensaje}>
                  <input
                    type="text"
                    placeholder="Escribe una respuesta..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    disabled={enviando}
                    className="scc-panel__input"
                  />
                  <button type="submit" disabled={!texto.trim() || enviando} className="scc-panel__enviar">
                    Enviar
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </LayoutDepartamento>
  )
}

export default StaffChat