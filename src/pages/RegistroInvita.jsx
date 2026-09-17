import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import logo from '../assets/minilogo color sin fondo.png'
import api from '../api/axios'
import './Auth.css'
import './RegistroInvita.css'

/**
 * Página EXCLUSIVA para profesionales de la salud y miembros honoríficos.
 * No aparece en ningún menú público: se accede solo por el enlace (URL/QR)
 * que el dueño comparte desde el panel admin (Gestión de códigos).
 *
 * Candado: el enlace lleva ?t=<token>. La página valida el token contra el
 * backend (GET /registro-invita/status). Si está deshabilitado o el token no
 * coincide, no se muestra ningún formulario: solo "enlace no válido".
 */
function RegistroInvita() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t') || ''
  const email = searchParams.get('email') || ''
  const [estado, setEstado] = useState('cargando') // cargando | ok | invalido

  // El setState ocurre SOLO en el callback asíncrono (.then), nunca en el
  // cuerpo síncrono del efecto (regla react-hooks/set-state-in-effect).
  useEffect(() => {
    let activo = true
    api
      .get('/registro-invita/status', { params: { t: token } })
      .then((res) => {
        if (activo) setEstado(res.data && res.data.valido ? 'ok' : 'invalido')
      })
      .catch(() => {
        if (activo) setEstado('invalido')
      })
    return () => {
      activo = false
    }
  }, [token])

  function enlacePerfil(ruta) {
    return email ? `${ruta}?email=${encodeURIComponent(email)}` : ruta
  }

  return (
    <div className="auth-page">
      <main className="auth-container reg-invita-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <div className="auth-card">
          {estado === 'cargando' && (
            <div className="reg-invita__cargando">
              <span className="reg-invita__spinner" aria-hidden="true" />
              <p>Verificando enlace...</p>
            </div>
          )}

          {estado === 'invalido' && (
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
          )}

          {estado === 'ok' && (
            <>
              <h1 className="auth-title">Registro por invitación</h1>
              <p className="auth-subtitle">
                Recibiste este enlace de la Droguería Carrisan para crear tu cuenta. Elige el
                perfil que mejor te describa.
              </p>

              <div className="reg-invita__grid">
                <button
                  type="button"
                  className="reg-invita__card reg-invita__card--profesional"
                  onClick={() => {
                    window.location.href = enlacePerfil('/registro/profesional')
                  }}
                >
                  <div className="reg-invita__imagen">
                    <img
                      src="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/profesionalsalud.jpg"
                      alt=""
                      className="reg-invita__imagen-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="reg-invita__cuerpo">
                    <h3>Profesional de la Salud</h3>
                    <p>Médico, enfermero, fisioterapeuta u otro profesional de la salud</p>
                  </div>
                  <span className="reg-invita__flecha" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14m0 0-6-6m6 6-6 6"
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
                  className="reg-invita__card reg-invita__card--honorifico"
                  onClick={() => {
                    window.location.href = enlacePerfil('/registro/honorifico')
                  }}
                >
                  <div className="reg-invita__imagen">
                    <img
                      src="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/honorifico.jpg"
                      alt=""
                      className="reg-invita__imagen-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="reg-invita__cuerpo">
                    <h3>Miembro Honorífico</h3>
                    <p>Formas parte de nuestra comunidad y tienes un código de invitación</p>
                  </div>
                  <span className="reg-invita__flecha" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14m0 0-6-6m6 6-6 6"
                        stroke="#fff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </>
          )}
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

export default RegistroInvita