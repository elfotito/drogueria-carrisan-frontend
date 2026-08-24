import { useEffect } from 'react'
import './AyudaModal.css'

// Modal genérico de ayuda.
// `data` viene de ayudaData.js: { imagen, titulo, bloques: [{ categoria, texto, imagen? }] }
// Se cierra con el botón X, con Escape, o haciendo click fuera del contenido.
function AyudaModal({ data, onClose }) {
  useEffect(() => {
    if (!data) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [data, onClose])

  if (!data) return null

  return (
    <div className="ayuda-modal-overlay" onClick={onClose}>
      <div
        className="ayuda-modal"
        role="dialog"
        aria-modal="true"
        aria-label={data.titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ayuda-modal__cerrar" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div
          className="ayuda-modal__hero"
          style={data.imagen ? { backgroundImage: `url(${data.imagen})` } : undefined}
        >
          {!data.imagen && (
            <div className="ayuda-modal__hero-placeholder">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <span>Arte corporativo</span>
            </div>
          )}
        </div>

        <div className="ayuda-modal__body">
          <h1 className="ayuda-modal__titulo">{data.titulo}</h1>

          {data.bloques.map((bloque, i) => (
            <div key={i} className="ayuda-modal__bloque">
              <h2>{bloque.categoria}</h2>
              <p>{bloque.texto}</p>
              {bloque.imagen && (
                <img src={bloque.imagen} alt="" className="ayuda-modal__bloque-img" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AyudaModal
