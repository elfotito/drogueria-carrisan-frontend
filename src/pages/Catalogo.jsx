import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
// Importa tu BuscadorFiltro cuando estés listo para conectarlo
// import BuscadorFiltro from '../components/BuscadorFiltro'
import './Catalogo.css'

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')

  // Datos mockeados para la barra superior de categorías rápidas
  const categoriasRapidas = [
    { id: 1, nombre: 'Analgésicos', icon: '💊' },
    { id: 2, nombre: 'Cuidado Personal', icon: '🧴' },
    { id: 3, nombre: 'Vitaminas', icon: '🛡️' },
    { id: 4, nombre: 'Infantil', icon: '👶' },
    { id: 5, nombre: 'Ofertas hoy', icon: '🏷️' },
    { id: 6, nombre: 'Primeros Auxilios', icon: '🩹' },
  ]

  // Simulación de carga
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

  if (error) return <p className="catalogo-estado catalogo-error">{error}</p>

  return (
    <div className="catalogo-layout">
      
      {/* 1. Barra de Categorías Rápidas (Top) */}
      <section className="catalogo-quick-links">
        {categoriasRapidas.map(cat => (
          <button key={cat.id} className="quick-link-item">
            <div className="quick-link-icon">{cat.icon}</div>
            <span className="quick-link-text">{cat.nombre}</span>
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
          {/* Aquí iría tu componente <BuscadorFiltro />, pero te dejo la maquetación visual */}
          
          <div className="filtro-seccion">
            <h3 className="filtro-titulo">Sugeridos</h3>
            <div className="filtro-pills-container">
              <button className="filtro-pill">Tabletas</button>
              <button className="filtro-pill">Cápsulas</button>
              <button className="filtro-pill">Jarabe</button>
              <button className="filtro-pill">Adulto</button>
              <button className="filtro-pill">Ibuprofeno</button>
            </div>
          </div>

          <div className="filtro-seccion">
            <button className="filtro-accordion-btn">
              <span>Precio</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className="filtro-seccion">
            <button className="filtro-accordion-btn">
              <span>Marca</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className="filtro-seccion">
            <button className="filtro-accordion-btn">
              <span>Presentación</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          
          <div className="filtro-seccion">
            <button className="filtro-accordion-btn">
              <span>Disponibilidad</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </aside>

        {/* 3. Área Principal (Header y Grid) */}
        <main className="catalogo-main-content">
          <header className="catalogo-header">
            <div className="header-titles">
              <h1>
                Resultados para <strong>"búsqueda"</strong> <span>({productos.length})</span>
              </h1>
              <p className="header-subtitle">
                Utiliza los detalles del artículo. Precio al comprar en línea.
              </p>
            </div>
            
            {/* Controles de orden */}
            <div className="catalogo-controles">
               <button
                  type="button"
                  className="btn-filtros-mobile"
                  onClick={() => setFiltrosAbiertos((v) => !v)}
                >
                  Filtros
                </button>
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
          </header>

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
        </main>
      </div>
    </div>
  )
}

export default Catalogo