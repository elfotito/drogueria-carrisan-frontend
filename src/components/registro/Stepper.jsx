import './Stepper.css'

/**
 * Indicador visual de pasos para formularios multi-paso.
 * @param {string[]} pasos - Lista de nombres de cada paso
 * @param {number} pasoActual - Índice del paso activo (0-based)
 */
function Stepper({ pasos, pasoActual }) {
  return (
    <nav className="stepper" aria-label={`Paso ${pasoActual + 1} de ${pasos.length}`}>
      {pasos.map((nombre, i) => {
        const completado = i < pasoActual
        const activo = i === pasoActual

        return (
          <div key={i} className={`stepper__paso ${completado ? 'stepper__paso--completado' : ''} ${activo ? 'stepper__paso--activo' : ''}`} aria-current={activo ? 'step' : undefined}>
            <div className="stepper__circulo">
              {completado ? (
                <svg role="img" aria-label="Paso completado" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="stepper__label">{nombre}</span>
            {i < pasos.length - 1 && <div className="stepper__linea" />}
          </div>
        )
      })}
    </nav>
  )
}

export default Stepper
