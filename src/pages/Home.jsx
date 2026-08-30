import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import DashboardMobile from '../components/DashboardMobile'
import HeroCarrusel from '../components/HeroCarrusel'
import HomeCarrusel from '../components/HomeCarrusel'
import SeccionesCarrusel from '../components/SeccionesCarrusel'
import AdBanner from '../components/AdBanner'
import AdCard from '../components/AdCard'
import InfiniteScrollLoader from '../components/InfiniteScrollLoader'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import CookieConsent from '../components/CookieConsent'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import './Home.css'

// ── Constantes ──────────────────────────────────────────────────
const PRODUCTOS_POR_CARGA = 12
const MAX_CARGAS = 2

// Configuración de las secciones dinámicas que se cargan al scrollear.
const SECCIONES_DINAMICAS = [
  [
    { titulo: 'Nuevos para ti', verTodoTo: '/catalogo' },
    { titulo: 'Explorá el catálogo', verTodoTo: '/catalogo' },
  ],
  [
    { titulo: 'Más populares', verTodoTo: '/catalogo' },
    { titulo: 'Descubrí más', verTodoTo: '/catalogo' },
  ],
]

// Slides del hero. Vacío por defecto: HeroCarrusel ya trae su propio
// placeholder ("Espacio para banner hero") mientras no le pases imágenes.
// Cuando tengas las artes, reemplaza esto con tus URLs reales:
// { id: 1, imagen: '/hero/banner-1.jpg', imagenMovil: '/hero/banner-1-m.jpg', link: '/catalogo', alt: '...' }
const HERO_SLIDES = []

// ── Hook: saber si estamos en viewport mobile (mismo breakpoint que el resto del CSS) ──
function useIsMobile(breakpoint = 769) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : true
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    handler(mql)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

// ── Componente ──────────────────────────────────────────────────
function Home() {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  const sentinelRef = useRef(null)
  const cargasRef = useRef(0)

  const [tasa, setTasa] = useState(null)
  const [ofertas, setOfertas] = useState([])
  const [todosProductos, setTodosProductos] = useState([])
  const [secciones, setSecciones] = useState([])
  const [cargandoVitrina, setCargandoVitrina] = useState(true)

  // Estado del infinite scroll
  const [cargasRestantes, setCargasRestantes] = useState(MAX_CARGAS)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [seccionesDinamicas, setSeccionesDinamicas] = useState([])

  const productosIniciales = todosProductos.slice(0, PRODUCTOS_POR_CARGA)

  // ── Carga inicial ───────────────────────────────────────────
  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasa(res.data.usd_a_ves))
      .catch((err) => console.error(err))

    api
      .get('/products')
      .then((res) => {
        const activos = res.data.filter((p) => p.activo)
        setTodosProductos(activos)
        setOfertas(activos.filter((p) => p.descuento_activo).slice(0, 12))
        setSecciones(agruparPorLinea(activos))
      })
      .catch((err) => console.error(err))
      .finally(() => setCargandoVitrina(false))
  }, [])

  // ── Infinite scroll (carga por etapas mientras se scrollea) ──
  const cargarMas = useCallback(() => {
    if (cargasRef.current >= MAX_CARGAS) return
    setCargandoMas(true)

    setTimeout(() => {
      const cargaIdx = cargasRef.current
      const inicio = PRODUCTOS_POR_CARGA * (cargaIdx + 1)
      const fin = inicio + PRODUCTOS_POR_CARGA
      const nuevosProductos = todosProductos.slice(inicio, fin)

      const configs = SECCIONES_DINAMICAS[cargaIdx] || []
      const nuevasSecciones = configs.map((cfg, i) => ({
        id: `dinamica-${cargaIdx}-${i}`,
        titulo: cfg.titulo,
        productos: nuevosProductos.slice(i * 6, (i + 1) * 6),
        verTodoTo: cfg.verTodoTo,
      }))

      setSeccionesDinamicas((prev) => [...prev, ...nuevasSecciones])
      cargasRef.current += 1
      setCargasRestantes(MAX_CARGAS - cargasRef.current)
      setCargandoMas(false)
    }, 800)
  }, [todosProductos])

  useEffect(() => {
    if (cargasRestantes <= 0 || cargandoMas) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cargarMas()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cargasRestantes, cargandoMas, cargarMas])

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="home">
      {/* ── Dashboard reducido: bienvenida + accesos rápidos, solo en teléfono ── */}
      {isMobile && user && (
        <DashboardMobile user={user} tasa={tasa} />
      )}

      {/* ── Hero banner ── */}
      <section className="home__hero">
        <HeroCarrusel slides={HERO_SLIDES} intervaloMs={5000} />
      </section>

      {/* ── Vitrina: carruseles fijos + ads ── */}
      <div className="home__vitrina">
        <HomeCarrusel
          titulo="Ofertas destacadas"
          subtitulo="Precios con descuento activo"
          productos={ofertas}
          tasaVes={tasa}
          verTodoTo="/catalogo"
          cargando={cargandoVitrina}
        />

        <AdBanner
          titulo="Descuentos de temporada"
          subtitulo="Aprovecha los mejores precios de la semana"
          variante="oferta"
          link="/catalogo"
        />

        <HomeCarrusel
          titulo="Recomendados para ti"
          subtitulo="Seleccionados para tu clínica o farmacia"
          productos={productosIniciales}
          tasaVes={tasa}
          verTodoTo="/catalogo"
          cargando={cargandoVitrina}
        />

        <div className="home__ads-pair">
          <AdCard
            titulo="Nuevos productos"
            subtitulo="Descubrí lo último que llegó"
            variante="nuevo"
            link="/catalogo"
          />
          <AdCard
            titulo="Ofertas relámpago"
            subtitulo="No te quedes sin el tuyo"
            variante="oferta"
            link="/catalogo"
          />
        </div>

        <SeccionesCarrusel
          titulo="Rollbacks y más"
          secciones={secciones}
          tasaVes={tasa}
          cargando={cargandoVitrina}
        />

        {/* ── Secciones dinámicas (cargadas por infinite scroll) ── */}
        {seccionesDinamicas.map((seccion, idx) => (
          <div key={seccion.id} className="home__bloque-dinamico">
            {idx % 2 === 1 && (
              <AdBanner
                titulo="Promoción exclusiva"
                subtitulo="Solo por tiempo limitado"
                variante="nuevo"
                link="/catalogo"
              />
            )}
            <HomeCarrusel
              titulo={seccion.titulo}
              productos={seccion.productos}
              tasaVes={tasa}
              verTodoTo={seccion.verTodoTo}
              cargando={false}
            />
            {idx % 2 === 0 && seccionesDinamicas.length > 1 && idx === seccionesDinamicas.length - 1 && (
              <div className="home__ads-pair">
                <AdCard
                  titulo="Te puede interesar"
                  subtitulo="Productos que otros compran"
                  link="/catalogo"
                />
                <AdCard
                  titulo="Ofertas del día"
                  subtitulo="Precios que no vas a encontrar mañana"
                  variante="oferta"
                  link="/catalogo"
                />
              </div>
            )}
          </div>
        ))}

        {/* ── Sentinel para infinite scroll ── */}
        {cargasRestantes > 0 && (
          <div ref={sentinelRef} className="home__sentinel" />
        )}
        {cargandoMas && <InfiniteScrollLoader />}
      </div>

      {/* ── Footer (solo tras agotar las cargas) ── */}
      {cargasRestantes <= 0 && (
        <div className="home__footer-wrapper">
          <Footer />
        </div>
      )}

      {/* Espaciador para bottom nav */}
      <div className="home__espaciador" aria-hidden="true" />
      <BottomNav />

      {user && <CookieConsent />}
    </div>
  )
}

export default Home
