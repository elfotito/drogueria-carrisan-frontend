import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'
import './RegistroConTipo.css'

/**
 * Paso 1 del registro (público). Por normativa sanitaria venezolana la
 * Droguería solo vende a instituciones de salud, así que el público SOLO
 * ve el registro institucional (con su panel explicativo). Los perfiles
 * profesional y honorífico se registran exclusivamente vía la página por
 * invitación (/registro/invita, con token) que el dueño comparte por
 * URL/QR. Este componente simplemente navega a /registro/institucional,
 * pasando el email pre-llenado si vino de /login.
 */
function RegistroConTipo() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailPrellenado = searchParams.get('email') || ''

  function irA() {
    const query = emailPrellenado ? `?email=${encodeURIComponent(emailPrellenado)}` : ''
    navigate(`/registro/institucional${query}`)
  }

  return (
    <div className="auth-page">
      <main className="auth-container registro-tipo-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">¿Cuál es tu tipo de cliente?</h1>
          <p className="auth-subtitle">
            Selecciona la opción que mejor describe tu perfil para completar tu registro
          </p>

          <div className="registro-tipo__panel">
            <div className="registro-tipo__izq">
              <button
                type="button"
                className={`registro-tipo__card registro-tipo__card--institucional registro-tipo__card--seleccionada`}
                onClick={irA}
                aria-pressed="true"
              >
                <div className="registro-tipo__imagen">
                  <img
                    src="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/institucional.jpg"
                    alt=""
                    className="registro-tipo__imagen-img"
                    loading="lazy"
                  />
                </div>

                <div className="registro-tipo__cuerpo">
                  <h3>Usuario Institucional</h3>
                  <p>Clínica, farmacia, centro quirúrgico u otra institución de salud</p>
                </div>

                <span className="registro-tipo__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <button
                type="button"
                className="auth-submit registro-tipo__siguiente"
                onClick={irA}
              >
                Siguiente
              </button>
            </div>

            <aside className="registro-tipo__info">
              <h2>Solo para instituciones de salud</h2>
              <p className="registro-tipo__info-intro">
                De acuerdo con la normativa sanitaria venezolana, la Droguería Carrisan solo
                comercializa insumos médicos con instituciones de salud (clínicas, farmacias,
                centros quirúrgicos, hospitales y afines) que cuenten con su registro y permiso
                sanitario emitido por la Contraloría Sanitaria.
              </p>
              <ul className="registro-tipo__info-lista">
                <li>
                  <strong>Solo necesitas tu RIF</strong> para abrir tu cuenta: es el único
                  documento obligatorio del registro (se adjunta en PDF).
                </li>
                <li>
                  <strong>Línea de crédito opcional</strong>: si la quieres desde hoy, puedes
                  adjuntar el permiso sanitario, la cédula y el título del farmacéutico regente y
                  la autorización del director médico. Si no los tienes a la mano, los entregas
                  luego a tus asesores de la Droguería.
                </li>
              </ul>
              <p className="registro-tipo__info-nota">
                ¿Recibiste una invitación para registrarte como profesional de la salud o miembro
                honorífico? Usa el enlace que te fue compartido para completar tu registro.
              </p>
            </aside>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        <div className="auth-footer-content">
          <span className="auth-footer-rif">RIF J-40068410-2</span>
          <div className="auth-footer-links">
            <Link to="/terminos">Términos de uso</Link>
            <Link to="/privacidad">Aviso de privacidad</Link>
            <Link to="/contacto">Soporte</Link>
          </div>
          © 2026 Drogueria Carrisan, C.A. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

export default RegistroConTipo