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
    imagen: 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/institucional.jpg',
  },
  {
    id: 'profesional',
    ruta: '/registro/profesional',
    clase: 'registro-tipo__card--profesional',
    titulo: 'Usuario Profesional de la Salud',
    descripcion: 'Médico, enfermero, fisioterapeuta u otro profesional de la salud',
    imagen: 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/profesionalsalud.jpg',
  },
  {
    id: 'honorifico',
    ruta: '/registro/honorifico',
    clase: 'registro-tipo__card--honorifico',
    titulo: 'Usuario Honorífico',
    descripcion: 'Ya formás parte de nuestra comunidad y tenés un código de invitación',
    imagen: 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/honorifico.jpg',
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
                <img
                  src={tipo.imagen}
                  alt=""
                  className="registro-tipo__imagen-img"
                  loading="lazy"
                />
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
