import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import logo from '../assets/minilogo color sin fondo.png'
import './Auth.css'
import './RegistroConTipo.css'

/**
 * Paso 1 del registro: elegir tipo de usuario. Los 3 formularios
 * completos viven en sus propias páginas (RegistroInstitucional,
 * RegistroProfesional, RegistroHonorifico) — este componente solo
 * decide a cuál navegar, pasando el email pre-llenado si vino de
 * /login (cuando el usuario escribió un email que no existe aún).
 *
 * Interacción: se selecciona una tarjeta (borde + check) y se navega
 * al presionar "Siguiente". Desktop (≥768px): las 3 tarjetas en fila.
 * Móvil: apiladas en columna.
 */
const TIPOS = [
  {
    id: 'institucional',
    ruta: '/registro/institucional',
    clase: 'registro-tipo__card--institucional',
    titulo: 'Usuario Institucional',
    descripcion: 'Clínica, farmacia, centro quirúrgico u otra institución de salud',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      </svg>
    ),
  },
  {
    id: 'profesional',
    ruta: '/registro/profesional',
    clase: 'registro-tipo__card--profesional',
    titulo: 'Usuario Profesional de la Salud',
    descripcion: 'Médico, enfermero, fisioterapeuta u otro profesional de la salud',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9h-2.5v2.5h-2v-2.5h-2.5v-2h2.5v-2.5h2v2.5h2.5v2z" />
      </svg>
    ),
  },
  {
    id: 'honorifico',
    ruta: '/registro/honorifico',
    clase: 'registro-tipo__card--honorifico',
    titulo: 'Usuario Honorífico',
    descripcion: 'Ya formás parte de nuestra comunidad y tenés un código de invitación',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 15a4 4 0 100-8 4 4 0 000 8z" />
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  },
]

function RegistroConTipo() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailPrellenado = searchParams.get('email') || ''
  const [seleccionado, setSeleccionado] = useState(null)

  function irA(ruta) {
    const query = emailPrellenado ? `?email=${encodeURIComponent(emailPrellenado)}` : ''
    navigate(`${ruta}${query}`)
  }

  function manejarSiguiente() {
    const tipo = TIPOS.find((t) => t.id === seleccionado)
    if (!tipo) return
    irA(tipo.ruta)
  }

  return (
    <div className="auth-page">
      <main className="auth-container registro-tipo-container">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Logo" className="logologin" />
        </Link>

        <h1 className="auth-title">¿Cuál es tu tipo de cliente?</h1>
        <p className="auth-subtitle">
          Selecciona la opción que mejor describe tu perfil para completar tu registro
        </p>

        <div className="registro-tipo__grid">
          {TIPOS.map((tipo) => (
            <button
              key={tipo.id}
              type="button"
              className={`registro-tipo__card ${tipo.clase} ${
                seleccionado === tipo.id ? 'registro-tipo__card--seleccionada' : ''
              }`}
              onClick={() => setSeleccionado(tipo.id)}
              aria-pressed={seleccionado === tipo.id}
            >
              {/*
                Espacio para la ilustración de Tito. Para usarla, reemplaza
                el <span className="registro-tipo__icono"> de abajo por:
                <img src={tuImagen} alt="" className="registro-tipo__imagen-img" />
                dentro de este mismo div — el tamaño y las esquinas ya están listos.
              */}
              <div className="registro-tipo__imagen">
                <span className="registro-tipo__icono">{tipo.icono}</span>
              </div>

              <div className="registro-tipo__cuerpo">
                <h3>{tipo.titulo}</h3>
                <p>{tipo.descripcion}</p>
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
          ))}
        </div>

        <button
          type="button"
          className="auth-submit registro-tipo__siguiente"
          disabled={!seleccionado}
          onClick={manejarSiguiente}
        >
          Siguiente
        </button>
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
