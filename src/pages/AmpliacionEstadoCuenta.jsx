import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './HistorialEstadoCuenta.css'

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

export default function AmpliacionEstadoCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [elegibilidad, setElegibilidad] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [solicitando, setSolicitando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/clientes/${user.id}/estado-cuenta/ampliacion-elegibilidad`)
      .then(({ data }) => setElegibilidad(data))
      .catch(() => setError('No se pudo calcular tu elegibilidad'))
      .finally(() => setCargando(false))
  }, [user.id])

  async function solicitar() {
    setSolicitando(true)
    setError('')
    try {
      const { data } = await api.post(`/clientes/${user.id}/estado-cuenta/ampliacion-solicitar`)
      setResultado(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar la solicitud')
    } finally {
      setSolicitando(false)
    }
  }

  return (
    <div className="hec-container">
      <header className="hec-header">
        <button onClick={() => navigate(-1)} className="hec-back"><ArrowLeft size={20} /></button>
        <h1>Ampliar línea de crédito</h1>
      </header>

      {cargando ? (
        <p className="hec-cargando">Calculando tu elegibilidad…</p>
      ) : resultado ? (
        <div className="amp-resultado">
          <CheckCircle2 size={48} color="#059669" />
          <h2>¡Ampliación aprobada!</h2>
          <p>Tu nueva línea de crédito es</p>
          <strong className="amp-monto-grande">{formatUSD(resultado.linea_nueva)}</strong>
          <p className="amp-detalle">+{resultado.porcentaje_aplicado}% sobre {formatUSD(resultado.linea_anterior)}</p>
        </div>
      ) : elegibilidad?.califica ? (
        <div className="amp-card">
          <TrendingUp size={32} color="#0052dc" />
          <h2>Calificas para una ampliación</h2>
          <p className="amp-texto">
            Según tu promedio de compra de los últimos 3 meses ({formatUSD(elegibilidad.promedio_mensual)}/mes),
            puedes ampliar tu línea actual en un <strong>{elegibilidad.porcentaje_disponible}%</strong>.
          </p>
          <div className="amp-comparacion">
            <div>
              <span>Línea actual</span>
              <strong>{formatUSD(elegibilidad.linea_actual)}</strong>
            </div>
            <span className="amp-flecha">→</span>
            <div>
              <span>Línea nueva</span>
              <strong className="amp-verde">{formatUSD(elegibilidad.nueva_linea)}</strong>
            </div>
          </div>
          {error && <p className="rep-error">{error}</p>}
          <button className="rep-generar-btn" onClick={solicitar} disabled={solicitando}>
            {solicitando ? 'Procesando…' : `Solicitar ampliación (+${elegibilidad.porcentaje_disponible}%)`}
          </button>
        </div>
      ) : (
        <div className="amp-card amp-card--no-califica">
          <XCircle size={32} color="#94a3b8" />
          <h2>Aún no calificas</h2>
          <p className="amp-texto">
            Tu promedio de compra mensual es {formatUSD(elegibilidad?.promedio_mensual || 0)}.
            Sigue comprando con regularidad para calificar a una ampliación de línea.
          </p>
        </div>
      )}
    </div>
  )
}