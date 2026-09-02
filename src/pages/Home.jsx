import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import HeroCarrusel from '../components/HeroCarrusel'
import HomeCarrusel from '../components/HomeCarrusel'
import { ExploraCategorias, ExploraLaboratorios } from '../components/ExploraCarrusel'
import SeccionesCarrusel from '../components/SeccionesCarrusel'
import AdBanner from '../components/AdBanner'
import AdCard from '../components/AdCard'
import InfiniteScrollLoader from '../components/InfiniteScrollLoader'
import Footer from '../components/Footer'
import BottomNav from '../components/BottomNav'
import CookieConsent from '../components/CookieConsent'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import BloquePromocional from '../components/BloquePromocional'
import SeccionPromocional from '../components/SeccionPromocional'
import './Home.css'

// ── Constantes ──────────────────────────────────────────────────
const PRODUCTOS_POR_CARGA = 12
const MAX_CARGAS = 3

// Configuración de las secciones dinámicas que se cargan al scrollear.
// Cada entrada del array = una "carga" (etapa) del infinite scroll.
const SECCIONES_DINAMICAS = [
  [
    { titulo: 'Nuevos para ti', verTodoTo: '/catalogo' },
    { titulo: 'Explorá el catálogo', verTodoTo: '/catalogo' },
  ],
  [
    { titulo: 'Más populares', verTodoTo: '/catalogo' },
    { titulo: 'Descubrí más', verTodoTo: '/catalogo' },
  ],
  [
    { titulo: 'Elegidos para tu farmacia', verTodoTo: '/catalogo' },
    { titulo: 'Últimas unidades', verTodoTo: '/catalogo' },
  ],
]

// ── Imágenes de los banners hero (Supabase Storage, mismo patrón que Landing) ──
const BASE_URL = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'

const urlsHero = {
  banner1: `${BASE_URL}/banner1.png`,
  banner2: `${BASE_URL}/banner2.png`,
  banner3: `${BASE_URL}/banner3.png`,
}

// Slides del hero. Cada slide usa una sola imagen como fondo; el CSS la
// recorta sola en móvil (object-fit: cover).
// Para cambiar texto/botón/imagen editá acá directo.
const HERO_SLIDES = [
  {
    id: 1,
    imagen: urlsHero.banner1,
    alt: 'Descuentos de temporada',
    subtitulo: 'Descuentos de temporada',
    titulo: 'Tu farmacia ahorra hasta 30% en cada compra',
    botonTexto: 'Ver ofertas',
    botonLink: '/catalogo',
  },
  {
    id: 2,
    imagen: urlsHero.banner2,
    alt: 'Nuevos productos',
    subtitulo: 'Recién llegados',
    titulo: 'Descubrí los nuevos productos para tu clínica',
    botonTexto: 'Explorar catálogo',
    botonLink: '/catalogo',
  },
  {
    id: 3,
    imagen: urlsHero.banner3,
    alt: 'Ofertas relámpago',
    subtitulo: 'Solo por hoy',
    titulo: 'Ofertas relámpago con la mejor tasa del día',
    botonTexto: 'Aprovechar ahora',
    botonLink: '/catalogo',
  },
]

// ── Componente ──────────────────────────────────────────────────
function Home() {
  const { user } = useAuth()

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
      <div className="home__container">
      {/* ── Hero banner ── */}
      <section className="home__hero">
        <HeroCarrusel slides={HERO_SLIDES} intervaloMs={5000} />
      </section>

      {/* ── Explorá por categoría (colocado justo tras el hero) ── */}
      <ExploraCategorias />
  
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

        {/* ── Bloques promocionales: grid tipo bento, imagen + texto/CTA superpuestos ──
          Sin `imagen` todavía → cada bloque cae en modo placeholder (mismo patrón que
          AdBanner/AdCard). Cuando tengas las artes, agrega `imagen`/`imagenMovil` a
          cada BloquePromocional con la URL real. */}
      <section className="home__bloques-promocionales">
        <BloquePromocional
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/quirofano.png"
          className="home__bloque-a"
          tamano="grande"
          posicionTexto="arriba"
          titulo="Insumos quirúrgicos para cada procedimiento"
          subtitulo="Todo el equipamiento que tu quirófano necesita"
          textoCta="Comprar ahora"
          link="/hospitalaria"
        />
        <BloquePromocional
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/ampollas.png"
          className="home__bloque-b"
          tamano="mediano"
          posicionTexto="arriba"
          titulo="Inyectables con cadena de frío garantizada"
          textoCta="Conocer más"
          estiloCta="enlace"
          link="/ayuda"
        />
        <BloquePromocional
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/medicamentos.png"
          className="home__bloque-c"
          tamano="pequeno"
          variante="oferta"
          titulo="Encuentra cualquier presentación"
          textoCta="Linea Farmacia"
          link="/farmacia"
        />
        <BloquePromocional
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/ampolla.jpg"
          className="home__bloque-e"
          tamano="pequeno"
          variante="nuevo"
          titulo="Cada lote, verificado antes de enviarse"
          textoCta="Explorar"
          estiloCta="enlace"
          link="/ayuda"
        />
        <BloquePromocional
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/repartidor.jpg"
          className="home__bloque-d"
          tamano="grande"
          posicionTexto="arriba"
          titulo="Entregas rápidas y programadas, sin filas ni esperas"
          subtitulo="Recibe tus pedidos donde estés"
          textoCta="Conocer más"
          estiloCta="enlace"
          link="/ayuda"
        />
      </section>

      <SeccionesCarrusel
          titulo="Rollbacks y más"
          secciones={secciones}
          cargando={cargandoVitrina}
        />


        {/* ── Explorá por laboratorio (sección aparte, más abajo) ── */}
        <ExploraLaboratorios />

        {/* ── Sección promocional: imagen + carrusel (imagen a la izquierda) ── */}
      <SeccionPromocional
        imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/quirofano.png"
        alt="Productos hospitalarios"
        titulo="Insumos quirúrgicos para cada procedimiento"
        subtitulo="Equipamiento completo para tu clínica"
        badgeTexto="Desde 20% off"
        textoCta="Comprar ahora"
        linkCta="/hospitalaria"
        linkImagen="/hospitalaria"
        productos={ofertas}
        tasaVes={tasa}
        tituloCarrusel="Más vendidos"
        verTodoTo="/catalogo"
        cargando={cargandoVitrina}
      />

        {/* ── Sección promocional invertida: imagen a la derecha ── */}
        <SeccionPromocional
          invertido
          imagen="https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages/ampollas.png"
          alt="Inyectables"
          titulo="Inyectables con cadena de frío garantizada"
          textoCta="Conocer más"
          linkCta="/ayuda"
          linkImagen="/ayuda"
          productos={productosIniciales}
          tasaVes={tasa}
          tituloCarrusel="Recomendados para ti"
          verTodoTo="/catalogo"
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
            {/* ── Explorá por categoría (colocado justo tras el hero) ── */}
        <ExploraCategorias />
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

      </div>{/* fin home__container */}

      {/* Espaciador para bottom nav */}
      <div className="home__espaciador" aria-hidden="true" />
      <BottomNav />

      {user && <CookieConsent />}
    </div>
  )
}

export default Home
