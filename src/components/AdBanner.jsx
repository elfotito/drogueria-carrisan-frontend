import { Link } from 'react-router-dom'
import './AdBanner.css'

// Banner promocional full-width estilo Walmart/Amazon.
// Recibe imagen real O muestra un placeholder con texto configurable.
//
// Props:
//   imagen   — URL de la imagen del banner (opcional)
//   link     — Ruta de destino al hacer clic (opcional)
//   alt      — Texto alternativo de la imagen
//   titulo   — Título del placeholder (default: "Próximamente")
//   subtitulo — Subtítulo del placeholder
//   variante — "default" | "oferta" | "nuevo" (cambia el color de acento)

function AdBanner({
  imagen,
  link,
  alt = '',
  titulo = 'Próximamente',
  subtitulo = 'Promociones especiales que están en camino',
  variante = 'default',
}) {
  const contenido = imagen ? (
    <picture>
      <img src={imagen} alt={alt} className="ad-banner__img" loading="lazy" />
    </picture>
  ) : (
    <div className={`ad-banner__placeholder ad-banner__placeholder--${variante}`}>
      <span className="ad-banner__icono" aria-hidden="true">🏷️</span>
      <div className="ad-banner__textos">
        <h3 className="ad-banner__titulo">{titulo}</h3>
        <p className="ad-banner__subtitulo">{subtitulo}</p>
      </div>
    </div>
  )

  return (
    <div className="ad-banner">
      {link ? (
        <Link to={link} className="ad-banner__link">
          {contenido}
        </Link>
      ) : (
        contenido
      )}
    </div>
  )
}

export default AdBanner
