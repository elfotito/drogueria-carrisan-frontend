import { useState, useEffect, useMemo, useRef } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'

import './Catalogo.css'

// Categorías para el carrusel de íconos (mapea a producto.linea)
const categoriasFiltro = [
  { id: 'todos', nombre: 'Todo', icono: '🗂️' },
  { id: 'Analgésicos', nombre: 'Analgésicos', icono: '💊' },
  { id: 'Cuidado Personal', nombre: 'Cuidado Personal', icono: '🧴' },
  { id: 'Vitaminas', nombre: 'Vitaminas', icono: '🍊' },
  { id: 'Infantil', nombre: 'Infantil', icono: '🧸' },
  { id: 'Primeros Auxilios', nombre: 'Primeros Auxilios', icono: '🩹' },
]

// Barra superior de accesos rápidos: cada uno abre/resalta la sección correspondiente del sidebar
const filtrosRapidos = [
  { key: 'laboratorio', label: 'Laboratorio', icono: '🏷️' },
  { key: 'disponibilidad', label: 'Disponibilidad', icono: '📦' },
  { key: 'forma', label: 'Forma', icono: '⚗️' },
  { key: 'precio', label: 'Precio', icono: '💲' },
]

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')

  // Filtros reales conectados a campos que ya existen en el modelo de productos
  const [laboratoriosActivos, setLaboratoriosActivos] = useState([])
  const [formasActivas, setFormasActivas] = useState([])
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')

  // Control de acordeones del sidebar
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    categoria: true,
    laboratorio: false,
    forma: false,
    disponibilidad: false,
    precio: false,
  })

  const carruselRef = useRef(null)

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProductos, resTasa] = await Promise.all([
          api.get('/products'),
          api.get('/prices'),
        ])
        setProductos(resProductos.data)
        setTasaVes(resTasa.data.usd_a_ves)
      } catch (err) {
        setError('No se pudieron cargar los productos')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  // Listas de opciones derivadas de los productos reales (sin datos inventados)
  const laboratoriosDisponibles = useMemo(() => {
    const set = new Set(productos.map((p) => p.laboratorio).filter(Boolean))
    return Array.from(set).sort()
  }, [productos])

  const formasDisponibles = useMemo(() => {
    const set = new Set(productos.map((p) => p.forma).filter(Boolean))
    return Array.from(set).sort()
  }, [productos])

  const productosFiltrados = useMemo(() => {
    let resultado = productos

    if (categoriaActiva !== 'todos') {
      resultado = resultado.filter((p) => p.linea === categoriaActiva)
    }

    if (laboratoriosActivos.length > 0) {
      resultado = resultado.filter((p) => laboratoriosActivos.includes(p.laboratorio))
    }

    if (formasActivas.length > 0) {
      resultado = resultado.filter((p) => formasActivas.includes(p.forma))
    }

    if (soloDisponibles) {
      resultado = resultado.filter((p) => p.disponible)
    }

    if (precioMin !== '') {
      resultado = resultado.filter((p) => p.precio_usd >= Number(precioMin))
    }
    if (precioMax !== '') {
      resultado = resultado.filter((p) => p.precio_usd <= Number(precioMax))
    }

    const ordenado = [...resultado].sort((a, b) => {
      switch (sort) {
        case 'precio_asc':
          return a.precio_usd - b.precio_usd
        case 'precio_desc':
          return b.precio_usd - a.precio_usd
        case 'nombre_asc':
          return a.nombre_comercial.localeCompare(b.nombre_comercial)
        default:
          return 0
      }
    })

    return ordenado
  }, [productos, categoriaActiva, laboratoriosActivos, formasActivas, soloDisponibles, precioMin, precioMax, sort])

  function toggleSeccion(key) {
    setSeccionesAbiertas((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Los pills de la barra superior abren la sección correspondiente en el sidebar
  // (y, en móvil, abren el drawer completo de filtros).
  function irAFiltro(key) {
    setSeccionesAbiertas((prev) => ({ ...prev, [key]: true }))
    setFiltrosAbiertos(true)
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

      {/* 1. Barra superior de accesos rápidos a filtros (carrusel de pills, solo texto) */}
      <div className="catalogo-filtros-rapidos">
        <button
          type="button"
          className="pill-filtro-sliders"
          onClick={() => setFiltrosAbiertos(true)}
          aria-label="Abrir todos los filtros"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"></circle>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"></circle>
            <line x1="4" y1="18" x2="20" y2="18"></line>
            <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"></circle>
          </svg>
        </button>

        {filtrosRapidos.map((f) => (
          <button
            key={f.key}
            type="button"
            className="pill-filtro-rapido"
            onClick={() => irAFiltro(f.key)}
          >
            <span className="pill-filtro-rapido__icono">{f.icono}</span>
            {f.label}
            <span className="pill-filtro-rapido__chevron">⌄</span>
          </button>
        ))}

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
      </div>

      {/* 2. Carrusel de categorías con ícono */}
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

      <div className="catalogo-divider"></div>

      <header className="catalogo-header">
        <div className="header-titles">
          <h1>
            Resultados para "{categoriaActiva === 'todos' ? 'Catálogo' : categoriaActiva}"{' '}
            <span>({productosFiltrados.length} artículos)</span>
          </h1>
          <p className="header-subtitle">
            Usa los detalles del artículo. Precio al comprar en línea.
          </p>
        </div>
      </header>

      <div className="catalogo-body">
        {/* Overlay mobile */}
        {filtrosAbiertos && (
          <div
            className="catalogo-overlay"
            onClick={() => setFiltrosAbiertos(false)}
            aria-hidden="true"
          />
        )}

        {/* 3. Barra Lateral de Filtros */}
        <aside className={`catalogo-filtros ${filtrosAbiertos ? 'catalogo-filtros--abierto' : ''}`}>
          <div className="catalogo-filtros__header-mobile">
            <span>Filtros</span>
            <button type="button" onClick={() => setFiltrosAbiertos(false)} aria-label="Cerrar filtros">✕</button>
          </div>

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

          {/* Laboratorio — datos reales de producto.laboratorio */}
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

          {/* Forma — datos reales de producto.forma */}
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

          {/* Disponibilidad — conectado a producto.disponible */}
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

          {/* Precio — rango simple conectado a precio_usd */}
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

        {/* 4. Área Principal (Grid de productos) */}
        <main className="catalogo-main-content">
          {cargando ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <p className="catalogo-vacio">No encontramos productos para esta búsqueda.</p>
          ) : (
            <div className="product-grid">
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} tasaVes={tasaVes} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Catalogo