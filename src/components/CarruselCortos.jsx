import { useState, useEffect, useRef } from 'react'
import { X, ChevronUp, ChevronDown, Play, Volume2, VolumeX } from 'lucide-react'
import api from '../api/axios'
import './CarruselCortos.css'

const construirEmbed = (id, conSonido) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${conSonido ? '0' : '1'}&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1`

function CarruselCortos() {
  const [videos, setVideos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [hayError, setHayError] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [idx, setIdx] = useState(0)
  const [conSonido, setConSonido] = useState(false)
  const scrollerRef = useRef(null)

  useEffect(() => {
    let activo = true
    api
      .get('/shorts')
      .then((res) => {
        if (!activo) return
        const lista = res.data?.videos
        setVideos(Array.isArray(lista) ? lista : [])
        setHayError(false)
      })
      .catch(() => {
        if (activo) setHayError(true)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    if (!abierto) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto || !scrollerRef.current) return undefined
    const contenedor = scrollerRef.current
    const slides = Array.from(contenedor.children)
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entrada of entries) {
          if (entrada.isIntersecting) {
            setIdx(slides.indexOf(entrada.target))
            break
          }
        }
      },
      { root: contenedor, threshold: 0.6 }
    )
    slides.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [abierto, videos])

  if (cargando) return null
  if (hayError || videos.length === 0) return null

  const abrir = (i) => {
    setIdx(i)
    setAbierto(true)
  }
  const cerrar = () => setAbierto(false)
  const irA = (i) => {
    if (i < 0 || i >= videos.length) return
    scrollerRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="cc">
      <div className="cc__header">
        <h2 className="cc__titulo">Cortos</h2>
        <span className="cc__subtitulo">Videos cortos de nuestra marca</span>
      </div>

      <div className="cc__fila">
        {videos.map((video, i) => (
          <button
            key={video.id}
            type="button"
            className="cc__preview"
            onClick={() => abrir(i)}
            aria-label={`Reproducir ${video.titulo}`}
          >
            <img src={video.thumb} alt={video.titulo} className="cc__preview-img" loading="lazy" />
            <span className="cc__preview-play"><Play size={20} /></span>
            <span className="cc__preview-titulo">{video.titulo}</span>
          </button>
        ))}
      </div>

      {abierto && (
        <div className="cc-modal" role="dialog" aria-modal="true" aria-label="Reproductor de cortos">
          <button type="button" className="cc-modal__cerrar" onClick={cerrar} aria-label="Cerrar">
            <X size={26} />
          </button>

          <button
            type="button"
            className="cc-modal__sonido"
            onClick={() => setConSonido((s) => !s)}
            aria-label={conSonido ? 'Silenciar' : 'Activar sonido'}
          >
            {conSonido ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          {videos.length > 1 && (
            <>
              <button
                type="button"
                className="cc-modal__nav cc-modal__nav--arriba"
                onClick={() => irA(idx - 1)}
                disabled={idx === 0}
                aria-label="Anterior"
              >
                <ChevronUp size={26} />
              </button>
              <button
                type="button"
                className="cc-modal__nav cc-modal__nav--abajo"
                onClick={() => irA(idx + 1)}
                disabled={idx === videos.length - 1}
                aria-label="Siguiente"
              >
                <ChevronDown size={26} />
              </button>
            </>
          )}

          <div className="cc-modal__scroller" ref={scrollerRef}>
            {videos.map((video, i) => (
              <div key={video.id} className={`cc-slide${i === idx ? ' cc-slide--activo' : ''}`}>
                {i === idx ? (
                  <iframe
                    key={`${video.id}-${conSonido ? 'on' : 'muted'}`}
                    src={construirEmbed(video.id, conSonido)}
                    title={video.titulo}
                    className="cc-slide__video"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <img src={video.thumb} alt={video.titulo} className="cc-slide__thumb" loading="lazy" />
                )}
                <span className="cc-slide__titulo">{video.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default CarruselCortos