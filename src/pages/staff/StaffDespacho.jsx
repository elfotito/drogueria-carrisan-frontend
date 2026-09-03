import { Link } from 'react-router-dom'
import './StaffPlaceholder.css'

function StaffDespacho() {
  return (
    <div className="staff-placeholder">
      <Link to="/staff/dashboard" className="staff-placeholder-back">← Volver</Link>
      <h1>Envíos por despachar</h1>
      <p>Esta pantalla está en construcción — acá va la cola de órdenes en estado "enviado".</p>
    </div>
  )
}

export default StaffDespacho