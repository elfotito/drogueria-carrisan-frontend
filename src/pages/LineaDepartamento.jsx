import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
import './LineaDepartamento.css'

// Configuración de cada línea. Cuando exista un campo real que distinga
// productos por línea (farmacia / hospitalaria) en la BD, este objeto es
// el único lugar que hay que tocar para conectar el filtro real.
const CONFIG_LINEAS = {
  farmacia: {
    titulo: 'Línea Farmacia',
    icono: '💊',
    eyebrow: 'Departamento',
    bannerTitulo: 'Todo lo esencial para tu farmacia',
    bannerSubtitulo: 'Medicamentos, cuidado personal y más — con despacho rápido y precio siempre visible.',
    ctaTexto: 'Ver catálogo completo',
    categorias: ['Todo', 'Antibióticos', 'Pediátricos', 'Antiflamatorios', 'Cremas'],
  },
  hospitalaria: {
    titulo: 'Línea Hospitalaria',
    icono: '🏥',
    eyebrow: 'Departamento',
    bannerTitulo: 'Insumos para tu clínica o centro de salud',
    bannerSubtitulo: 'Anestesia, antibióticos y soluciones — el stock que tu operación necesita.',
    ctaTexto: 'Ver catálogo completo',
    categorias: ['Todo', 'Anestesia', 'Antibióticos', 'Soluciones'],
  },
}

// NOTA: todavía no existe un campo en `productos` que distinga la línea
// (farmacia vs. hospitalaria) — esta es solo la estructura visual. Por
// ahora se muestra una vista previa del catálogo activo; cuando Tito
// defina cómo se marcan los productos de cada línea, se reemplaza este
// fetch por el filtro real.
function LineaDepartamento({ linea }) {
  const config = CONFIG_LINEAS[linea]
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('Todo')

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      try {
        const [resProductos, resTasa] = await Promise.all([
          api.get('/products'),
          api.get('/prices'),
        ])
        setProductos(resProductos.data.slice(0, 12))
        setTasaVes(resTasa.data.usd_a_ves)
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [linea])

  return (
    <div className="linea-page">
      {/* Chips de categoría — estructura lista, sin lógica de filtrado real aún */}
      <div className="linea-chips-wrap">
        <div className="linea-chips">
          {config.categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`linea-chip ${categoriaActiva === cat ? 'linea-chip--activo' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sección oscura: banner + grid */}
      <div className="linea-dark">
        <section className="linea-banner">
          <div className="linea-banner__texto">
            <span className="linea-banner__eyebrow">{config.eyebrow}</span>
            <h1>{config.bannerTitulo}</h1>
            <p>{config.bannerSubtitulo}</p>
            <Link to="/catalogo" className="linea-banner__cta">{config.ctaTexto}</Link>
          </div>
          <div className="linea-banner__icono" aria-hidden="true">{config.icono}</div>
        </section>

        <div className="linea-preview-nota">
          Vista previa — los productos de esta línea se configuran próximamente.
        </div>

        <div className="linea-grid">
          {cargando ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div className="linea-grid__item" key={i}>
                <ProductCardSkeleton />
              </div>
            ))
          ) : (
            productos.map((producto) => (
              <div className="linea-grid__item" key={producto.id}>
                <ProductCard producto={producto} tasaVes={tasaVes} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LineaDepartamento