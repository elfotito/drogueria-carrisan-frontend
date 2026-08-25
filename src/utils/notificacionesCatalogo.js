import {
  Package, Truck, CheckCircle, XCircle, RotateCcw,
  DollarSign, CreditCard, Ban, FileCheck, FileX,
  MessageCircle, AlertTriangle, Bell, Clock,
  FileText, ClipboardList, ShoppingBag, Info, Megaphone,
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
    tipos: ['documento_listo', 'documento_aprobado', 'documento_rechazado'],
  },
  solicitudes: {
    id: 'solicitudes',
    nombre: 'Solicitudes',
    color: 'cyan',
    icono: ClipboardList,
    tipos: ['cotizacion_respondida', 'cotizacion_rechazada', 'requerimiento_respondido'],
  },
  sistema: {
    id: 'sistema',
    nombre: 'Sistema',
    color: 'gray',
    icono: Info,
    tipos: ['producto_disponible', 'factura_emitida', 'sistema'],
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

export const DESCRIPCION_TIPO = {
  orden_creada: 'Registramos un nuevo pedido en tu cuenta.',
  orden_confirmada: 'Tu pedido fue confirmado.',
  orden_enviada: 'Tu pedido salió rumbo a destino.',
  orden_entregada: 'Tu pedido fue entregado con éxito.',
  orden_cancelada: 'Tu pedido fue cancelado.',
  estado_cambiado: 'Tu pedido avanzó a un nuevo estado.',
  orden_actualizada: 'Tu pedido fue actualizado por el equipo.',
  pago_registrado: 'Se registró un pago en tu cuenta.',
  pago_recibido: 'Registramos un pago en tu cuenta.',
  pago_rechazado: 'Un pago reportado no pudo verificarse.',
  pago_reportado: 'Recibimos tu reporte de pago.',
  pago_verificado: 'Tu pago fue verificado exitosamente.',
  chat_mensaje: 'Tenés una respuesta nueva en el Centro de Comunicaciones.',
  orden_por_vencer: 'Una orden a crédito está por vencer.',
  orden_vencida: 'Una orden a crédito venció sin registrar el pago.',
  documento_listo: 'Tu documento está listo para descargar.',
  documento_aprobado: 'Tu solicitud de documento fue aprobada.',
  documento_rechazado: 'Tu solicitud de documento fue rechazada.',
  cotizacion_respondida: 'Tu cotización está lista.',
  cotizacion_rechazada: 'No fue posible cotizar tu producto.',
  requerimiento_respondido: 'Tu solicitud de requerimiento está lista.',
  producto_disponible: 'Un producto que seguís ya tiene precio disponible.',
  factura_emitida: 'Se emitió una factura nueva en tu cuenta.',
  sistema: 'Aviso general de la plataforma.',
  oferta: 'Tenés una oferta o promoción especial para vos.',
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
    if (cat.tipos.includes(tipo)) return cat.id
  }
  return 'sistema'
}

export function getConfigTipo(tipo) {
  const categoriaId = getCategoriaDeTipo(tipo)
  return CATEGORIAS[categoriaId]
}

export function getIconoTipo(tipo) {
  return ICONOS_POR_TIPO[tipo] || CATEGORIAS[getCategoriaDeTipo(tipo)].icono
}
