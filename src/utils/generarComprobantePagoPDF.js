// src/utils/generarComprobantePagoPDF.js
//
// Genera el PDF del comprobante de un pago/abono registrado, con el mismo
// lenguaje visual del estado de cuenta y la factura: membrete, tarjeta
// "Recibido de", monto destacado y facturas a las que se aplicó (si las hay).
//
// Uso:
//   import generarComprobantePagoPDF from '../utils/generarComprobantePagoPDF'
//   await generarComprobantePagoPDF({ pago, cliente })
//
// `pago` es un registro tal como lo devuelve GET /:id/estado-cuenta:
//   { id, monto, tipo, detalle, created_at, pago_facturas: [{ factura_id }] }

import empresaInfo from '../config/empresa'

const COLOR_INDIGO = [26, 26, 58]
const COLOR_AZUL = [0, 82, 220]
const COLOR_GRIS_CLARO = [246, 247, 250]
const COLOR_BORDE = [223, 226, 235]
const COLOR_TEXTO = [30, 31, 45]
const COLOR_MUTED = [110, 113, 133]
const COLOR_VERDE = [21, 128, 61]
const COLOR_BLANCO = [255, 255, 255]

const MARGEN = 14
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2

const METODOS = {
  transferencia: 'Transferencia bancaria',
  pago_movil: 'Pago móvil',
  zelle: 'Zelle',
  efectivo: 'Efectivo',
  abono: 'Abono',
  otro: 'Otro',
}

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatFechaLarga(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function generarComprobantePagoPDF({ pago, cliente }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  dibujarMembrete(doc)
  let y = dibujarTituloComprobante(doc, pago)
  y = dibujarTarjetaCliente(doc, cliente, y)
  y = dibujarMontoDestacado(doc, pago, y)
  y = dibujarDetalles(doc, pago, y)

  if (pago.pago_facturas?.length > 0) {
    y = dibujarFacturasAplicadas(doc, pago.pago_facturas, y)
  }

  dibujarPiePagina(doc)

  doc.save(`comprobante-pago-${pago.id}.pdf`)
}

function dibujarMembrete(doc) {
  doc.setFillColor(...COLOR_INDIGO)
  doc.rect(0, 0, ANCHO_PAGINA, 32, 'F')
  doc.setFillColor(...COLOR_AZUL)
  doc.rect(0, 32, ANCHO_PAGINA, 1.4, 'F')

  if (empresaInfo.logoBase64) {
    try {
      doc.addImage(empresaInfo.logoBase64, 'PNG', MARGEN, 8, 16, 16)
    } catch {
      // sin logo si el base64 no es válido
    }
  }
  const xTexto = empresaInfo.logoBase64 ? MARGEN + 20 : MARGEN

  doc.setTextColor(...COLOR_BLANCO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(empresaInfo.nombre, xTexto, 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(215, 219, 235)
  doc.text(empresaInfo.tagline, xTexto, 21)

  doc.setFontSize(8)
  doc.text(`RIF: ${empresaInfo.rif}`, ANCHO_PAGINA - MARGEN, 12, { align: 'right' })
  doc.text(empresaInfo.telefono, ANCHO_PAGINA - MARGEN, 17, { align: 'right' })
  doc.text(empresaInfo.email, ANCHO_PAGINA - MARGEN, 22, { align: 'right' })
  doc.text(empresaInfo.direccion, ANCHO_PAGINA - MARGEN, 27, { align: 'right', maxWidth: 90 })
}

function dibujarTituloComprobante(doc, pago) {
  const y = 46

  doc.setTextColor(...COLOR_INDIGO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('COMPROBANTE DE PAGO', MARGEN, y)

  doc.setFontSize(11)
  doc.setTextColor(...COLOR_AZUL)
  doc.text(`Recibo N.° ${pago.id}`, MARGEN, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_MUTED)
  doc.text(`Fecha: ${formatFechaLarga(pago.created_at)}`, MARGEN, y + 13)

  return y + 20
}

function dibujarTarjetaCliente(doc, cliente, yInicial) {
  const y = yInicial
  const alto = 22

  doc.setDrawColor(...COLOR_BORDE)
  doc.setFillColor(...COLOR_GRIS_CLARO)
  doc.roundedRect(MARGEN, y, ANCHO_CONTENIDO, alto, 2, 2, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLOR_MUTED)
  doc.text('RECIBIDO DE', MARGEN + 5, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_TEXTO)
  doc.text(cliente?.nombre || 'Cliente', MARGEN + 5, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_MUTED)
  const detalle = [cliente?.rif_cedula, cliente?.email].filter(Boolean).join('   ·   ')
  if (detalle) doc.text(detalle, MARGEN + 5, y + 18)

  return y + alto + 10
}

function dibujarMontoDestacado(doc, pago, yInicial) {
  const y = yInicial
  const alto = 30

  doc.setFillColor(...COLOR_VERDE)
  doc.roundedRect(MARGEN, y, ANCHO_CONTENIDO, alto, 3, 3, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(214, 240, 222)
  doc.text('MONTO RECIBIDO', ANCHO_PAGINA / 2, y + 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...COLOR_BLANCO)
  doc.text(formatUSD(pago.monto), ANCHO_PAGINA / 2, y + 22, { align: 'center' })

  return y + alto + 10
}

function dibujarDetalles(doc, pago, yInicial) {
  let y = yInicial

  const filas = [
    ['Método de pago', METODOS[pago.tipo] || pago.tipo || 'No especificado'],
    ['Referencia / detalle', pago.detalle || '—'],
  ]

  filas.forEach(([label, valor]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(label, MARGEN, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLOR_TEXTO)
    doc.text(String(valor), MARGEN + ANCHO_CONTENIDO, y, { align: 'right', maxWidth: 120 })
    y += 7
    doc.setDrawColor(...COLOR_BORDE)
    doc.line(MARGEN, y - 3, MARGEN + ANCHO_CONTENIDO, y - 3)
  })

  return y + 6
}

function dibujarFacturasAplicadas(doc, pagoFacturas, yInicial) {
  let y = yInicial

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...COLOR_INDIGO)
  doc.text('Aplicado a las siguientes facturas', MARGEN, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_TEXTO)

  pagoFacturas.forEach((pf) => {
    if (y > ALTO_PAGINA - 25) {
      doc.addPage()
      y = 16
    }
    doc.setFillColor(...COLOR_GRIS_CLARO)
    doc.roundedRect(MARGEN, y - 4.5, 40, 7, 2, 2, 'F')
    doc.text(`Factura #${pf.factura_id}`, MARGEN + 3, y)
    y += 9
  })

  return y + 4
}

function dibujarPiePagina(doc) {
  const totalPaginas = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setDrawColor(...COLOR_BORDE)
    doc.line(MARGEN, ALTO_PAGINA - 14, ANCHO_PAGINA - MARGEN, ALTO_PAGINA - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(
      `${empresaInfo.nombre} — Gracias por su pago. Este comprobante es válido como constancia de abono.`,
      MARGEN,
      ALTO_PAGINA - 9,
      { maxWidth: 140 }
    )
    doc.text(`Página ${i} de ${totalPaginas}`, ANCHO_PAGINA - MARGEN, ALTO_PAGINA - 9, { align: 'right' })
  }
}
