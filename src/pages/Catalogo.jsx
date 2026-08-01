import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
import BuscadorFiltro from '../components/BuscadorFiltro'
import './Catalogo.css'

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')
  // Guardamos los últimos filtros usados por BuscadorFiltro para poder
  // re-disparar la búsqueda cuando cambia el orden, sin tocar BuscadorFiltro
  const [ultimoFiltro, setUltimoFiltro] = useState({ search: '', marca_id: '' })

  // Carga inicial: productos, marcas y tasa, todo en paralelo
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProductos, resMarcas, resTasa] = await Promise.all([
          api.get('/products'),
          api.get('/marcas'),
          api.get('/prices'),
        ])
        setProductos(resProductos.data)
        setMarcas(resMarcas.data)
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

  // useCallback para que esta función no se recree en cada render
  // (si no, dispararía el useEffect del BuscadorFiltro sin necesidad)
  const handleFiltrar = useCallback(async ({ search, marca_id }) => {
    setUltimoFiltro({ search, marca_id })
    try {
      const { data } = await api.get('/products', {
        params: { search, marca_id: marca_id || undefined, sort },
      })
      setProductos(data)
    } catch (err) {
      console.error(err)
    }
  }, [sort])

  // Cuando cambia el orden, re-consultamos con el último search/marca_id usado
  // (sin esto, cambiar el <select> de orden no afectaría los resultados ya cargados)
  const handleCambiarOrden = useCallback(
    async (nuevoSort) => {
      setSort(nuevoSort)
      try {
        const { data } = await api.get('/products', {
          params: {
            search: ultimoFiltro.search,
            marca_id: ultimoFiltro.marca_id || undefined,
            sort: nuevoSort,
          },
        })
        setProductos(data)
      } catch (err) {
        console.error(err)
      }
    },
    [ultimoFiltro]
  )

  if (error) return <p className="catalogo-estado catalogo-error">{error}</p>

  return (
    <div className="catalogo-layout">
      <header className="catalogo-header">
        <h1>Catálogo</h1>
        {cargando ? (
          <div className="skeleton-block skeleton-contador" />
        ) : (
          <p className="catalogo-contador">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} encontrado
            {productos.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {/* Botón toggle de filtros, solo visible en mobile (controlado por CSS) */}
      <button
        type="button"
        className="btn-filtros-mobile"
        onClick={() => setFiltrosAbiertos((v) => !v)}
        aria-expanded={filtrosAbiertos}
      >
        <span>Filtros</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: filtrosAbiertos ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="catalogo-body">
        {/* Overlay que cierra el drawer al tocar afuera (solo activo en mobile cuando está abierto) */}
        {filtrosAbiertos && (
          <div
            className="catalogo-overlay"
            onClick={() => setFiltrosAbiertos(false)}
            aria-hidden="true"
          />
        )}

        <aside className={`catalogo-filtros ${filtrosAbiertos ? 'catalogo-filtros--abierto' : ''}`}>
          <BuscadorFiltro marcas={marcas} onFiltrar={handleFiltrar} />
        </aside>

        <main className="catalogo-grid-wrapper">
          {!cargando && (
            <div className="catalogo-controles">
              <label className="catalogo-orden-label">
                Ordenar por
                <select
                  value={sort}
                  onChange={(e) => handleCambiarOrden(e.target.value)}
                >
                  <option value="nombre_asc">Nombre (A-Z)</option>
                  <option value="nombre_desc">Nombre (Z-A)</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                </select>
              </label>
            </div>
          )}

          {cargando ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <p className="catalogo-vacio">No encontramos productos con esos filtros.</p>
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