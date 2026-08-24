// src/utils/generarFacturaPDF.js
//
// Genera el PDF de una factura individual con el mismo lenguaje visual
// del estado de cuenta: membrete de la empresa, tarjeta "Facturado a",
// tabla de productos y total destacado.
//
// Uso:
//   import generarFacturaPDF from '../utils/generarFacturaPDF'
//   await generarFacturaPDF({ factura, cliente })
//
// `factura` es un registro tal como lo devuelve GET /:id/estado-cuenta:
//   { numero_factura, monto_facturado, created_at, nota, estado,
//     factura_ordenes: [{ orden_id, ordenes: { id, ordenes_items: [...] } }] }
//
// Los nombres de campo de cada línea de producto (ordenes_items) pueden
// variar según tu esquema real — el helper `leerItem()` de abajo intenta
// varios nombres comunes (cantidad, precio_unitario_usd, subtotal,
// productos.nombre_comercial). Ajusta esa función si tus columnas se
// llaman distinto.

import empresaInfo from '../config/empresa'

const COLOR_INDIGO = [26, 26, 58]
const COLOR_AZUL = [0, 82, 220]
const COLOR_GRIS_CLARO = [246, 247, 250]
const COLOR_BORDE = [223, 226, 235]
const COLOR_TEXTO = [30, 31, 45]
const COLOR_MUTED = [110, 113, 133]
const COLOR_VERDE = [21, 128, 61]
const COLOR_AMBAR = [180, 120, 10]
const COLOR_BLANCO = [255, 255, 255]

const MARGEN = 14
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatFechaLarga(fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Normaliza una línea de ordenes_items a { nombre, cantidad, precioUnit, subtotal }
// probando varios nombres de columna posibles.
function leerItem(item) {
  const nombre = item.productos?.nombre_comercial || item.nombre || item.descripcion || 'Producto'
  const cantidad = Number(item.cantidad ?? item.qty ?? 1)
  const subtotal = Number(item.subtotal ?? item.total ?? item.monto ?? 0)
  const precioUnit = Number(item.precio_unitario_usd ?? item.precio_unitario ?? (cantidad ? subtotal / cantidad : 0))
  return { nombre, cantidad, precioUnit, subtotal }
}

function extraerItems(factura) {
  const items = []
  ;(factura.factura_ordenes || []).forEach((fo) => {
    ;(fo.ordenes?.ordenes_items || []).forEach((item) => items.push(leerItem(item)))
  })
  return items
}

export default async function generarFacturaPDF({ factura, cliente }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  dibujarMembrete(doc)
  let y = dibujarTituloFactura(doc, factura)
  y = dibujarTarjetaCliente(doc, cliente, y)

  const items = extraerItems(factura)
  y = dibujarTablaItems(doc, items, y)

  y = dibujarTotal(doc, factura, items, y)

  if (factura.nota) {
    y = dibujarNota(doc, factura.nota, y)
  }

  dibujarPiePagina(doc)

  doc.save(`factura-${factura.numero_factura}.pdf`)
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

function dibujarTituloFactura(doc, factura) {
  const y = 46

  doc.setTextColor(...COLOR_INDIGO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('FACTURA', MARGEN, y)

  doc.setFontSize(11)
  doc.setTextColor(...COLOR_AZUL)
  doc.text(`N.° ${factura.numero_factura}`, MARGEN, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_MUTED)
  doc.text(`Fecha de emisión: ${formatFechaLarga(factura.created_at)}`, MARGEN, y + 13)

  // Badge de estado, arriba a la derecha
  const estado = factura.estado || 'pendiente'
  const esPagada = estado === 'pagada'
  const colorBadge = esPagada ? COLOR_VERDE : COLOR_AMBAR
  const textoBadge = esPagada ? 'PAGADA' : estado.toUpperCase()
  const anchoBadge = doc.getTextWidth(textoBadge) + 10

  doc.setFillColor(...colorBadge)
  doc.roundedRect(ANCHO_PAGINA - MARGEN - anchoBadge, y - 5, anchoBadge, 7, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_BLANCO)
  doc.text(textoBadge, ANCHO_PAGINA - MARGEN - anchoBadge / 2, y - 0.5, { align: 'center' })

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
  doc.text('FACTURADO A', MARGEN + 5, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_TEXTO)
  doc.text(cliente?.nombre || 'Cliente', MARGEN + 5, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_MUTED)
  const detalle = [cliente?.rif_cedula, cliente?.email].filter(Boolean).join('   ·   ')
  if (detalle) doc.text(detalle, MARGEN + 5, y + 18)

  return y + alto + 8
}

const COLS_ITEM = [
  { label: 'Producto', x: MARGEN, ancho: 90 },
  { label: 'Cant.', x: MARGEN + 100, ancho: 18, align: 'right' },
  { label: 'Precio unit.', x: MARGEN + 140, ancho: 25, align: 'right' },
  { label: 'Subtotal', x: MARGEN + ANCHO_CONTENIDO, ancho: 30, align: 'right' },
]

function dibujarEncabezadoItems(doc, y) {
  doc.setFillColor(...COLOR_INDIGO)
  doc.rect(MARGEN, y, ANCHO_CONTENIDO, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_BLANCO)
  COLS_ITEM.forEach((col) => {
    const x = col.align === 'right' ? col.x : col.x + 2
    doc.text(col.label, x, y + 5.5, col.align === 'right' ? { align: 'right' } : undefined)
  })
  return y + 8
}

function dibujarTablaItems(doc, items, yInicial) {
  let y = yInicial

  if (items.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(
      'Esta factura no tiene el detalle de productos disponible (orden telefónica o sin líneas registradas).',
      MARGEN,
      y + 6,
      { maxWidth: ANCHO_CONTENIDO }
    )
    return y + 16
  }

  y = dibujarEncabezadoItems(doc, y)

  items.forEach((item, i) => {
    if (y > ALTO_PAGINA - 40) {
      doc.addPage()
      y = 16
      y = dibujarEncabezadoItems(doc, y)
    }

    const altoFila = 8
    if (i % 2 === 1) {
      doc.setFillColor(...COLOR_GRIS_CLARO)
      doc.rect(MARGEN, y, ANCHO_CONTENIDO, altoFila, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_TEXTO)
    doc.text(item.nombre, MARGEN + 2, y + 5.5, { maxWidth: 96 })
    doc.text(String(item.cantidad), MARGEN + 118, y + 5.5, { align: 'right' })
    doc.text(formatUSD(item.precioUnit), MARGEN + 165, y + 5.5, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatUSD(item.subtotal), MARGEN + ANCHO_CONTENIDO, y + 5.5, { align: 'right' })

    y += altoFila
  })

  doc.setDrawColor(...COLOR_BORDE)
  doc.line(MARGEN, y, MARGEN + ANCHO_CONTENIDO, y)

  return y + 6
}

function dibujarTotal(doc, factura, items, yInicial) {
  let y = yInicial

  if (y > ALTO_PAGINA - 40) {
    doc.addPage()
    y = 16
  }

  const anchoCaja = 70
  const xCaja = MARGEN + ANCHO_CONTENIDO - anchoCaja

  const sumaItems = items.reduce((s, it) => s + it.subtotal, 0)
  // Si el detalle de items no cuadra con el monto real facturado (o no hay
  // items), se usa siempre monto_facturado como fuente de verdad del total.
  const total = Number(factura.monto_facturado)

  if (items.length > 0 && Math.abs(sumaItems - total) > 0.01) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('Subtotal productos', xCaja, y)
    doc.text(formatUSD(sumaItems), MARGEN + ANCHO_CONTENIDO, y, { align: 'right' })
    y += 6
  }

  doc.setFillColor(...COLOR_INDIGO)
  doc.roundedRect(xCaja, y, anchoCaja, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(215, 219, 235)
  doc.text('TOTAL FACTURADO', xCaja + 5, y + 5.5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_BLANCO)
  doc.text(formatUSD(total), MARGEN + ANCHO_CONTENIDO - 4, y + 11, { align: 'right' })

  return y + 22
}

function dibujarNota(doc, nota, yInicial) {
  let y = yInicial
  if (y > ALTO_PAGINA - 30) {
    doc.addPage()
    y = 16
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_MUTED)
  doc.text('Nota', MARGEN, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLOR_TEXTO)
  doc.text(nota, MARGEN, y + 5, { maxWidth: ANCHO_CONTENIDO })
  return y + 14
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
      `${empresaInfo.nombre} — Documento generado automáticamente, no requiere firma.`,
      MARGEN,
      ALTO_PAGINA - 9
    )
    doc.text(`Página ${i} de ${totalPaginas}`, ANCHO_PAGINA - MARGEN, ALTO_PAGINA - 9, { align: 'right' })
  }
}
