import * as XLSX from 'xlsx';
import { getLabelEstado } from '../config/estadosOrden'

const AZUL_RGB = [0, 82, 220];

// columnas: [{ header: 'Cliente', key: 'nombre' }, ...]
export function exportToExcel(rows, columnas, filename) {
  const data = rows.map(row => {
    const obj = {};
    columnas.forEach(col => { obj[col.header] = row[col.key]; });
    return obj;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportToPdf(rows, columnas, filename, titulo) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(titulo, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-VE')}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [columnas.map(c => c.header)],
    body: rows.map(row => columnas.map(c => row[c.key])),
    styles: { fontSize: 9 },
    headStyles: { fillColor: AZUL_RGB }
  });

  doc.save(`${filename}.pdf`);
}

// Guía de despacho imprimible para el motorizado. jsPDF + autoTable.
export async function exportarGuiaDespacho(orden) {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const nombre = orden.users?.nombre || 'Cliente'
  const telefono = orden.users?.telefono || ''

  doc.setFontSize(15);
  doc.text('Guía de Despacho', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Orden #${orden.id} — ${new Date(orden.created_at).toLocaleDateString('es-VE')}`, 14, 21);

  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Cliente: ${nombre}`, 14, 30);
  doc.text(telefono ? `Teléfono: ${telefono}` : '', 14, 35);

  const esNacional = orden.tipo_envio === 'envio_nacional'
  if (esNacional) {
    doc.text(`Envío nacional — Agencia: ${orden.agencia_envio || 'sin agencia'}`, 14, 40);
  } else {
    const d = orden.direcciones_envio
    const dir = d ? [d.direccion, d.ciudad, d.estado].filter(Boolean).join(', ') : '—'
    doc.text('Dirección: ' + dir, 14, 40);
  }

  const detalleEnv = orden.tipo_envio === 'delivery'
    ? 'Delivery (moto)'
    : esNacional ? 'Envío nacional' : 'Retiro en tienda'
  const estadoLabel = getLabelEstado(orden.estado, { rol: 'staff', fulfillmentMethod: orden.tipo_envio })
  doc.text(`Envío: ${detalleEnv} — Estado: ${estadoLabel}`, 14, 45);
  doc.text(`Forma de pago: ${orden.forma_pago === 'credito' ? 'Crédito' : 'Contado'}`, 14, 50);

  autoTable(doc, {
    startY: 56,
    head: [['Cant.', 'Producto', 'Precio', 'Subtotal']],
    body: (orden.ordenes_items || []).map((i) => {
      const nombreP = i.productos?.nombre_comercial || `Producto #${i.producto_id}`
      const subtotal = Number(i.precio_unitario || 0) * i.cantidad
      return [String(i.cantidad), nombreP, `$${Number(i.precio_unitario || 0).toFixed(2)}`, `$${subtotal.toFixed(2)}`]
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 82, 220] },
  });

  const totalY = 56 + (orden.ordenes_items?.length || 0) * 8 + 14
  doc.setFontSize(11);
  doc.text(`Total: $${Number(orden.total_usd || 0).toFixed(2)}`, 14, totalY);
  doc.text('Recibí conforme: ____________________', 14, totalY + 20);

  doc.save(`guia-orden-${orden.id}.pdf`);
}