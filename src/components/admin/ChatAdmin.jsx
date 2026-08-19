import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../../api/axios'
import './ChatAdmin.css'

// ---------------------------------------------------------------
// Admin del Centro de Comunicaciones. A diferencia del chat del
// cliente (una lista plana), acá agrupamos por cliente porque el
// admin puede tener decenas de conversaciones mezcladas — igual
// criterio que una bandeja de soporte (Intercom/Zendesk-style).
//
// GET /chat/conversaciones ya devuelve TODAS para el admin (ver
// chat.controller.js), acá solo las agrupamos y filtramos en el
// cliente.
// ---------------------------------------------------------------

function tituloConversacion(conv) {
  return conv.tipo === 'general' ? '💬 Chat general' : `📦 Orden #${conv.orden_id}`
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

function ChatAdmin() {
  const [conversaciones, setConversaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos') // todos | general | orden
  const [soloNoLeidas, setSoloNoLeidas] = useState(false)
  const [clienteExpandido, setClienteExpandido] = useState(null)

  const [conversacionActiva, setConversacionActiva] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    cargarConversaciones()
  }, [])

  async function cargarConversaciones() {
    try {
      setCargando(true)
      const { data } = await api.get('/chat/conversaciones')
      setConversaciones(data)
    } catch (err) {
      setError('No se pudieron cargar las conversaciones')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function abrirConversacion(conv) {
    setConversacionActiva(conv)
    setCargandoMensajes(true)
    try {
      const { data } = await api.get(`/chat/conversaciones/${conv.id}/mensajes`)
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes])

  async function enviarMensaje(e) {
    e.preventDefault()
    if (!texto.trim() || !conversacionActiva || enviando) return

    const contenido = texto.trim()
    setTexto('')
    setEnviando(true)

    try {
      const { data: nuevoMensaje } = await api.post(
        `/chat/conversaciones/${conversacionActiva.id}/mensajes`,
        { contenido }
      )
      setMensajes((prev) => [...prev, nuevoMensaje])
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id === conversacionActiva.id
            ? { ...c, ultimo_mensaje: nuevoMensaje, updated_at: nuevoMensaje.created_at }
            : c
        )
      )
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      setTexto(contenido)
    } finally {
      setEnviando(false)
    }
  }

  // Filtrado
  const conversacionesFiltradas = useMemo(() => {
    let resultado = [...conversaciones]

    if (filtroTipo !== 'todos') {
      resultado = resultado.filter((c) => c.tipo === filtroTipo)
    }
    if (soloNoLeidas) {
      resultado = resultado.filter((c) => c.no_leidos > 0)
    }
    if (busqueda) {
      const texto = busqueda.toLowerCase()
      resultado = resultado.filter(
        (c) =>
          c.users?.nombre?.toLowerCase().includes(texto) ||
          c.users?.email?.toLowerCase().includes(texto) ||
          (c.orden_id && c.orden_id.toString().includes(texto))
      )
    }
    return resultado
  }, [conversaciones, filtroTipo, soloNoLeidas, busqueda])

  // Agrupado por cliente
  const clientesAgrupados = useMemo(() => {
    const mapa = new Map()
    for (const conv of conversacionesFiltradas) {
      const key = conv.usuario_id
      if (!mapa.has(key)) {
        mapa.set(key, {
          usuario_id: key,
          nombre: conv.users?.nombre || 'Cliente',
          email: conv.users?.email || '',
          conversaciones: [],
          no_leidos: 0,
          ultima_actividad: null
        })
      }
      const grupo = mapa.get(key)
      grupo.conversaciones.push(conv)
      grupo.no_leidos += conv.no_leidos || 0
      if (!grupo.ultima_actividad || new Date(conv.updated_at) > new Date(grupo.ultima_actividad)) {
        grupo.ultima_actividad = conv.updated_at
      }
    }
    return Array.from(mapa.values()).sort(
      (a, b) => new Date(b.ultima_actividad) - new Date(a.ultima_actividad)
    )
  }, [conversacionesFiltradas])

  const estadisticas = useMemo(() => {
    const totalConversaciones = conversaciones.length
    const noLeidas = conversaciones.reduce((sum, c) => sum + (c.no_leidos || 0), 0)
    const clientesActivos = new Set(conversaciones.map((c) => c.usuario_id)).size
    return { totalConversaciones, noLeidas, clientesActivos }
  }, [conversaciones])

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando conversaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarConversaciones} className="btn-reintentar">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="chat-admin">
      {/* Header */}
      <div className="section-header">
        <div className="header-top">
          <h2>💬 Centro de Comunicaciones</h2>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-valor">{estadisticas.totalConversaciones}</div>
            <div className="stat-label">Conversaciones</div>
          </div>
        </div>
        <div className="stat-card stat-pendientes">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <div className="stat-valor">{estadisticas.noLeidas}</div>
            <div className="stat-label">Mensajes sin leer</div>
          </div>
        </div>
        <div className="stat-card stat-finalizadas">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-valor">{estadisticas.clientesActivos}</div>
            <div className="stat-label">Clientes activos</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filtros">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por cliente, email u orden..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los tipos</option>
            <option value="general">Chat general</option>
            <option value="orden">Por orden</option>
          </select>
          <button
            type="button"
            className={`filter-toggle ${soloNoLeidas ? 'active' : ''}`}
            onClick={() => setSoloNoLeidas((v) => !v)}
          >
            🔴 Solo no leídas
          </button>
        </div>
      </div>

      {/* Inbox: clientes + panel de chat */}
      <div className="chat-admin-inbox">
        <div className="chat-admin-clientes">
          {clientesAgrupados.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No se encontraron conversaciones</p>
            </div>
          ) : (
            clientesAgrupados.map((cliente) => {
              const abierto = clienteExpandido === cliente.usuario_id
              return (
                <div key={cliente.usuario_id} className="cliente-grupo">
                  <button
                    type="button"
                    className="cliente-grupo__header"
                    onClick={() => setClienteExpandido(abierto ? null : cliente.usuario_id)}
                  >
                    <div className="cliente-grupo__info">
                      <p className="cliente-grupo__nombre">{cliente.nombre}</p>
                      <p className="cliente-grupo__email">{cliente.email}</p>
                    </div>
                    <div className="cliente-grupo__meta">
                      {cliente.no_leidos > 0 && (
                        <span className="cliente-grupo__badge">{cliente.no_leidos}</span>
                      )}
                      <span className="cliente-grupo__chevron">{abierto ? '▾' : '▸'}</span>
                    </div>
                  </button>

                  {abierto && (
                    <div className="cliente-grupo__lista">
                      {cliente.conversaciones.map((conv) => (
                        <button
                          type="button"
                          key={conv.id}
                          className={`conv-item ${conversacionActiva?.id === conv.id ? 'conv-item--activo' : ''}`}
                          onClick={() => abrirConversacion(conv)}
                        >
                          <span className="conv-item__titulo">{tituloConversacion(conv)}</span>
                          <span className="conv-item__preview">
                            {conv.ultimo_mensaje?.contenido || 'Sin mensajes'}
                          </span>
                          <span className="conv-item__fecha">
                            {formatFecha(conv.ultimo_mensaje?.created_at)}
                          </span>
                          {conv.no_leidos > 0 && <span className="conv-item__punto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="chat-admin-panel">
          {!conversacionActiva ? (
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <p>Selecciona una conversación para responder</p>
            </div>
          ) : (
            <>
              <div className="chat-admin-panel__header">
                <div>
                  <p className="chat-admin-panel__titulo">
                    {conversacionActiva.users?.nombre || 'Cliente'}
                  </p>
                  <p className="chat-admin-panel__subtitulo">
                    {tituloConversacion(conversacionActiva)}
                  </p>
                </div>
              </div>

              <div className="chat-admin-panel__mensajes" ref={scrollRef}>
                {cargandoMensajes ? (
                  <p className="chat-admin-panel__cargando">Cargando mensajes...</p>
                ) : (
                  mensajes.map((m) => (
                    <div
                      key={m.id}
                      className={`chat-admin-burbuja ${m.remitente_tipo === 'admin' ? 'chat-admin-burbuja--propio' : ''}`}
                    >
                      <p className="chat-admin-burbuja__texto">{m.contenido}</p>
                      <span className="chat-admin-burbuja__hora">
                        {formatFecha(m.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-admin-panel__form" onSubmit={enviarMensaje}>
                <input
                  type="text"
                  placeholder="Escribe una respuesta..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  disabled={enviando}
                  className="chat-admin-panel__input"
                />
                <button type="submit" disabled={!texto.trim() || enviando} className="btn-exportar">
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatAdmin
