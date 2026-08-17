import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './HistorialEstadoCuenta.css'

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

export default function FacturasEstadoCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get(`/clientes/${user.id}/estado-cuenta`)
      .then(({ data }) => setFacturas(data.facturas || []))
      .finally(() => setCargando(false))
  }, [user.id])

  async function exportarPDF(factura) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Droguería Carrisan', 14, 20)
    doc.setFontSize(11)
    doc.text(`Factura #${factura.numero_factura}`, 14, 32)
    doc.text(`Fecha: ${new Date(factura.created_at).toLocaleDateString('es-VE')}`, 14, 40)
    doc.text(`Monto: ${formatUSD(factura.monto_facturado)}`, 14, 48)
    doc.save(`factura-${factura.numero_factura}.pdf`)
  }

  return (
    <div className="hec-container">
      <header className="hec-header">
        <button onClick={() => navigate(-1)} className="hec-back"><ArrowLeft size={20} /></button>
        <h1>Historial de facturas</h1>
      </header>

      {cargando ? (
        <p className="hec-cargando">Cargando…</p>
      ) : facturas.length === 0 ? (
        <p className="hec-vacio">Aún no tienes facturas generadas</p>
      ) : (
        <ul className="hec-lista">
          {facturas.map((factura) => (
            <li key={factura.id} className="hec-item">
              <div className="hec-item-icono hec-item-icono--factura"><FileText size={18} /></div>
              <div className="hec-item-info">
                <span className="hec-item-titulo">Factura #{factura.numero_factura}</span>
                <span className="hec-item-fecha">
                  {new Date(factura.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <strong className="hec-item-monto hec-item-monto--rojo">{formatUSD(factura.monto_facturado)}</strong>
              <button className="hec-item-descarga" onClick={() => exportarPDF(factura)} aria-label="Descargar PDF">
                <Download size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}