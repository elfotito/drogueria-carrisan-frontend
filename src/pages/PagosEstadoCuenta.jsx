import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import PagoClienteModal from '../components/PagoClienteModal'
import './HistorialEstadoCuenta.css'

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

export default function PagosEstadoCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

  useEffect(() => {
    api.get(`/clientes/${user.id}/estado-cuenta`)
      .then(({ data }) => setPagos(data.pagos || []))
      .finally(() => setCargando(false))
  }, [user.id])

  return (
    <div className="hec-container">
      <header className="hec-header">
        <button onClick={() => navigate(-1)} className="hec-back"><ArrowLeft size={20} /></button>
        <h1>Historial de pagos</h1>
      </header>

      {cargando ? (
        <p className="hec-cargando">Cargando…</p>
      ) : pagos.length === 0 ? (
        <p className="hec-vacio">Aún no tienes pagos registrados</p>
      ) : (
        <ul className="hec-lista">
          {pagos.map((pago) => (
            <li key={pago.id} className="hec-item" onClick={() => setPagoSeleccionado(pago)}>
              <div className="hec-item-icono hec-item-icono--pago"><DollarSign size={18} /></div>
              <div className="hec-item-info">
                <span className="hec-item-titulo">Pago #{pago.id}</span>
                <span className="hec-item-fecha">
                  {new Date(pago.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <strong className="hec-item-monto hec-item-monto--verde">+{formatUSD(pago.monto)}</strong>
            </li>
          ))}
        </ul>
      )}

      {pagoSeleccionado && (
        <PagoClienteModal pago={pagoSeleccionado} onClose={() => setPagoSeleccionado(null)} />
      )}
    </div>
  )
}