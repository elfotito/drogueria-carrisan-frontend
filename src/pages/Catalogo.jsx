import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
// Importa tu BuscadorFiltro cuando estés listo para conectarlo
// import BuscadorFiltro from '../components/BuscadorFiltro'

import './Catalogo.css'

// Categorías para el filtro sidebar (anteriormente el carrusel horizontal)
const categoriasFiltro = [
  { id: 'todos', nombre: 'Todos' },
  { id: 'Analgésicos', nombre: 'Analgésicos' },
  { id: 'Cuidado Personal', nombre: 'Cuidado Personal' },
  { id: 'Vitaminas', nombre: 'Vitaminas' },
  { id: 'Infantil', nombre: 'Infantil' },
  { id: 'Primeros Auxilios', nombre: 'Primeros Auxilios' },
]

// Datos de ejemplo para píldoras de filtro rápido
const quickFilterPills = ['Tabletas', 'Cápsulas', 'Jarabe', 'Adulto', 'Ibuprofeno', 'Equate', 'En tienda'];

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')

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

  const productosFiltrados = useMemo(() => {
    let resultado = productos

    if (categoriaActiva !== 'todos') {
      resultado = resultado.filter((p) => p.linea === categoriaActiva)
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
  }, [productos, categoriaActiva, sort])

  if (error) return <p className="catalogo-estado catalogo-error">{error}</p>

  return (
    <div className="catalogo-layout">

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

        {/* Controles de orden y filtros (responsive) */}
        <div className="catalogo-controles">
          <button
            type="button"
            className="btn-filtros-mobile-cta"
            onClick={() => setFiltrosAbiertos((v) => !v)}
          >
            Filtros y Ordenar
          </button>
          
          <div className="catalogo-controles__desktop-actions">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="catalogo-sort-select"
            >
              <option value="relevancia">Relevancia</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      </header>

      {/* 1. Carrusel de Píldoras de Filtro Rápido (Nuevo, below header) */}
      <section className="catalogo-filter-quick-pills">
        {quickFilterPills.map((pill) => (
          <button
            key={pill}
            className={`quick-pill-item`}
            onClick={() => {}} // Implementar lógica de filtro rápido aquí
          >
            {pill}
          </button>
        ))}
      </section>

      <div className="catalogo-divider"></div>

      <div className="catalogo-body">
        {/* Overlay mobile */}
        {filtrosAbiertos && (
          <div
            className="catalogo-overlay"
            onClick={() => setFiltrosAbiertos(false)}
            aria-hidden="true"
          />
        )}

        {/* 2. Barra Lateral de Filtros */}
        <aside className={`catalogo-filtros ${filtrosAbiertos ? 'catalogo-filtros--abierto' : ''}`}>
          {/* Categoría Accordion (Moved from horizontal carrusel) */}
          <div className="filtro-seccion">
            <button className="filtro-accordion-btn">
              <span>Categoría</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className="filtro-content active-filters">
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
          </div>

          <div className="filtro-seccion">
            <h3 className="filtro-titulo">Sugeridos (Mobile only?)</h3> 
            <div className="filtro-content">
              {quickFilterPills.slice(0, 5).map(p => <button key={p} className="filtro-pill">{p}</button>)}
            </div>
          </div>

          {/* Acordeones existentes... Precio, Marca, etc. ... */}
        </aside>

        {/* 3. Área Principal (Grid de productos) */}
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