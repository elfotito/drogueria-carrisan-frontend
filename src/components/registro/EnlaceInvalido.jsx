import { Link } from 'react-router-dom'

/**
 * Pantalla compartida "Enlace no válido o no autorizado".
 *
 * La usan RegistroInvita (token inválido o página de invitación apagada) y
 * RequiereInvitacion (guard de los formularios de profesional/honorífico).
 * Depende de las clases .reg-invita__* de RegistroInvita.css y de .auth-*
 * de Auth.css, que importa RequiereInvitacion / RegistroInvita.
 */
function EnlaceInvalido() {
  return (
    <div className="reg-invita__invalido">
      <span className="reg-invita__icono-candado" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect
            x="5"
            y="11"
            width="14"
            height="9"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 11V7a4 4 0 0 1 8 0v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h1 className="auth-title">Enlace no válido o no autorizado</h1>
      <p className="reg-invita__invalido-texto">
        El enlace de invitación que intentaste usar no está activo. Si crees que es un
        error, solicita uno nuevo directamente con la Droguería Carrisan.
      </p>
      <Link to="/" className="auth-submit reg-invita__invalido-btn">
        Volver al inicio
      </Link>
    </div>
  )
}

export default EnlaceInvalido
