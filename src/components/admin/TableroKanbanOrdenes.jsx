import { useMemo, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  useDroppable, useDraggable,
} from '@dnd-kit/core'
import './TableroKanbanOrdenes.css'

// ---------------------------------------------------------------
// Tablero Kanban con drag real de órdenes por estado (DESKTOP).
// En mobile se usa TableroSwipeOrdenes en su lugar — ver wiring
// en OrdenesAdmin.jsx.
//
// Reusa el mismo endpoint que el modal: PATCH /orders/:id/estado
// vía handleCambiarEstado, que viene del padre.
//
// 'cancelado' no es columna acá — es una acción aparte del modal.
//
// Fila 1: 'pedido_creado' sola, ancho completo, bandeja de entrada.
// Fila 2: 'procesando' | 'preparando' | 'enviado', trabajo en curso.
// 'entregado' es módulo aparte (droppable, resumen, no lista tarjetas).
// ---------------------------------------------------------------

const FILA_SUPERIOR = ['pedido_creado']
const FILA_INFERIOR = ['procesando', 'preparando', 'enviado']
const ESTADO_TERMINAL = 'entregado'
const COLUMNAS = [...FILA_SUPERIOR, ...FILA_INFERIOR, ESTADO_TERMINAL]

function formatUSD(valor) {
  return `$${Number(valor || 0).toFixed(2)}`
}

function TarjetaOrden({ orden, onAbrir }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(orden.id),
    data: { orden },
  })

  // Sin transform manual acá: cuando se usa DragOverlay, la tarjeta
  // fuente NO debe moverse — solo se oculta. El overlay es el único
  // que sigue el puntero. Mezclar los dos causaba el salto al agarrarla.
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`kanban-tarjeta ${isDragging ? 'kanban-tarjeta--arrastrando' : ''}`}
      onClick={() => !isDragging && onAbrir(orden)}
    >
      <span className="kanban-tarjeta__id">#{orden.id}</span>
      <span className="kanban-tarjeta__cliente">{orden.users?.nombre || 'Cliente'}</span>
      <span className="kanban-tarjeta__total">{formatUSD(orden.total_usd)}</span>
    </div>
  )
}

function ColumnaKanban({ estado, label, color, ordenes, onAbrir, ancha }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })

  return (
    <div className={`kanban-columna ${ancha ? 'kanban-columna--ancha' : ''}`}>
      <div className="kanban-columna__cabecera">
        <span className="kanban-columna__punto" style={{ background: color }} />
        <span className="kanban-columna__titulo">{label}</span>
        <span className="kanban-columna__contador">{ordenes.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`kanban-columna__cuerpo ${ancha ? 'kanban-columna__cuerpo--horizontal' : ''} ${isOver ? 'kanban-columna__cuerpo--sobre' : ''}`}
      >
        {ordenes.length === 0 ? (
          <p className="kanban-columna__vacio">Sin órdenes</p>
        ) : (
          ordenes.map((orden) => (
            <TarjetaOrden key={orden.id} orden={orden} onAbrir={onAbrir} />
          ))
        )}
      </div>
    </div>
  )
}

function ModuloEntregado({ label, color, cantidad, totalUsd, isOver, setNodeRef }) {
  return (
    <div ref={setNodeRef} className={`kanban-entregado ${isOver ? 'kanban-entregado--sobre' : ''}`}>
      <span className="kanban-entregado__punto" style={{ background: color }} />
      <div className="kanban-entregado__texto">
        <span className="kanban-entregado__titulo">{label}</span>
        <span className="kanban-entregado__ayuda">Soltá una orden acá para marcarla como entregada</span>
      </div>
      <div className="kanban-entregado__stats">
        <span className="kanban-entregado__cantidad">{cantidad}</span>
        <span className="kanban-entregado__total">{formatUSD(totalUsd)}</span>
      </div>
    </div>
  )
}

export default function TableroKanbanOrdenes({ ordenes, estadoColores, onCambiarEstado, onAbrirOrden }) {
  const [ordenActiva, setOrdenActiva] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const columnas = useMemo(() => {
    return [...FILA_SUPERIOR, ...FILA_INFERIOR].map((estado) => ({
      estado,
      label: estadoColores[estado]?.label || estado,
      color: estadoColores[estado]?.color,
      ordenes: ordenes
        .filter((o) => o.estado === estado)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    }))
  }, [ordenes, estadoColores])

  const columnasPorEstado = useMemo(() => {
    const mapa = {}
    columnas.forEach((col) => { mapa[col.estado] = col })
    return mapa
  }, [columnas])

  const resumenEntregado = useMemo(() => {
    const ordenesEntregadas = ordenes.filter((o) => o.estado === ESTADO_TERMINAL)
    return {
      cantidad: ordenesEntregadas.length,
      totalUsd: ordenesEntregadas.reduce((sum, o) => sum + Number(o.total_usd || 0), 0),
    }
  }, [ordenes])

  const { setNodeRef: setNodeRefEntregado, isOver: isOverEntregado } = useDroppable({ id: ESTADO_TERMINAL })

  function handleDragStart(event) {
    const orden = event.active.data.current?.orden
    setOrdenActiva(orden || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setOrdenActiva(null)
    if (!over) return

    const ordenId = Number(active.id)
    const nuevoEstado = over.id
    const ordenActual = ordenes.find((o) => o.id === ordenId)

    if (ordenActual && ordenActual.estado !== nuevoEstado && COLUMNAS.includes(nuevoEstado)) {
      onCambiarEstado(ordenId, nuevoEstado)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      autoScroll={{ layoutShiftCompensation: false }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-tablero">
        <div className="kanban-fila kanban-fila--superior">
          {FILA_SUPERIOR.map((estado) => (
            <ColumnaKanban
              key={estado}
              estado={estado}
              label={columnasPorEstado[estado].label}
              color={columnasPorEstado[estado].color}
              ordenes={columnasPorEstado[estado].ordenes}
              onAbrir={onAbrirOrden}
              ancha
            />
          ))}
        </div>

        <div className="kanban-fila kanban-fila--inferior">
          {FILA_INFERIOR.map((estado) => (
            <ColumnaKanban
              key={estado}
              estado={estado}
              label={columnasPorEstado[estado].label}
              color={columnasPorEstado[estado].color}
              ordenes={columnasPorEstado[estado].ordenes}
              onAbrir={onAbrirOrden}
            />
          ))}
        </div>

        <ModuloEntregado
          label={estadoColores[ESTADO_TERMINAL]?.label || 'Entregado'}
          color={estadoColores[ESTADO_TERMINAL]?.color}
          cantidad={resumenEntregado.cantidad}
          totalUsd={resumenEntregado.totalUsd}
          isOver={isOverEntregado}
          setNodeRef={setNodeRefEntregado}
        />
      </div>

      <DragOverlay>
        {ordenActiva && (
          <div className="kanban-tarjeta kanban-tarjeta--overlay">
            <span className="kanban-tarjeta__id">#{ordenActiva.id}</span>
            <span className="kanban-tarjeta__cliente">{ordenActiva.users?.nombre || 'Cliente'}</span>
            <span className="kanban-tarjeta__total">{formatUSD(ordenActiva.total_usd)}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}