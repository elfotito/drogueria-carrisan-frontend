import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  DollarSign,
  CreditCard,
  Ban,
  FileCheck,
  FileX,
  MessageCircle,
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  ClipboardList,
  ShoppingBag,
  Info,
  Megaphone,
} from 'lucide-react'

export const CATEGORIAS = {
  ordenes: {
    id: 'ordenes',
    nombre: 'Órdenes',
    color: 'blue',
    icono: Package,
    tipos: [
      'orden_creada',
      'orden_confirmada',
      'orden_enviada',
      'orden_entregada',
      'orden_cancelada',
      'estado_cambiado',
      'orden_actualizada',
    ],
  },

  pagos: {
    id: 'pagos',
    nombre: 'Pagos',
    color: 'green',
    icono: DollarSign,
    tipos: [
      'pago_registrado',
      'pago_recibido',
      'pago_rechazado',
      'pago_reportado',
      'pago_verificado',
    ],
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

  documentos: {
    id: 'documentos',
    nombre: 'Documentos',
    color: 'teal',
    icono: FileText,
    tipos: [
      'documento_listo',
      'documento_aprobado',
      'documento_rechazado',
    ],
  },

  solicitudes: {
    id: 'solicitudes',
    nombre: 'Solicitudes',
    color: 'cyan',
    icono: ClipboardList,
    tipos: [
      'cotizacion_respondida',
      'cotizacion_rechazada',
      'requerimiento_respondido',
    ],
  },

  sistema: {
    id: 'sistema',
    nombre: 'Sistema',
    color: 'gray',
    icono: Info,
    tipos: [
      'producto_disponible',
      'factura_emitida',
      'sistema',
    ],
  },

  ofertas: {
    id: 'ofertas',
    nombre: 'Ofertas',
    color: 'red',
    icono: Megaphone,
    tipos: ['oferta'],
  },
}

export const ORDEN_CATEGORIAS = Object.keys(CATEGORIAS)

/**
 * Descripción general que se muestra dentro del acordeón
 * "¿Qué significa cada notificación?"
 *
 * Las descripciones están agrupadas por categoría para evitar
 * repetir una explicación por cada tipo de notificación.
 */
export const DESCRIPCION_CATEGORIA = {
  ordenes:
    'Actualizaciones sobre tus órdenes, desde que se crean hasta que se entregan, cancelan o cambian de estado.',

  pagos:
    'Información sobre los pagos registrados, recibidos, reportados, verificados o rechazados.',

  chat:
    'Avisos cuando recibes nuevos mensajes o respuestas en el Centro de Comunicaciones.',

  credito:
    'Avisos relacionados con órdenes a crédito que están próximas a vencer o que ya vencieron.',

  documentos:
    'Actualizaciones sobre tus documentos, incluyendo cuando están disponibles, aprobados o rechazados.',

  solicitudes:
    'Novedades sobre tus cotizaciones y solicitudes de requerimientos, incluyendo sus respuestas.',

  sistema:
    'Avisos generales de la plataforma, como nuevos productos disponibles, facturas emitidas y otros comunicados.',

  ofertas:
    'Información sobre ofertas, promociones y oportunidades especiales disponibles para ti.',
}

const ICONOS_POR_TIPO = {
  orden_creada: ShoppingBag,
  orden_confirmada: CheckCircle,
  orden_enviada: Truck,
  orden_entregada: CheckCircle,
  orden_cancelada: XCircle,
  estado_cambiado: RotateCcw,
  orden_actualizada: Package,

  pago_registrado: CreditCard,
  pago_recibido: DollarSign,
  pago_rechazado: Ban,
  pago_reportado: Clock,
  pago_verificado: CheckCircle,

  chat_mensaje: MessageCircle,

  orden_por_vencer: Clock,
  orden_vencida: AlertTriangle,

  documento_listo: FileCheck,
  documento_aprobado: CheckCircle,
  documento_rechazado: FileX,

  cotizacion_respondida: CheckCircle,
  cotizacion_rechazada: Ban,
  requerimiento_respondido: CheckCircle,

  producto_disponible: Bell,
  factura_emitida: FileText,

  oferta: Megaphone,
}

export function getCategoriaDeTipo(tipo) {
  for (const cat of Object.values(CATEGORIAS)) {
    if (cat.tipos.includes(tipo)) {
      return cat.id
    }
  }

  return 'sistema'
}

export function getConfigTipo(tipo) {
  const categoriaId = getCategoriaDeTipo(tipo)

  return CATEGORIAS[categoriaId]
}

export function getIconoTipo(tipo) {
  return (
    ICONOS_POR_TIPO[tipo] ||
    CATEGORIAS[getCategoriaDeTipo(tipo)].icono
  )
}
