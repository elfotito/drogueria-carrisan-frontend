import { useState, useEffect, useRef } from 'react'
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react'
import api from '../api/axios'
import './CarruselCortos.css'

const construirEmbed = (id, conSonido) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=${conSonido ? '0' : '1'}&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1`

const BANNER_TITULO = 'Mantente al día con lo último en el sector salud'

function CarruselCortos() {
  const [videos, setVideos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [hayError, setHayError] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [idx, setIdx] = useState(0)
  const [conSonido, setConSonido] = useState(false)
  const scrollerRef = useRef(null)
  const filaRef = useRef(null)

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
  const scrollFila = (direccion) => {
    filaRef.current?.scrollBy({ left: direccion * 380, behavior: 'smooth' })
  }

  return (
    <section className="cc">
      {/* Mini banner solo móvil */}
      <div className="cc__mini">
        <span className="cc__mini-ico"><Play size={15} /></span>
        <span className="cc__mini-texto">{BANNER_TITULO}</span>
      </div>

      <div className="cc__cuerpo">
        {/* Banner lateral solo desktop */}
        <aside className="cc__banner">
          <span className="cc__banner-chip"><Play size={13} /> Shorts</span>
          <h2 className="cc__banner-titulo">{BANNER_TITULO}</h2>
          <p className="cc__banner-sub">Videos cortos de nuestro canal</p>
        </aside>

        <div className="cc__lado">
          <button
            type="button"
            className="cc__flecha cc__flecha--prev"
            onClick={() => scrollFila(-1)}
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="cc__fila" ref={filaRef}>
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

          <button
            type="button"
            className="cc__flecha cc__flecha--next"
            onClick={() => scrollFila(1)}
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>
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
            <span className="cc-modal__sonido-label">{conSonido ? 'Silenciar' : 'Activar sonido'}</span>
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