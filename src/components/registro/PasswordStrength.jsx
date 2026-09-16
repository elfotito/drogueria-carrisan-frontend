/**
 * Indicador de fortaleza de contraseña compartido por los tres formularios
 * de registro (Institucional, Profesional, Honorífico).
 *
 * Unica implementación (antes había 3 distintas en cada página): calcula un
 * puntaje de 0 a 5 y muestra una barra + etiqueta usando las clases
 * .registro-password-fortaleza* definidas en Auth.css.
 *
 * Props:
 *  - password: string. Si es vacía no renderiza nada.
 */
function PasswordStrength({ password, id }) {
  if (!password || password.length === 0) return null

  let puntaje = 0
  if (password.length >= 8) puntaje += 1
  if (/[A-Z]/.test(password)) puntaje += 1
  if (/[a-z]/.test(password)) puntaje += 1
  if (/[0-9]/.test(password)) puntaje += 1
  if (/[^A-Za-z0-9]/.test(password)) puntaje += 1

  const { color, etiqueta, ancho } = puntaje <= 1
    ? { color: '#DC2626', etiqueta: 'Débil', ancho: 20 }
    : puntaje <= 3
    ? { color: '#F59E0B', etiqueta: 'Media', ancho: 60 }
    : puntaje === 4
    ? { color: '#10B981', etiqueta: 'Fuerte', ancho: 80 }
    : { color: '#059669', etiqueta: 'Muy fuerte', ancho: 100 }

  return (
    <div id={id} className="registro-password-fortaleza">
      <div
        className="registro-password-fortaleza-barra"
        role="progressbar"
        aria-label="Fortaleza de la contraseña"
        aria-valuenow={puntaje}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuetext={etiqueta}
        style={{ height: '4px', borderRadius: '2px', background: color, width: `${ancho}%`, transition: 'all 0.3s' }}
      />
      <span className="registro-password-fortaleza-texto" style={{ color }}>{etiqueta}</span>
    </div>
  )
}

export default PasswordStrength