import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './AdVideoBanner.css'

// Banner de video autoreproducible, full-width — mismo tratamiento visual
// que AdBanner/AdRotativo. Soporta dos fuentes:
//   - YouTube (watch?v=, youtu.be/, shorts/, embed/): se embebe por iframe
//     `youtube-nocookie` con autoplay muteado + loop sin controles, sin
//     ocupar storage del proyecto.
//   - MP4/WebM directo: el video se pausa automáticamente al salir del
//     viewport (ahorra datos/batería) y arranca solo al entrar en pantalla.
//
// Props:
//   src    — URL del video (YouTube o MP4/WebM)
//   poster — imagen de respaldo mientras carga el video (solo MP4)
//   link   — ruta de destino al hacer clic (opcional)
//   alt    — texto accesible

const YT_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/i,
  /youtube\.com\/embed\/([\w-]{6,})/i,
  /youtu\.be\/([\w-]{6,})/i,
  /youtube\.com\/shorts\/([\w-]{6,})/i,
]

function getYouTubeId(src = '') {
  for (const pattern of YT_PATTERNS) {
    const match = src.match(pattern)
    if (match) return match[1]
  }
  return null
}

function AdVideoBanner({ src, poster, link, alt = '' }) {
  const videoRef = useRef(null)
  const videoId = getYouTubeId(src)

  useEffect(() => {
    const video = videoRef.current
    if (!video || videoId) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [videoId])

  if (!src) return null

  let contenido
  if (videoId) {
    const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1`
    contenido = (
      <div className="ad-video-banner">
        <iframe
          src={embed}
          title={alt || 'Video promocional'}
          aria-label={alt}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          className="ad-video-banner__iframe"
          loading="lazy"
        />
      </div>
    )
  } else {
    contenido = (
      <div className="ad-video-banner">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className="ad-video-banner__video"
        />
      </div>
    )
  }

  return link ? (
    <Link to={link} className="ad-video-banner__link">
      {contenido}
    </Link>
  ) : (
    contenido
  )
}

export default AdVideoBanner