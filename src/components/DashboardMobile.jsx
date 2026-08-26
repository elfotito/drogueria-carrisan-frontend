import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import BottomNav from './BottomNav'
import HomeCarrusel from './HomeCarrusel'
import SeccionesCarrusel from './SeccionesCarrusel'
import AdBanner from './AdBanner'
import AdCard from './AdCard'
import InfiniteScrollLoader from './InfiniteScrollLoader'
import Footer from './Footer'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import './DashboardMobile.css'

// ── Constantes ──────────────────────────────────────────────────
const PRODUCTOS_POR_CARGA = 12
const MAX_CARGAS = 2

// Tiles de acceso rápido.
const ACCESOS = [
  {
    to: '/catalogo',
    emoji: '💊',
    titulo: 'Catálogo',
    subtitulo: 'Ver todos los productos',
  },
  {
    to: '/carrito',
    emoji: '🛒',
    titulo: 'Carrito',
    subtitulo: 'Revisa tu pedido actual',
  },
  {
    to: '/orders',
    emoji: '📦',
    titulo: 'Mis pedidos',
    subtitulo: 'Estado y seguimiento',
  },
  {
    to: '/catalogo',
    emoji: '🏷️',
    titulo: 'Ofertas',
    subtitulo: 'Precios destacados',
  },
]

// Configuración de las secciones dinámicas que se cargan al scrollear.
// Cada entrada genera un HomeCarrusel con un título diferente.
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

// ── Componente ──────────────────────────────────────────────────
function DashboardMobile({ user }) {
  const navigate = useNavigate()
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

  // Productos iniciales (slice 0–12)
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

  // ── Infinite scroll ─────────────────────────────────────────
  const cargarMas = useCallback(() => {
    if (cargasRef.current >= MAX_CARGAS) return

    setCargandoMas(true)

    // Simulamos una breve carga para que el usuario vea el spinner.
    // Si en el futuro la API soporta paginación real, acá se haría el fetch.
    setTimeout(() => {
      const cargaIdx = cargasRef.current
      const inicio = PRODUCTOS_POR_CARGA * (cargaIdx + 1)
      const fin = inicio + PRODUCTOS_POR_CARGA
      const nuevosProductos = todosProductos.slice(inicio, fin)

      // Creamos las secciones dinámicas para esta carga.
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

  // Observer que dispara cargarMas cuando el sentinel entra en viewport.
  useEffect(() => {
    if (cargasRestantes <= 0 || cargandoMas) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          cargarMas()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cargasRestantes, cargandoMas, cargarMas])

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="dashboard">
      {/* ── Topbar ── */}
      <header className="dashboard__topbar">
        <div className="dashboard__saludo">
          <span className="dashboard__avatar" aria-hidden="true">
            {user.email?.[0]?.toUpperCase() || '?'}
          </span>
          <div>
            <p className="dashboard__hola">Hola,</p>
            <p className="dashboard__email">{user.email}</p>
          </div>
        </div>
        <div className="dashboard__tasa">
          <span className="dashboard__tasa-label">Tasa</span>
          <span className="dashboard__tasa-valor">
            {tasa ? `Bs. ${tasa.toFixed(2)}` : '—'}
          </span>
        </div>
      </header>

      {/* ── Tiles de acceso rápido ── */}
      <section className="dashboard__accesos">
        <h2>¿Qué necesitas hoy?</h2>
        <div className="dashboard__grid">
          {ACCESOS.map((acceso) => (
            <button
              key={acceso.titulo}
              className="dashboard__tile"
              onClick={() => navigate(acceso.to)}
            >
              <span className="dashboard__tile-emoji" aria-hidden="true">
                {acceso.emoji}
              </span>
              <span className="dashboard__tile-titulo">{acceso.titulo}</span>
              <span className="dashboard__tile-subtitulo">{acceso.subtitulo}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Vitrina: carruseles fijos + ads ── */}
      <HomeCarrusel
        titulo="Ofertas destacadas"
        productos={ofertas}
        tasaVes={tasa}
        verTodoTo="/catalogo"
        cargando={cargandoVitrina}
      />

      <AdBanner
        titulo="Descuentos de temporada"
        subtitulo="Aprovecha los mejores precios de la semana"
        variante="oferta"
      />

      <HomeCarrusel
        titulo="Recomendados para ti"
        productos={productosIniciales}
        tasaVes={tasa}
        verTodoTo="/catalogo"
        cargando={cargandoVitrina}
      />

      <div className="dashboard__ads-pair">
        <AdCard
          titulo="Nuevos productos"
          subtitulo="Descubrí lo último que llegó"
          variante="nuevo"
        />
        <AdCard
          titulo="Ofertas relámpago"
          subtitulo="No te quedes sin el tuyo"
          variante="oferta"
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
        <div key={seccion.id} className="dashboard__bloque-dinamico">
          {idx % 2 === 1 && (
            <AdBanner
              titulo="Promoción exclusiva"
              subtitulo="Solo por tiempo limitado"
              variante="nuevo"
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
            <div className="dashboard__ads-pair">
              <AdCard
                titulo="Te puede interesar"
                subtitulo="Productos que otros compran"
              />
              <AdCard
                titulo="Ofertas del día"
                subtitulo="Precios que no vas a encontrar mañana"
                variante="oferta"
              />
            </div>
          )}
        </div>
      ))}

      {/* ── Sentinel para infinite scroll ── */}
      {cargasRestantes > 0 && (
        <div ref={sentinelRef} className="dashboard__sentinel" />
      )}

      {cargandoMas && <InfiniteScrollLoader />}

      {/* ── Footer (solo tras agotar las cargas) ── */}
      {cargasRestantes <= 0 && (
        <>
          <div className="dashboard__footer-wrapper">
            <Footer />
          </div>
        </>
      )}

      {/* Espaciador para bottom nav */}
      <div className="dashboard__espaciador" aria-hidden="true" />

      <BottomNav />
    </div>
  )
}

export default DashboardMobile
