// src/utils/generarReporteEstadoCuentaPDF.js
//
// Genera el PDF del "Estado de Cuenta" con formato corporativo tipo banco:
// membrete con datos de la empresa, tarjeta con datos del cliente, tarjetas
// de resumen (línea de crédito / deuda / saldo), tabla de movimientos del
// período (facturas y pagos) con totales, y pie de página con numeración.
//
// Uso (desde ReportesEstadoCuenta.jsx):
//
//   import generarReporteEstadoCuentaPDF from '../utils/generarReporteEstadoCuentaPDF'
//
//   await generarReporteEstadoCuentaPDF({
//     cliente: datos.cliente,        // { nombre, email, rif_cedula?, direccion_fiscal?, telefono? }
//     resumen: datos.resumen,        // { linea_credito, deuda_actual, saldo }
//     facturas: preview.facturas,    // ya filtradas por período
//     pagos: preview.pagos,          // ya filtradas por período
//     ordenes: preview.ordenes,      // órdenes pendientes en el período
//     desde,
//     hasta,
//   })
//
// Nota: `cliente.rif_cedula`, `cliente.direccion_fiscal` y `cliente.telefono`
// no vienen todavía en la respuesta de GET /:id/estado-cuenta (el backend
// solo selecciona id, nombre, email, linea_credito). Si no existen, esas
// líneas simplemente no se imprimen en la tarjeta del cliente. Para que
// aparezcan, agrega esos campos al `.select()` de getEstadoCuenta en
// estadocuenta.controller.js.

import empresaInfo from '../config/empresa'

const COLOR_INDIGO = [26, 26, 58]
const COLOR_AZUL = [0, 82, 220]
const COLOR_GRIS_CLARO = [246, 247, 250]
const COLOR_BORDE = [223, 226, 235]
const COLOR_TEXTO = [30, 31, 45]
const COLOR_MUTED = [110, 113, 133]
const COLOR_VERDE = [21, 128, 61]
const COLOR_ROJO = [190, 30, 45]
const COLOR_BLANCO = [255, 255, 255]

const MARGEN = 14
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatFecha(fechaISO) {
  const f = new Date(fechaISO)
  return f.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatFechaLarga(fechaISO) {
  const f = new Date(fechaISO)
  return f.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function generarReporteEstadoCuentaPDF({
  cliente,
  resumen,
  facturas = [],
  pagos = [],
  ordenes = [],
  desde,
  hasta,
}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  dibujarMembrete(doc)
  let y = dibujarTitulo(doc, desde, hasta)
  y = dibujarTarjetaCliente(doc, cliente, y)
  y = dibujarResumen(doc, resumen, y)
  y = dibujarTablaMovimientos(doc, facturas, pagos, y)

  if (ordenes.length > 0) {
    y = dibujarOrdenesPendientes(doc, ordenes, y)
  }

  dibujarPiePagina(doc)

  const nombreArchivo = `estado-de-cuenta-${desde}-a-${hasta}.pdf`
  doc.save(nombreArchivo)
}

// ---------------------------------------------------------------
// Membrete — banda superior con los datos de la empresa
// ---------------------------------------------------------------
function dibujarMembrete(doc) {
  doc.setFillColor(...COLOR_INDIGO)
  doc.rect(0, 0, ANCHO_PAGINA, 32, 'F')

  doc.setFillColor(...COLOR_AZUL)
  doc.rect(0, 32, ANCHO_PAGINA, 1.4, 'F')

  if (empresaInfo.logoBase64) {
    try {
      doc.addImage(empresaInfo.logoBase64, 'PNG', MARGEN, 8, 16, 16)
    } catch {
      // si el base64 no es válido, seguimos sin logo en vez de romper el PDF
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

  // Datos de contacto, alineados a la derecha
  doc.setFontSize(8)
  doc.text(`RIF: ${empresaInfo.rif}`, ANCHO_PAGINA - MARGEN, 12, { align: 'right' })
  doc.text(empresaInfo.telefono, ANCHO_PAGINA - MARGEN, 17, { align: 'right' })
  doc.text(empresaInfo.email, ANCHO_PAGINA - MARGEN, 22, { align: 'right' })
  doc.text(empresaInfo.direccion, ANCHO_PAGINA - MARGEN, 27, { align: 'right', maxWidth: 90 })
}

// ---------------------------------------------------------------
// Título del documento + período + fecha de generación
// ---------------------------------------------------------------
function dibujarTitulo(doc, desde, hasta) {
  const y = 44

  doc.setTextColor(...COLOR_INDIGO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('Estado de Cuenta', MARGEN, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_MUTED)
  doc.text(
    `Período: ${formatFechaLarga(desde)} — ${formatFechaLarga(hasta)}`,
    ANCHO_PAGINA - MARGEN,
    y - 4,
    { align: 'right' }
  )
  const ahora = new Date()
  doc.text(
    `Generado: ${formatFecha(ahora)} ${ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`,
    ANCHO_PAGINA - MARGEN,
    y + 1,
    { align: 'right' }
  )

  return y + 8
}

// ---------------------------------------------------------------
// Tarjeta con los datos del cliente
// ---------------------------------------------------------------
function dibujarTarjetaCliente(doc, cliente, yInicial) {
  const alto = 24
  const y = yInicial

  doc.setDrawColor(...COLOR_BORDE)
  doc.setFillColor(...COLOR_GRIS_CLARO)
  doc.roundedRect(MARGEN, y, ANCHO_CONTENIDO, alto, 2, 2, 'FD')

  const xIzq = MARGEN + 5
  const xDer = MARGEN + ANCHO_CONTENIDO / 2 + 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_TEXTO)
  doc.text(cliente?.nombre || 'Cliente', xIzq, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_MUTED)

  const lineasIzq = []
  if (cliente?.rif_cedula) lineasIzq.push(`RIF / Cédula: ${cliente.rif_cedula}`)
  if (cliente?.direccion_fiscal) lineasIzq.push(cliente.direccion_fiscal)
  lineasIzq.forEach((linea, i) => doc.text(linea, xIzq, y + 13 + i * 4.5, { maxWidth: ANCHO_CONTENIDO / 2 - 10 }))

  const lineasDer = []
  if (cliente?.email) lineasDer.push(`Correo: ${cliente.email}`)
  if (cliente?.telefono) lineasDer.push(`Teléfono: ${cliente.telefono}`)
  lineasDer.forEach((linea, i) => doc.text(linea, xDer, y + 13 + i * 4.5, { maxWidth: ANCHO_CONTENIDO / 2 - 10 }))

  return y + alto + 8
}

// ---------------------------------------------------------------
// Tarjetas de resumen: línea de crédito / deuda actual / saldo
// ---------------------------------------------------------------
function dibujarResumen(doc, resumen, yInicial) {
  const y = yInicial
  const alto = 22
  const gap = 4
  const anchoTarjeta = (ANCHO_CONTENIDO - gap * 2) / 3

  const tarjetas = [
    { label: 'Línea de crédito', valor: resumen?.linea_credito, color: COLOR_INDIGO },
    { label: 'Deuda actual', valor: resumen?.deuda_actual, color: COLOR_ROJO },
    {
      label: 'Saldo disponible',
      valor: resumen?.saldo,
      color: (resumen?.saldo ?? 0) >= 0 ? COLOR_VERDE : COLOR_ROJO,
    },
  ]

  tarjetas.forEach((t, i) => {
    const x = MARGEN + i * (anchoTarjeta + gap)
    doc.setDrawColor(...COLOR_BORDE)
    doc.setFillColor(...COLOR_BLANCO)
    doc.roundedRect(x, y, anchoTarjeta, alto, 2, 2, 'FD')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(t.label.toUpperCase(), x + 5, y + 8)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12.5)
    doc.setTextColor(...t.color)
    doc.text(formatUSD(t.valor), x + 5, y + 17)
  })

  return y + alto + 10
}

// ---------------------------------------------------------------
// Tabla de movimientos del período (facturas + pagos)
// ---------------------------------------------------------------
const COLS = [
  { key: 'fecha', label: 'Fecha', x: MARGEN, ancho: 20 },
  { key: 'tipo', label: 'Tipo', x: MARGEN + 20, ancho: 20 },
  { key: 'descripcion', label: 'Descripción', x: MARGEN + 40, ancho: 78 },
  { key: 'referencia', label: 'Referencia', x: MARGEN + 118, ancho: 30 },
  { key: 'monto', label: 'Monto', x: MARGEN + ANCHO_CONTENIDO, ancho: 34, align: 'right' },
]

function dibujarEncabezadoTabla(doc, y) {
  doc.setFillColor(...COLOR_INDIGO)
  doc.rect(MARGEN, y, ANCHO_CONTENIDO, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_BLANCO)
  COLS.forEach((col) => {
    const x = col.align === 'right' ? col.x : col.x + 2
    doc.text(col.label, x, y + 5.5, col.align === 'right' ? { align: 'right' } : undefined)
  })
  return y + 8
}

function dibujarTablaMovimientos(doc, facturas, pagos, yInicial) {
  let y = yInicial

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_INDIGO)
  doc.text('Movimientos del período', MARGEN, y)
  y += 5

  const movimientos = [
    ...facturas.map((f) => ({
      fecha: f.created_at,
      tipo: 'Factura',
      descripcion: f.nota ? `Factura #${f.numero_factura} — ${f.nota}` : `Factura #${f.numero_factura}`,
      referencia: `#${f.numero_factura}`,
      monto: Number(f.monto_facturado),
      signo: -1,
      color: COLOR_ROJO,
    })),
    ...pagos.map((p) => ({
      fecha: p.created_at,
      tipo: 'Pago',
      descripcion: p.detalle ? `Abono registrado — ${p.detalle}` : 'Abono registrado',
      referencia: `Pago #${p.id}`,
      monto: Number(p.monto),
      signo: 1,
      color: COLOR_VERDE,
    })),
  ].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  if (movimientos.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('No hay movimientos registrados en este período.', MARGEN, y + 6)
    return y + 14
  }

  y = dibujarEncabezadoTabla(doc, y)

  let totalFacturado = 0
  let totalPagado = 0

  movimientos.forEach((mov, i) => {
    if (y > ALTO_PAGINA - 30) {
      doc.addPage()
      y = 16
      y = dibujarEncabezadoTabla(doc, y)
    }

    const altoFila = 8
    if (i % 2 === 1) {
      doc.setFillColor(...COLOR_GRIS_CLARO)
      doc.rect(MARGEN, y, ANCHO_CONTENIDO, altoFila, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_TEXTO)
    doc.text(formatFecha(mov.fecha), MARGEN + 2, y + 5.5)
    doc.text(mov.tipo, MARGEN + 22, y + 5.5)
    doc.text(mov.descripcion, MARGEN + 42, y + 5.5, { maxWidth: 74 })
    doc.setTextColor(...COLOR_MUTED)
    doc.text(mov.referencia, MARGEN + 120, y + 5.5, { maxWidth: 28 })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...mov.color)
    const montoTexto = `${mov.signo > 0 ? '+' : '-'} ${formatUSD(mov.monto)}`
    doc.text(montoTexto, MARGEN + ANCHO_CONTENIDO, y + 5.5, { align: 'right' })

    if (mov.signo < 0) totalFacturado += mov.monto
    else totalPagado += mov.monto

    y += altoFila
  })

  doc.setDrawColor(...COLOR_BORDE)
  doc.line(MARGEN, y, MARGEN + ANCHO_CONTENIDO, y)
  y += 6

  // Totales del período
  const anchoTotales = 70
  const xTotales = MARGEN + ANCHO_CONTENIDO - anchoTotales

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_MUTED)
  doc.text('Total facturado', xTotales, y)
  doc.setTextColor(...COLOR_ROJO)
  doc.setFont('helvetica', 'bold')
  doc.text(formatUSD(totalFacturado), MARGEN + ANCHO_CONTENIDO, y, { align: 'right' })
  y += 5.5

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLOR_MUTED)
  doc.text('Total pagado', xTotales, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLOR_VERDE)
  doc.text(formatUSD(totalPagado), MARGEN + ANCHO_CONTENIDO, y, { align: 'right' })
  y += 5.5

  const neto = totalPagado - totalFacturado
  doc.setDrawColor(...COLOR_BORDE)
  doc.line(xTotales, y - 2, MARGEN + ANCHO_CONTENIDO, y - 2)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLOR_TEXTO)
  doc.text('Diferencia neta', xTotales, y + 2)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...(neto >= 0 ? COLOR_VERDE : COLOR_ROJO))
  doc.text(formatUSD(neto), MARGEN + ANCHO_CONTENIDO, y + 2, { align: 'right' })

  return y + 12
}

// ---------------------------------------------------------------
// Órdenes pendientes de facturación dentro del período
// ---------------------------------------------------------------
function dibujarOrdenesPendientes(doc, ordenes, yInicial) {
  let y = yInicial

  if (y > ALTO_PAGINA - 40) {
    doc.addPage()
    y = 16
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_INDIGO)
  doc.text('Órdenes pendientes de facturación en el período', MARGEN, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_TEXTO)

  ordenes.forEach((o) => {
    if (y > ALTO_PAGINA - 20) {
      doc.addPage()
      y = 16
    }
    doc.text(`Orden #${o.id}`, MARGEN + 2, y)
    doc.text(o.forma_pago === 'credito' ? 'Crédito' : 'Contado', MARGEN + 30, y)
    doc.text(formatFecha(o.created_at), MARGEN + 60, y)
    doc.text(formatUSD(o.total_usd), MARGEN + ANCHO_CONTENIDO, y, { align: 'right' })
    y += 5.5
  })

  return y + 6
}

// ---------------------------------------------------------------
// Pie de página en todas las hojas: línea, aviso y numeración
// ---------------------------------------------------------------
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
