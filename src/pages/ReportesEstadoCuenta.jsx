import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './HistorialEstadoCuenta.css'

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

const HOY = new Date().toISOString().split('T')[0]
const HACE_30_DIAS = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export default function ReportesEstadoCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [desde, setDesde] = useState(HACE_30_DIAS)
  const [hasta, setHasta] = useState(HOY)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  async function generarReporte() {
    setGenerando(true)
    setError('')
    try {
      const { data } = await api.get(`/clientes/${user.id}/estado-cuenta`)

      const ordenesRango = (data.ordenes_pendientes || []).filter(o => {
        const fecha = o.created_at.split('T')[0]
        return fecha >= desde && fecha <= hasta
      })
      const facturasRango = (data.facturas || []).filter(f => {
        const fecha = f.created_at.split('T')[0]
        return fecha >= desde && fecha <= hasta
      })
      const pagosRango = (data.pagos || []).filter(p => {
        const fecha = p.created_at.split('T')[0]
        return fecha >= desde && fecha <= hasta
      })

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      let y = 20

      doc.setFontSize(16)
      doc.text('Droguería Carrisan', 14, y)
      y += 8
      doc.setFontSize(11)
      doc.text('Estado de Cuenta', 14, y)
      y += 8
      doc.setFontSize(9)
      doc.text(`Cliente: ${data.cliente?.nombre || ''}`, 14, y)
      y += 6
      doc.text(`Período: ${desde} al ${hasta}`, 14, y)
      y += 12

      doc.setFontSize(11)
      doc.text('Resumen', 14, y)
      y += 6
      doc.setFontSize(9)
      doc.text(`Línea de crédito: ${formatUSD(data.resumen.linea_credito)}`, 14, y)
      y += 5
      doc.text(`Deuda actual: ${formatUSD(data.resumen.deuda_actual)}`, 14, y)
      y += 5
      doc.text(`Disponible: ${formatUSD(data.resumen.saldo)}`, 14, y)
      y += 12

      if (ordenesRango.length > 0) {
        doc.setFontSize(11)
        doc.text('Órdenes pendientes en el período', 14, y)
        y += 6
        doc.setFontSize(9)
        ordenesRango.forEach((o) => {
          doc.text(`Orden #${o.id} — ${formatUSD(o.total_usd)} — ${o.created_at.split('T')[0]}`, 14, y)
          y += 5
          if (y > 280) { doc.addPage(); y = 20 }
        })
        y += 6
      }

      if (facturasRango.length > 0) {
        doc.setFontSize(11)
        doc.text('Facturas', 14, y)
        y += 6
        doc.setFontSize(9)
        facturasRango.forEach((f) => {
          doc.text(`Factura #${f.numero_factura} — ${formatUSD(f.monto_facturado)} — ${f.created_at.split('T')[0]}`, 14, y)
          y += 5
          if (y > 280) { doc.addPage(); y = 20 }
        })
        y += 6
      }

      if (pagosRango.length > 0) {
        doc.setFontSize(11)
        doc.text('Pagos', 14, y)
        y += 6
        doc.setFontSize(9)
        pagosRango.forEach((p) => {
          doc.text(`Pago #${p.id} — ${formatUSD(p.monto)} — ${p.created_at.split('T')[0]}`, 14, y)
          y += 5
          if (y > 280) { doc.addPage(); y = 20 }
        })
      }

      doc.save(`estado-cuenta-${desde}-a-${hasta}.pdf`)
    } catch (err) {
      setError('No se pudo generar el reporte')
      console.error(err)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="hec-container">
      <header className="hec-header">
        <button onClick={() => navigate(-1)} className="hec-back"><ArrowLeft size={20} /></button>
        <h1>Reportes</h1>
      </header>

      <div className="rep-form">
        <label className="rep-label">
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} max={hasta} />
        </label>
        <label className="rep-label">
          Hasta
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} min={desde} max={HOY} />
        </label>

        {error && <p className="rep-error">{error}</p>}

        <button className="rep-generar-btn" onClick={generarReporte} disabled={generando}>
          <FileDown size={18} />
          {generando ? 'Generando…' : 'Generar PDF'}
        </button>
      </div>
    </div>
  )
}