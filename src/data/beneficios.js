// src/data/beneficios.js
const beneficiosInfo = {
  etiqueta: 'Tu cuenta',
  etiquetaIcono: 'CreditCard',
  titulo: 'Beneficios de tu cuenta',
  subtitulo: 'Todo lo que obtienes al comprar con tu cuenta B2B en Droguería Carrisan.',
  tipo: 'lista',
  contenido: [
    {
      icono: 'CreditCard',
      titulo: 'Línea de crédito propia',
      texto: 'Compra a crédito hasta tu límite disponible, sin pagar de inmediato. El monto se libera automáticamente en cuanto verificamos tu pago.',
    },
    {
      icono: 'TrendingUp',
      titulo: 'Ampliación automática',
      texto: 'Si tu historial de compra lo respalda, puedes solicitar un aumento de tu línea de crédito directamente desde "Estado de cuenta", sin trámites adicionales.',
    },
    {
      icono: 'Truck',
      // TODO: confirmar condición exacta (¿todas las cuentas o solo algunas?)
      titulo: 'Delivery gratis',
      texto: 'Clientes que califican reciben despacho sin costo adicional en sus pedidos.',
    },
    {
      icono: 'Bell',
      titulo: 'Seguimiento en tiempo real',
      texto: 'Te notificamos dentro de la plataforma cada vez que tu pedido cambia de estado, desde que lo confirmas hasta que llega a tu puerta.',
    },
    {
      icono: 'FileText',
      titulo: 'Facturas y estado de cuenta claros',
      texto: 'Consulta y descarga tus facturas y comprobantes de pago cuando quieras, con tu historial completo de movimientos.',
    },
    {
      icono: 'MessageCircle',
      titulo: 'Atención directa por orden',
      texto: 'Cada orden tiene su propio canal de contacto para resolver dudas, reportar novedades o hacer seguimiento puntual.',
    },
  ],
}

export default beneficiosInfo