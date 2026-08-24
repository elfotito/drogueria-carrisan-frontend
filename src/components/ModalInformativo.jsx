import { useEffect } from 'react'
import { X } from 'lucide-react'
import './ModalInformativo.css'

// Modal genérico, centrado y flotante (no es un bottom-sheet como AyudaModal).
// Pensado para contenido corto: beneficios, avisos, textos informativos.
//
// Uso:
//   <ModalInformativo abierto={abierto} titulo="Nuestros beneficios" onCerrar={() => setAbierto(false)}>
//     <p>Contenido libre aquí…</p>
//   </ModalInformativo>
function ModalInformativo({ abierto, titulo, onCerrar, children }) {
  useEffect(() => {
    if (!abierto) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="modal-info-overlay" onClick={onCerrar}>
      <div
        className="modal-info"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-info__cerrar" onClick={onCerrar} aria-label="Cerrar">
          <X size={18} strokeWidth={2.4} />
        </button>

        {titulo && <h2 className="modal-info__titulo">{titulo}</h2>}

        <div className="modal-info__cuerpo">{children}</div>
      </div>
    </div>
  )
}

export default ModalInformativo
