import { useMemo, useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  useDroppable, useDraggable,
} from '@dnd-kit/core'
import './TableroKanbanOrdenes.css'

// ---------------------------------------------------------------
// Tablero Kanban con drag real de órdenes por estado. Vive como una
// tercera vista dentro de OrdenesAdmin.jsx (junto a tabla/cards) — el
// dashboard solo enlaza acá, no duplica esta pieza.
//
// Reusa exactamente el mismo endpoint que ya usaba el click-to-change
// del modal: PATCH /orders/:id/estado vía handleCambiarEstado, que
// viene del padre. No hay lógica de negocio nueva acá, solo la
// interacción de arrastrar.
//
// 'cancelado' no es una columna del tablero — cancelar una orden no
// es un paso del flujo, es una acción aparte que ya vive en el modal
// de detalle (igual que en las otras vistas).
// ---------------------------------------------------------------

const COLUMNAS = ['pedido_creado', 'procesando', 'preparando', 'enviado', 'entregado']

function formatUSD(valor) {
  return `$${Number(valor || 0).toFixed(2)}`
}

function TarjetaOrden({ orden, estadoColores, onAbrir }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(orden.id),
    data: { orden },
  })

  const vencida = orden.fecha_vencimiento &&
    new Date(orden.fecha_vencimiento) < new Date() &&
    orden.estado_pago !== 'verificado'

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`kanban-tarjeta ${isDragging ? 'kanban-tarjeta--arrastrando' : ''}`}
      onClick={() => !isDragging && onAbrir(orden)}
    >
      <div className="kanban-tarjeta__cabecera">
        <span className="kanban-tarjeta__id">#{orden.id}</span>
        {vencida && <span className="kanban-tarjeta__vencida">Vencida</span>}
      </div>
      <span className="kanban-tarjeta__cliente">{orden.users?.nombre || 'Cliente'}</span>
      <div className="kanban-tarjeta__pie">
        <span className="kanban-tarjeta__forma-pago">
          {orden.forma_pago === 'credito' ? 'Crédito' : 'Contado'}
        </span>
        <span className="kanban-tarjeta__total">{formatUSD(orden.total_usd)}</span>
      </div>
    </div>
  )
}

function ColumnaKanban({ estado, label, color, ordenes, estadoColores, onAbrir }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })

  return (
    <div className="kanban-columna">
      <div className="kanban-columna__cabecera">
        <span className="kanban-columna__punto" style={{ background: color }} />
        <span className="kanban-columna__titulo">{label}</span>
        <span className="kanban-columna__contador">{ordenes.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`kanban-columna__cuerpo ${isOver ? 'kanban-columna__cuerpo--sobre' : ''}`}
      >
        {ordenes.length === 0 ? (
          <p className="kanban-columna__vacio">Sin órdenes</p>
        ) : (
          ordenes.map((orden) => (
            <TarjetaOrden key={orden.id} orden={orden} estadoColores={estadoColores} onAbrir={onAbrir} />
          ))
        )}
      </div>
    </div>
  )
}

export default function TableroKanbanOrdenes({ ordenes, estadoColores, onCambiarEstado, onAbrirOrden }) {
  const [ordenActiva, setOrdenActiva] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }, // evita que un click simple dispare un drag
    })
  )

  const columnas = useMemo(() => {
    return COLUMNAS.map((estado) => ({
      estado,
      label: estadoColores[estado]?.label || estado,
      color: estadoColores[estado]?.color,
      ordenes: ordenes
        .filter((o) => o.estado === estado)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    }))
  }, [ordenes, estadoColores])

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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-tablero">
        {columnas.map((col) => (
          <ColumnaKanban
            key={col.estado}
            estado={col.estado}
            label={col.label}
            color={col.color}
            ordenes={col.ordenes}
            estadoColores={estadoColores}
            onAbrir={onAbrirOrden}
          />
        ))}
      </div>

      <DragOverlay>
        {ordenActiva && (
          <div className="kanban-tarjeta kanban-tarjeta--overlay">
            <div className="kanban-tarjeta__cabecera">
              <span className="kanban-tarjeta__id">#{ordenActiva.id}</span>
            </div>
            <span className="kanban-tarjeta__cliente">{ordenActiva.users?.nombre || 'Cliente'}</span>
            <div className="kanban-tarjeta__pie">
              <span className="kanban-tarjeta__forma-pago">
                {ordenActiva.forma_pago === 'credito' ? 'Crédito' : 'Contado'}
              </span>
              <span className="kanban-tarjeta__total">{formatUSD(ordenActiva.total_usd)}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}