// components/HojaInferior.jsx
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './HojaInferior.css'

/**
 * HojaInferior — Bottom sheet genérico reutilizable.
 * 
 * Overlay + tarjeta que sube desde abajo en móvil, centrada en desktop.
 * Vía portal directo a document.body para evitar quedar atrapada dentro
 * de contenedores con overflow:hidden o transform durante transiciones.
 * 
 * Uso:
 *   <HojaInferior 
 *     titulo="Tu cuenta" 
 *     onCerrar={() => setMostrarModal(false)}
 *   >
 *     ...contenido...
 *   </HojaInferior>
 */
function HojaInferior({ titulo, onCerrar, children }) {
  return createPortal(
    <div className="hoja-inferior-overlay" onClick={onCerrar}>
      <div className="hoja-inferior" onClick={(e) => e.stopPropagation()}>
        <div className="hoja-inferior__manija" />
        <div className="hoja-inferior__header">
          <h3>{titulo}</h3>
          <button 
            type="button" 
            className="hoja-inferior__cerrar" 
            onClick={onCerrar} 
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="hoja-inferior__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default HojaInferior