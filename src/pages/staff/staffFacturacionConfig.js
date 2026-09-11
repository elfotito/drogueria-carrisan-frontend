// Helpers compartidos del módulo Facturación (staff).
// Archivo de solo funciones para no romper fast-refresh (react-refresh).
export function tipoDocumento(tipo) {
  if (tipo === 'nota_credito') return 'Nota de crédito'
  if (tipo === 'nota_debito') return 'Nota de débito'
  if (tipo === 'recibo_cobro') return 'Recibo de cobro'
  return 'Factura'
}