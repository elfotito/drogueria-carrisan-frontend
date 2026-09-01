import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './ScrollToTopFloat.css'

// Umbral de scroll (px) para mostrar el botón.
const UMBRAL = 320

// Rutas donde el botón está habilitado. Se puede ampliar con páginas de
// mucho texto (privacidad, términos, etc.). Por ahora solo el catálogo
// (por lo tanto NO aparece en ofertas, línea farmacia ni línea hospitalaria).
const RUTAS_ACTIVAS = ['/catalogo']

function rutasActivas(pathname) {
  return RUTAS_ACTIVAS.some((r) => pathname === r)
}

// Desplaza la ventana hacia arriba con una animación suave y paulatina.
function scrollArriba() {
  const preferirReducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (preferirReducido) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }
  const inicio = window.scrollY
  const duracion = 600
  const t0 = performance.now()
  function paso(ahora) {
    const t = Math.min(1, (ahora - t0) / duracion)
    const e = 1 - Math.pow(1 - t, 3) // easeOutCubic: desacelera al final
    window.scrollTo(0, inicio * (1 - e))
    if (t < 1) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}

// Botón flotante "volver arriba". Aparece al bajar y solo en las rutas
// activas. En desktop se ancla abajo-derecha; en mobile queda flotando
// junto al dock (BottomNav), arriba a la izquierda.
function ScrollToTopFloat() {
  const { pathname } = useLocation()
  const activa = rutasActivas(pathname)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!activa) return // el botón no se renderiza si no está activo
    const onScroll = () => setVisible(window.scrollY > UMBRAL)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activa])

  if (!activa) return null

  return (
    <button
      type="button"
      className={`scroll-top-float ${visible ? 'scroll-top-float--visible' : ''}`}
      onClick={scrollArriba}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 14 12 8 18 14" />
      </svg>
    </button>
  )
}

export default ScrollToTopFloat
