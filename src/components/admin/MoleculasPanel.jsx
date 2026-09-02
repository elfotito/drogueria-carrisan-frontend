import { useState } from 'react'
import AtcAdmin from './AtcAdmin'
import MoleculasAdmin from './MoleculasAdmin'
import FichasProductoAdmin from './FichasProductoAdmin'
import './MoleculasPanel.css'

const SUBSECCIONES = [
  { id: 'atc', nombre: 'Clasificación ATC', icono: '🗂️' },
  { id: 'moleculas', nombre: 'Moléculas', icono: '🧬' },
  { id: 'fichas', nombre: 'Fichas de producto', icono: '📋' },
]

function MoleculasPanel() {
  const [subseccionActiva, setSubseccionActiva] = useState('atc')

  const renderSubseccion = () => {
    switch (subseccionActiva) {
      case 'atc': return <AtcAdmin />
      case 'moleculas': return <MoleculasAdmin />
      case 'fichas': return <FichasProductoAdmin />
      default: return <AtcAdmin />
    }
  }

  return (
    <div className="moleculas-panel">
      <div className="section-header">
        <h2>🧬 Moléculas y Fichas Técnicas</h2>
      </div>

      <div className="subtabs">
        {SUBSECCIONES.map((s) => (
          <button
            key={s.id}
            className={`subtab-btn ${subseccionActiva === s.id ? 'active' : ''}`}
            onClick={() => setSubseccionActiva(s.id)}
          >
            <span className="subtab-icon">{s.icono}</span>
            <span className="subtab-text">{s.nombre}</span>
          </button>
        ))}
      </div>

      <div className="subtab-content">
        {renderSubseccion()}
      </div>
    </div>
  )
}

export default MoleculasPanel
