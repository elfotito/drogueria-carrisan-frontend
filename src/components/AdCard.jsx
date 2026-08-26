import { Link } from 'react-router-dom'
import './AdCard.css'

// Card promocional compacta tipo Amazon "Sponsored" / Walmart side-ad.
// Se muestra como una card individual o en pareja (grid de 2 columnas).
//
// Props:
//   imagen    — URL de la imagen (opcional, muestra placeholder si no se provee)
//   link      — Ruta de destino al hacer clic
//   alt       — Texto alternativo de la imagen
//   titulo    — Título del placeholder
//   subtitulo — Subtítulo del placeholder
//   cta       — Texto del botón CTA
//   variante  — "default" | "oferta" | "nuevo"

function AdCard({
  imagen,
  link,
  alt = '',
  titulo = 'Promoción especial',
  subtitulo = 'Aprovecha esta oferta exclusiva',
  cta = 'Ver más',
  variante = 'default',
}) {
  const contenido = imagen ? (
    <picture>
      <img src={imagen} alt={alt} className="ad-card__img" loading="lazy" />
    </picture>
  ) : (
    <div className={`ad-card__placeholder ad-card__placeholder--${variante}`}>
      <div className="ad-card__placeholder-top">
        <span className="ad-card__icono" aria-hidden="true">✨</span>
        <div className="ad-card__textos">
          <h3 className="ad-card__titulo">{titulo}</h3>
          <p className="ad-card__subtitulo">{subtitulo}</p>
        </div>
      </div>
      {link && (
        <span className="ad-card__cta-placeholder">{cta}</span>
      )}
    </div>
  )

  return (
    <div className="ad-card">
      {link ? (
        <Link to={link} className="ad-card__link">
          {contenido}
        </Link>
      ) : (
        contenido
      )}
    </div>
  )
}

export default AdCard
