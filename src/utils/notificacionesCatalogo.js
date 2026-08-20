import { Package, DollarSign, MessageCircle, Info, AlertTriangle } from 'lucide-react'

// ---------------------------------------------------------------
// Catálogo de tipos de notificación. Es estático porque los tipos
// que emite el backend son siempre los mismos (ver
// notificaciones.controller.js / crearNotificacion) — no tiene
// sentido traerlo del servidor.
//
// Cualquier tipo nuevo que no esté acá cae en la categoría
// 'sistema' automáticamente (ver getCategoriaDeTipo), así que
// agregar un tipo nuevo en el backend nunca rompe esta página —
// solo conviene agregarlo aquí después para que tenga su propio
// ícono/descripción.
// ---------------------------------------------------------------

export const CATEGORIAS = {
  ordenes: {
    id: 'ordenes',
    nombre: 'Órdenes',
    color: 'blue',
    icono: Package,
    tipos: ['orden_creada', 'orden_confirmada', 'orden_enviada', 'orden_entregada', 'orden_cancelada', 'estado_cambiado'],
  },
  pagos: {
    id: 'pagos',
    nombre: 'Pagos',
    color: 'green',
    icono: DollarSign,
    tipos: ['pago_recibido', 'pago_rechazado'],
  },
  chat: {
    id: 'chat',
    nombre: 'Chat',
    color: 'purple',
    icono: MessageCircle,
    tipos: ['chat_mensaje'],
  },
  credito: {
    id: 'credito',
    nombre: 'Crédito',
    color: 'orange',
    icono: AlertTriangle,
    tipos: ['orden_por_vencer', 'orden_vencida'],
  },
  sistema: {
    id: 'sistema',
    nombre: 'Sistema',
    color: 'gray',
    icono: Info,
    tipos: ['sistema'],
  },
}

export const ORDEN_CATEGORIAS = ['ordenes', 'pagos', 'chat', 'credito', 'sistema']

// Una línea explicando qué significa cada tipo — para la leyenda.
export const DESCRIPCION_TIPO = {
  orden_creada: 'Registramos un nuevo pedido en tu cuenta.',
  orden_confirmada: 'Tu pedido fue confirmado.',
  orden_enviada: 'Tu pedido salió rumbo a destino.',
  orden_entregada: 'Tu pedido fue entregado con éxito.',
  orden_cancelada: 'Tu pedido fue cancelado.',
  estado_cambiado: 'Tu pedido avanzó a un nuevo estado.',
  pago_recibido: 'Registramos un pago en tu cuenta.',
  pago_rechazado: 'Un pago reportado no pudo verificarse.',
  chat_mensaje: 'Tienes una respuesta nueva en el Centro de Comunicaciones.',
  orden_por_vencer: 'Una orden a crédito está por vencer.',
  orden_vencida: 'Una orden a crédito venció sin registrar el pago.',
  sistema: 'Aviso general de la plataforma.',
}

export function getCategoriaDeTipo(tipo) {
  for (const cat of Object.values(CATEGORIAS)) {
    if (cat.tipos.includes(tipo)) return cat.id
  }
  return 'sistema'
}

export function getConfigTipo(tipo) {
  const categoriaId = getCategoriaDeTipo(tipo)
  return CATEGORIAS[categoriaId]
}
