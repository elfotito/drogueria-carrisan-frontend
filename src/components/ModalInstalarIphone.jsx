import { X } from 'lucide-react'

// ---------------------------------------------------------------
// Modal informativo para iPhone/Safari: explica cómo agregar la PWA
// a la pantalla de inicio, ya que iOS no soporta beforeinstallprompt.
// ---------------------------------------------------------------
export default function ModalInstalarIphone({ onClose }) {
  return (
    <div className="instalar-modal__overlay" onClick={onClose}>
      <div className="instalar-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="instalar-modal__cerrar" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="instalar-modal__icono">
          <img src="/android-chrome-192x192.png" alt="" width="48" height="48" />
        </div>

        <h3 className="instalar-modal__titulo">Agregar a pantalla de inicio</h3>
        <p className="instalar-modal__subtitulo">
          Instalá la app para acceder más rápido desde tu pantalla de inicio.
        </p>

        <ol className="instalar-modal__pasos">
          <li className="instalar-modal__paso">
            <span className="instalar-modal__paso-numero">1</span>
            <div className="instalar-modal__paso-texto">
              <strong>Tocá el botón de compartir</strong>
              <span>El ícono del cuadro con flecha ↑ en la barra de abajo</span>
            </div>
          </li>
          <li className="instalar-modal__paso">
            <span className="instalar-modal__paso-numero">2</span>
            <div className="instalar-modal__paso-texto">
              <strong>Seleccioná "Agregar a pantalla de inicio"</strong>
              <span>Desplazate hacia abajo si no lo ves de inmediato</span>
            </div>
          </li>
          <li className="instalar-modal__paso">
            <span className="instalar-modal__paso-numero">3</span>
            <div className="instalar-modal__paso-texto">
              <strong>Tocá "Agregar"</strong>
              <span>Listo, ahora tenés la app en tu pantalla de inicio</span>
            </div>
          </li>
        </ol>

        <button type="button" className="instalar-modal__btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  )
}
