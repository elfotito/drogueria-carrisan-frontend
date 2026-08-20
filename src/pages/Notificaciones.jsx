import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Tabs,
  Menu,
  Portal,
  Switch,
  Accordion,
  Badge,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { MoreVertical, ChevronDown } from 'lucide-react'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { NAV_NOTIFICACIONES } from '../components/paginas-principales/NavNotificaciones'
import api from '../api/axios'
import {
  CATEGORIAS,
  ORDEN_CATEGORIAS,
  DESCRIPCION_TIPO,
  getCategoriaDeTipo,
  getConfigTipo,
} from '../utils/notificacionesCatalogo'
import './Notificaciones.css'

// ---------------------------------------------------------------
// Notificaciones: filtro por categoría (Tabs), agrupado por fecha,
// preferencias de silencio por categoría (localStorage, sin
// backend) y una leyenda explicando qué significa cada tipo.
// ---------------------------------------------------------------

const CLAVE_SILENCIADAS = 'notif_categorias_silenciadas'

function leerSilenciadas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SILENCIADAS)) || []
  } catch {
    return []
  }
}

function formatFecha(fechaISO) {
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diffMs = ahora - fecha
  const diffMin = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMin / 60)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`
  return fecha.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

// Agrupa una lista ya ordenada (desc) en baldes de fecha relativa
function agruparPorFecha(lista) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  const haceUnaSemana = new Date(hoy)
  haceUnaSemana.setDate(hoy.getDate() - 7)

  const baldes = { Hoy: [], Ayer: [], 'Esta semana': [], 'Más antiguas': [] }

  for (const n of lista) {
    const fecha = new Date(n.created_at)
    if (fecha >= hoy) baldes['Hoy'].push(n)
    else if (fecha >= ayer) baldes['Ayer'].push(n)
    else if (fecha >= haceUnaSemana) baldes['Esta semana'].push(n)
    else baldes['Más antiguas'].push(n)
  }

  return Object.entries(baldes).filter(([, items]) => items.length > 0)
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

function TarjetaNotificacion({ notif, onClick }) {
  const config = getConfigTipo(notif.tipo)
  const Icono = config.icono
  const esClickeable = !!notif.orden_id || notif.tipo === 'chat_mensaje'

  return (
    <div
      className={`notif-card ${notif.leida ? '' : 'notif-card--no-leida'} ${esClickeable ? 'notif-card--clickeable' : ''}`}
      onClick={() => onClick(notif)}
      role={esClickeable ? 'button' : undefined}
      tabIndex={esClickeable ? 0 : undefined}
    >
      <span className={`notif-icon notif-icon--${config.color}`}>
        <Icono size={17} />
      </span>
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
}

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [silenciadas, setSilenciadas] = useState(leerSilenciadas)
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
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
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

  function toggleSilenciar(categoriaId, silenciar) {
    const nuevas = silenciar
      ? [...silenciadas, categoriaId]
      : silenciadas.filter((c) => c !== categoriaId)
    setSilenciadas(nuevas)
    localStorage.setItem(CLAVE_SILENCIADAS, JSON.stringify(nuevas))
  }

  function handleClick(notificacion) {
    if (!notificacion.leida) marcarLeida(notificacion.id)
    if (notificacion.tipo === 'chat_mensaje') {
      navigate(notificacion.orden_id ? `/chat/orden/${notificacion.orden_id}` : '/chat')
    } else if (notificacion.orden_id) {
      navigate('/orders')
    }
  }

  // Visibles = todo lo que no pertenece a una categoría silenciada
  const visibles = useMemo(
    () => notificaciones.filter((n) => !silenciadas.includes(getCategoriaDeTipo(n.tipo))),
    [notificaciones, silenciadas]
  )

  const conteosPorCategoria = useMemo(() => {
    const conteo = { todas: visibles.length }
    for (const cat of ORDEN_CATEGORIAS) conteo[cat] = 0
    for (const n of visibles) {
      const cat = getCategoriaDeTipo(n.tipo)
      conteo[cat] = (conteo[cat] || 0) + 1
    }
    return conteo
  }, [visibles])

  const filtradas = useMemo(() => {
    if (filtro === 'todas') return visibles
    return visibles.filter((n) => getCategoriaDeTipo(n.tipo) === filtro)
  }, [visibles, filtro])

  const gruposPorFecha = useMemo(() => agruparPorFecha(filtradas), [filtradas])
  const noLeidas = notificaciones.filter((n) => !n.leida).length

  if (error) {
    return (
      <LayoutPaginaPrincipal titulo="Notificaciones" nav={NAV_NOTIFICACIONES}>
        <p className="notif-error">{error}</p>
      </LayoutPaginaPrincipal>
    )
  }

  return (
    <LayoutPaginaPrincipal
      activo="notificaciones"
      titulo="Notificaciones"
      nav={NAV_NOTIFICACIONES}
      acciones={
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton variant="ghost" aria-label="Opciones" size="sm">
              <MoreVertical size={18} />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="marcar-todas" onSelect={marcarTodasLeidas} disabled={noLeidas === 0}>
                  Marcar todas leídas {noLeidas > 0 && `(${noLeidas})`}
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      }
    >
      <div className="notif-page">
        <div className="notif-container">
          {/* Filtro por categoría */}
          <Tabs.Root
            value={filtro}
            onValueChange={(e) => setFiltro(e.value)}
            variant="line"
            colorPalette="blue"
            className="notif-tabs"
          >
            <Tabs.List>
              <Tabs.Trigger value="todas">
                Todas
                {conteosPorCategoria.todas > 0 && (
                  <Badge ml="1" size="sm" variant="subtle">
                    {conteosPorCategoria.todas}
                  </Badge>
                )}
              </Tabs.Trigger>
              {ORDEN_CATEGORIAS.map((catId) => {
                const cat = CATEGORIAS[catId]
                return (
                  <Tabs.Trigger key={catId} value={catId}>
                    {cat.nombre}
                    {conteosPorCategoria[catId] > 0 && (
                      <Badge ml="1" size="sm" variant="subtle" colorPalette={cat.color}>
                        {conteosPorCategoria[catId]}
                      </Badge>
                    )}
                  </Tabs.Trigger>
                )
              })}
            </Tabs.List>
          </Tabs.Root>

          {/* Preferencias: silenciar categorías */}
          <Accordion.Root collapsible className="notif-accordion">
            <Accordion.Item value="preferencias">
              <Accordion.ItemTrigger className="notif-accordion__trigger">
                <Text>Preferencias de notificación</Text>
                <ChevronDown size={16} className="notif-accordion__chevron" />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody className="notif-preferencias">
                  {ORDEN_CATEGORIAS.map((catId) => {
                    const cat = CATEGORIAS[catId]
                    return (
                      <Switch.Root
                        key={catId}
                        checked={!silenciadas.includes(catId)}
                        onCheckedChange={(e) => toggleSilenciar(catId, !e.checked)}
                        colorPalette={cat.color}
                        className="notif-preferencias__item"
                      >
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <Switch.Label>{cat.nombre}</Switch.Label>
                      </Switch.Root>
                    )
                  })}
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>

            {/* Leyenda: qué significa cada tipo */}
            <Accordion.Item value="leyenda">
              <Accordion.ItemTrigger className="notif-accordion__trigger">
                <Text>¿Qué significa cada notificación?</Text>
                <ChevronDown size={16} className="notif-accordion__chevron" />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody className="notif-leyenda">
                  {Object.entries(DESCRIPCION_TIPO).map(([tipo, descripcion]) => {
                    const cat = getConfigTipo(tipo)
                    const Icono = cat.icono
                    return (
                      <div key={tipo} className="notif-leyenda__item">
                        <span className={`notif-icon notif-icon--${cat.color} notif-icon--sm`}>
                          <Icono size={14} />
                        </span>
                        <span className="notif-leyenda__texto">{descripcion}</span>
                      </div>
                    )
                  })}
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>

          {cargando ? (
            <div className="notif-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotifSkeleton key={i} />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="notif-vacio">
              <div className="notif-vacio__icon">🔔</div>
              <h2>No tienes notificaciones{filtro !== 'todas' ? ' en esta categoría' : ''}</h2>
              <p>Aquí verás novedades sobre tus órdenes y tu cuenta.</p>
            </div>
          ) : (
            gruposPorFecha.map(([grupo, items]) => (
              <div key={grupo} className="notif-grupo">
                <p className="notif-grupo__titulo">{grupo}</p>
                <div className="notif-list">
                  {items.map((notif) => (
                    <TarjetaNotificacion key={notif.id} notif={notif} onClick={handleClick} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default Notificaciones
