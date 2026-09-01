import { Link } from 'react-router-dom'
import './BloquePromocional.css'

// Bloque promocional individual: imagen de fondo + texto y CTA superpuestos vía CSS.
// No es un carrusel — cada instancia es un bloque estático pensado para llamarse
// varias veces desde cualquier página (Home u otra) y así armar layouts tipo "bento"
// (bloques de distinto tamaño combinados en un grid), como AdBanner/AdCard pero con
// overlay real de texto sobre la imagen en vez de solo modo placeholder.
//
// Props:
//   imagen        — URL de la imagen de fondo. Si no se provee, muestra un placeholder
//                    con degradado de color (mismo patrón que AdBanner/AdCard) para
//                    poder maquetar el layout antes de tener las artes finales.
//   imagenMovil   — URL alterna para mobile (recorte distinto de la misma imagen).
//                    Opcional; si no se da, se reutiliza `imagen` también en mobile.
//   alt           — Texto alternativo de la imagen.
//   link          — Ruta de destino al hacer clic (opcional; sin link, el bloque no
//                    es clickeable, útil para bloques puramente informativos).
//   titulo        — Texto principal superpuesto.
//   subtitulo     — Texto secundario superpuesto (opcional).
//   textoCta      — Texto del botón/enlace (opcional; si no se pasa, no se muestra CTA).
//   estiloCta     — 'boton' (pill blanco sólido, default) | 'enlace' (texto subrayado,
//                    más discreto — para el patrón "Shop now" vs "Learn more").
//   tamano        — 'grande' | 'mediano' (default) | 'pequeno'. Controla la altura del
//                    bloque y, cuando el contenedor padre es un CSS Grid, cuántas filas
//                    ocupa ('grande' = 2 filas vía grid-row: span 2).
//   posicionTexto — 'arriba' (default) | 'abajo'. Dónde se ancla el texto y hacia dónde
//                    se degrada el overlay oscuro (siempre queda un área con contraste
//                    garantizado para el texto blanco, sin depender de cada imagen).
//   variante      — 'default' | 'oferta' | 'nuevo'. Color del placeholder cuando no
//                    hay imagen todavía (mismas variantes que AdBanner/AdCard).
//   className     — Clases extra opcionales, para que la página que lo use pueda
//                    posicionarlo dentro de su propio grid (grid-area, grid-column, etc.)
//                    sin que este componente necesite saber nada del layout general.

function BloquePromocional({
  imagen,
  imagenMovil,
  alt = '',
  link,
  titulo,
  subtitulo,
  textoCta,
  estiloCta = 'boton',
  tamano = 'mediano',
  posicionTexto = 'arriba',
  variante = 'default',
  className = '',
}) {
  const contenido = imagen ? (
    <>
      <picture className="bloque-promocional__picture">
        {imagenMovil && <source media="(max-width: 768px)" srcSet={imagenMovil} />}
        <img src={imagen} alt={alt} className="bloque-promocional__img" loading="lazy" />
      </picture>
      <div className="bloque-promocional__overlay" aria-hidden="true" />
      <div className="bloque-promocional__contenido">
        {titulo && <h3 className="bloque-promocional__titulo">{titulo}</h3>}
        {subtitulo && <p className="bloque-promocional__subtitulo">{subtitulo}</p>}
        {textoCta && (
          <span className={`bloque-promocional__cta bloque-promocional__cta--${estiloCta}`}>
            {textoCta}
          </span>
        )}
      </div>
    </>
  ) : (
    <div className={`bloque-promocional__placeholder bloque-promocional__placeholder--${variante}`}>
      <div className="bloque-promocional__contenido bloque-promocional__contenido--placeholder">
        {titulo && <h3 className="bloque-promocional__titulo">{titulo}</h3>}
        {subtitulo && <p className="bloque-promocional__subtitulo">{subtitulo}</p>}
        {textoCta && (
          <span className={`bloque-promocional__cta bloque-promocional__cta--${estiloCta}`}>
            {textoCta}
          </span>
        )}
      </div>
    </div>
  )

  const clases = [
    'bloque-promocional',
    `bloque-promocional--${tamano}`,
    `bloque-promocional--${posicionTexto}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={clases}>
      {link ? (
        <Link to={link} className="bloque-promocional__link">
          {contenido}
        </Link>
      ) : (
        <div className="bloque-promocional__link">{contenido}</div>
      )}
    </div>
  )
}

export default BloquePromocional