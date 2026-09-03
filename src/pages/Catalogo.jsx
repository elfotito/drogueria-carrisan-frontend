import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
import BottomNav from '../components/BottomNav'
import InfiniteScrollLoader from '../components/InfiniteScrollLoader'
import Footer from '../components/Footer'
import './Catalogo.css'

const PAGE_SIZE = 24

const categoriasFiltro = [
  { id: 'todos', nombre: 'Todo', icono: '🗂️' },
  { id: 'Analgésicos', nombre: 'Analgésicos', icono: '💊' },
  { id: 'Cuidado Personal', nombre: 'Cuidado Personal', icono: '🧴' },
  { id: 'Vitaminas', nombre: 'Vitaminas', icono: '🍊' },
  { id: 'Infantil', nombre: 'Infantil', icono: '🧸' },
  { id: 'Primeros Auxilios', nombre: 'Primeros Auxilios', icono: '🩹' },
]

function Catalogo() {
  const [searchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const categoriaParam = searchParams.get('categoria') || ''
  const laboratorioParam = searchParams.get('laboratorio') || ''

  const [productos, setProductos] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')
  const [categoriaActiva, setCategoriaActiva] = useState(categoriaParam || 'todos')
  const [laboratoriosActivos, setLaboratoriosActivos] = useState(
    laboratorioParam ? [laboratorioParam] : []
  )
  const [formasActivas, setFormasActivas] = useState([])
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [moleculaInput, setMoleculaInput] = useState('')
const [moleculaActiva, setMoleculaActiva] = useState('')
  const [laboratoriosDisponibles, setLaboratoriosDisponibles] = useState([])
  const [formasDisponibles, setFormasDisponibles] = useState([])

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    categoria: true,
    laboratorio: false,
    forma: false,
    disponibilidad: false,
    precio: false,
  })

  const carruselRef = useRef(null)

const [esDesktop, setEsDesktop] = useState(
  typeof window !== 'undefined' ? window.innerWidth > 768 : true
)

useEffect(() => {
  function handleResize() {
    setEsDesktop(window.innerWidth > 768)
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

  // ── Metadata de filtros (laboratorios/formas) — un solo fetch ligero ──
  useEffect(() => {
    api
      .get('/products/metadata')
      .then((res) => {
        setLaboratoriosDisponibles(res.data.laboratorios || [])
        setFormasDisponibles(res.data.formas || [])
      })
      .catch((err) => console.error('Error al cargar metadata de filtros:', err))
  }, [])

  // Construye los parámetros de consulta a partir del estado actual de filtros.
  const construirQuery = useCallback((
    { search = searchTerm, page = 1, limit = PAGE_SIZE } = {}
  ) => {
    const params = { sort, page, limit }
    if (search) params.search = search
    if (categoriaActiva !== 'todos') params.linea = categoriaActiva
    if (laboratoriosActivos.length > 0) params.laboratorio = laboratoriosActivos.join(',')
    if (formasActivas.length > 0) params.forma = formasActivas.join(',')
    if (soloDisponibles) params.disponible = 'true'
    if (precioMin !== '') params.precio_min = precioMin
    if (precioMax !== '') params.precio_max = precioMax
    return params
  }, [searchTerm, sort, categoriaActiva, laboratoriosActivos, formasActivas, soloDisponibles, precioMin, precioMax])

  // Carga una página determinada. Si `reset` es true, reemplaza la lista
  // (primera página); si es false, agrega al final (infinite scroll).
  // El estado de carga se maneja aquí dentro (no en el body de un effect).
  const cargarPagina = useCallback(async ({ page, reset } = {}) => {
    if (reset) {
      setCargando(true)
      setError('')
    } else {
      setCargandoMas(true)
    }
    try {
      const { data } = await api.get('/products', { params: construirQuery({ page }) })
      const nuevos = data.productos || []
      setTotal(data.total ?? nuevos.length)
      setHasMore(!!data.hasMore)
      setPagina(data.page ?? page)
      setProductos(prev => (reset ? nuevos : [...prev, ...nuevos]))
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('No se pudieron cargar los productos')
    } finally {
      if (reset) setCargando(false)
      else setCargandoMas(false)
    }
  }, [construirQuery])

  // Carga inicial + cada vez que cambian búsqueda, orden o filtros → página 1.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPagina({ page: 1, reset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sort, categoriaActiva, laboratoriosActivos, formasActivas, soloDisponibles, precioMin, precioMax])

  // Tasa de cambio ves — global, se carga una sola vez.
  useEffect(() => {
    api
      .get('/prices')
      .then((res) => setTasaVes(res.data.usd_a_ves))
      .catch((err) => console.error(err))
  }, [])

  // ── Infinite scroll: sentinel al final de la grilla → carga siguiente página ──
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (cargando || !hasMore || cargandoMas) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          cargarPagina({ page: pagina + 1, reset: false })
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cargando, hasMore, cargandoMas, pagina, cargarPagina])

  function toggleSeccion(key) {
    setSeccionesAbiertas((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleEnArray(valor, array, setArray) {
    setArray((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]
    )
  }

  function limpiarFiltros() {
    setCategoriaActiva('todos')
    setLaboratoriosActivos([])
    setFormasActivas([])
    setSoloDisponibles(false)
    setPrecioMin('')
    setPrecioMax('')
  }

  function scrollCarrusel(direccion) {
    if (!carruselRef.current) return
    carruselRef.current.scrollBy({ left: direccion * 220, behavior: 'smooth' })
  }

  if (error) return <p className="catalogo-estado catalogo-error">{error}</p>

  const hayFiltrosActivos =
    categoriaActiva !== 'todos' ||
    laboratoriosActivos.length > 0 ||
    formasActivas.length > 0 ||
    soloDisponibles ||
    precioMin !== '' ||
    precioMax !== ''

  return (
    <div className="catalogo-layout">
      {/* Carrusel de categorías — solo mobile */}
      {!esDesktop && (
        <div className="catalogo-carrusel-wrap">
          <div className="catalogo-carrusel" ref={carruselRef}>
            {categoriasFiltro.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`carrusel-item ${categoriaActiva === cat.id ? 'carrusel-item--activo' : ''}`}
                onClick={() => setCategoriaActiva(cat.id)}
              >
                <span className="carrusel-item__icono">{cat.icono}</span>
                <span className="carrusel-item__label">{cat.nombre}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="catalogo-carrusel-flecha"
            onClick={() => scrollCarrusel(1)}
            aria-label="Ver más categorías"
          >
            ›
          </button>
        </div>
      )}

      <header className="catalogo-header">
        <div className="header-titles">
          <h1>
            {searchTerm ? (
              <>Resultados para "{searchTerm}"</>
            ) : (
              <>Resultados para "{categoriaActiva === 'todos' ? 'Catálogo' : categoriaActiva}"</>
            )}
            {' '}
            <span>({total} artículos)</span>
          </h1>
          <p className="header-subtitle">
            {searchTerm
              ? `Mostrando productos que coinciden con "${searchTerm}"`
              : 'Usa los detalles del artículo. Precio al comprar por la plataforma.'
            }
          </p>
        </div>

        {/* Botón Filtros — solo mobile */}
        {!esDesktop && (
          <button
            type="button"
            className="catalogo-filtros-btn"
            onClick={() => setFiltrosAbiertos(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"></circle>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"></circle>
              <line x1="4" y1="18" x2="20" y2="18"></line>
              <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"></circle>
            </svg>
            Filtros
          </button>
        )}

        {/* Ordenar por — desktop */}
        {esDesktop && (
          <div className="catalogo-ordenar-desktop">
            <span className="catalogo-ordenar-label">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="catalogo-sort-select"
            >
              <option value="relevancia">Mejor coincidencia</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>
        )}
      </header>

      <div className="catalogo-body">
        {/* Sidebar filtros — solo desktop */}
        {esDesktop && (
          <aside className="catalogo-filtros">
            {hayFiltrosActivos && (
              <button type="button" className="btn-limpiar-filtros" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}

            {/* Categoría */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('categoria')}>
                <span>Categoría</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.categoria ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.categoria && (
                <div className="filtro-content">
                  {categoriasFiltro.map((cat) => (
                    <button
                      key={cat.id}
                      className={`filtro-pill ${categoriaActiva === cat.id ? 'active' : ''}`}
                      onClick={() => setCategoriaActiva(cat.id)}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Laboratorio */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('laboratorio')}>
                <span>Laboratorio</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.laboratorio ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.laboratorio && (
                <div className="filtro-content">
                  {laboratoriosDisponibles.length === 0 && (
                    <p className="filtro-vacio">Sin datos aún</p>
                  )}
                  {laboratoriosDisponibles.map((lab) => (
                    <button
                      key={lab}
                      className={`filtro-pill ${laboratoriosActivos.includes(lab) ? 'active' : ''}`}
                      onClick={() => toggleEnArray(lab, laboratoriosActivos, setLaboratoriosActivos)}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Forma */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('forma')}>
                <span>Forma</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.forma ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.forma && (
                <div className="filtro-content">
                  {formasDisponibles.length === 0 && (
                    <p className="filtro-vacio">Sin datos aún</p>
                  )}
                  {formasDisponibles.map((forma) => (
                    <button
                      key={forma}
                      className={`filtro-pill ${formasActivas.includes(forma) ? 'active' : ''}`}
                      onClick={() => toggleEnArray(forma, formasActivas, setFormasActivas)}
                    >
                      {forma}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('disponibilidad')}>
                <span>Disponibilidad</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.disponibilidad ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.disponibilidad && (
                <div className="filtro-content">
                  <label className="filtro-checkbox">
                    <input
                      type="checkbox"
                      checked={soloDisponibles}
                      onChange={(e) => setSoloDisponibles(e.target.checked)}
                    />
                    Solo productos disponibles
                  </label>
                </div>
              )}
            </div>

            {/* Precio */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('precio')}>
                <span>Precio (USD)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.precio ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.precio && (
                <div className="filtro-precio-rango">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    min="0"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    min="0"
                  />
                </div>
              )}
            </div>
          </aside>
        )}

        <main className="catalogo-main-content">
          {cargando ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <p className="catalogo-vacio">No encontramos productos para esta búsqueda.</p>
          ) : (
            <div className="product-grid">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} tasaVes={tasaVes} />
              ))}
            </div>
          )}

          {/* Sentinel para infinite scroll */}
          {!cargando && productos.length > 0 && hasMore && (
            <div ref={sentinelRef} className="catalogo-sentinel" />
          )}
          {cargandoMas && <InfiniteScrollLoader />}
        </main>
      </div>

      {/* Bloque informativo + footer — solo al llegar al final de los resultados */}
      {!cargando && total > 0 && !hasMore && (
        <div className="catalogo-final">
          <section className="catalogo-contacto">
            <div className="catalogo-contacto__info">
              <h2>¿No encuentras lo que buscas?</h2>
              <p>
                Cuéntanos qué producto necesitas y haremos todo lo posible por conseguirlo
                para ti. Nuestro equipo lo revisará y te responderá a la brevedad.
              </p>
            </div>
            <Link to="/mis-solicitudes/requerimientos" className="catalogo-contacto__btn">
              ¡Solicítalo aquí!
            </Link>
          </section>
          <Footer />
        </div>
      )}

      {/* Modal filtros — solo mobile */}
      {!esDesktop && filtrosAbiertos && (
        <>
          <div className="catalogo-overlay" onClick={() => setFiltrosAbiertos(false)} />
          <div className="catalogo-filtros-modal">
            <div className="catalogo-filtros-modal__header">
              <span>Filtros</span>
              <button type="button" onClick={() => setFiltrosAbiertos(false)} aria-label="Cerrar filtros">✕</button>
            </div>

            {hayFiltrosActivos && (
              <button type="button" className="btn-limpiar-filtros" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}

            {/* Ordenar por */}
            <div className="filtro-seccion">
              <span className="filtro-seccion__titulo">Ordenar por</span>
              <div className="catalogo-sort-modal-options">
                {[
                  { value: 'relevancia', label: 'Mejor coincidencia' },
                  { value: 'nombre_asc', label: 'Nombre (A-Z)' },
                  { value: 'precio_asc', label: 'Precio: menor a mayor' },
                  { value: 'precio_desc', label: 'Precio: mayor a menor' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`filtro-pill ${sort === opt.value ? 'active' : ''}`}
                    onClick={() => setSort(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('categoria')}>
                <span>Categoría</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.categoria ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.categoria && (
                <div className="filtro-content">
                  {categoriasFiltro.map((cat) => (
                    <button
                      key={cat.id}
                      className={`filtro-pill ${categoriaActiva === cat.id ? 'active' : ''}`}
                      onClick={() => setCategoriaActiva(cat.id)}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Laboratorio */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('laboratorio')}>
                <span>Laboratorio</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.laboratorio ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.laboratorio && (
                <div className="filtro-content">
                  {laboratoriosDisponibles.length === 0 && (
                    <p className="filtro-vacio">Sin datos aún</p>
                  )}
                  {laboratoriosDisponibles.map((lab) => (
                    <button
                      key={lab}
                      className={`filtro-pill ${laboratoriosActivos.includes(lab) ? 'active' : ''}`}
                      onClick={() => toggleEnArray(lab, laboratoriosActivos, setLaboratoriosActivos)}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Forma */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('forma')}>
                <span>Forma</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.forma ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.forma && (
                <div className="filtro-content">
                  {formasDisponibles.length === 0 && (
                    <p className="filtro-vacio">Sin datos aún</p>
                  )}
                  {formasDisponibles.map((forma) => (
                    <button
                      key={forma}
                      className={`filtro-pill ${formasActivas.includes(forma) ? 'active' : ''}`}
                      onClick={() => toggleEnArray(forma, formasActivas, setFormasActivas)}
                    >
                      {forma}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('disponibilidad')}>
                <span>Disponibilidad</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.disponibilidad ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.disponibilidad && (
                <div className="filtro-content">
                  <label className="filtro-checkbox">
                    <input
                      type="checkbox"
                      checked={soloDisponibles}
                      onChange={(e) => setSoloDisponibles(e.target.checked)}
                    />
                    Solo productos disponibles
                  </label>
                </div>
              )}
            </div>

            {/* Precio */}
            <div className="filtro-seccion">
              <button className="filtro-accordion-btn" onClick={() => toggleSeccion('precio')}>
                <span>Precio (USD)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: seccionesAbiertas.precio ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {seccionesAbiertas.precio && (
                <div className="filtro-precio-rango">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    min="0"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    min="0"
                  />
                </div>
              )}
            </div>

            <button type="button" className="catalogo-filtros-modal__apply" onClick={() => setFiltrosAbiertos(false)}>
              Aplicar filtros
            </button>
          </div>
        </>
      )}

      <div className="catalogo-espaciador" aria-hidden="true" />

      <BottomNav />
    </div>
  )
}

export default Catalogo