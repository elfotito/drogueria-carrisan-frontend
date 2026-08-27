const estadoDeCuenta = {
  etiqueta: 'Tu Cuenta',
  etiquetaIcono: 'TrendingUp',
  titulo: 'Estado de cuenta y línea de crédito',
  subtitulo: 'Consulta tu saldo, facturas y crédito disponible.',
  tipo: 'lista',
  contenido: [
    {
      icono: 'CreditCard',
      titulo: 'Línea de crédito disponible',
      texto: 'Revisa cuánto crédito tienes disponible para compras a crédito. El monto se actualiza automáticamente con cada pago.',
    },
    {
      icono: 'FileText',
      titulo: 'Historial de facturas',
      texto: 'Consulta y descarga todas tus facturas organizadas por fecha y monto, con el detalle de cada compra.',
    },
    {
      icono: 'TrendingUp',
      titulo: 'Pagos registrados',
      texto: 'Verifica los pagos que has realizado y cómo se reflejan en tu saldo. Cada pago se acredita según el método utilizado.',
    },
    {
      icono: 'CheckCircle2',
      titulo: 'Ampliación de crédito',
      texto: 'Si tu historial lo respalda, puedes solicitar un aumento de tu línea de crédito desde la plataforma.',
    },
  ],
}

export default estadoDeCuenta
