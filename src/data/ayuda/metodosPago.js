const metodosPago = {
  etiqueta: 'Pagos',
  etiquetaIcono: 'CreditCard',
  titulo: 'Métodos de pago aceptados',
  subtitulo: 'Transferencia bancaria y pago móvil.',
  tipo: 'lista',
  contenido: [
    {
      icono: 'CreditCard',
      titulo: 'Transferencia bancaria',
      texto: 'Realiza una transferencia a nuestra cuenta bancaria. Los datos se envían al confirmar tu orden. Incluye el número de orden en el concepto.',
    },
    {
      icono: 'CreditCard',
      titulo: 'Pago móvil',
      texto: 'Envía tu pago móvil a nuestro número registrado. Adjunta el comprobante de pago para confirmación más rápida.',
    },
    {
      icono: 'FileText',
      titulo: 'Crédito directo',
      texto: 'Si tienes línea de crédito con nosotros, tu compra se registra automáticamente y se descuenta al realizar un pago.',
    },
  ],
}

export default metodosPago
