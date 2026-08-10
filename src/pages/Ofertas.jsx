import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'
import './Ofertas.css'

// NOTA: por ahora el único criterio es "producto.descuento_activo" (ya lo
// calcula el backend con el sistema de descuentos). Cuando definamos cómo
// se van a curar/destacar las ofertas (manual, por línea, etc.) ajustamos
// este filtro — la estructura visual de la página ya queda lista.
function Ofertas() {
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      try {
        const [resProductos, resTasa] = await Promise.all([
          api.get('/products'),
          api.get('/prices'),
        ])
        setProductos(resProductos.data)
        setTasaVes(resTasa.data.usd_a_ves)
      } catch (err) {
        setError('No se pudieron cargar las ofertas')
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const productosEnOferta = useMemo(
    () => productos.filter((p) => p.descuento_activo),
    [productos]
  )

  if (error) return <p className="ofertas-estado ofertas-error">{error}</p>

  return (
    <div className="ofertas-layout">
      {/* Header */}
      <header className="ofertas-header">
        <div className="header-titles">
          <h1>
            Ofertas <span>({cargando ? '—' : productosEnOferta.length} artículos)</span>
          </h1>
          <p className="header-subtitle">
            Los mejores precios de la semana, en un solo lugar.
          </p>
        </div>
      </header>

      {/* Banner promocional */}
      <section className="ofertas-banner">
        <div className="ofertas-banner__texto">
          <span className="ofertas-banner__eyebrow">Ofertas Carrisán</span>
          <h2>Ahorra en cada pedido</h2>
          <p>Descuentos activos por producto, marca y laboratorio — actualizados constantemente.</p>
          <Link to="/catalogo" className="ofertas-banner__cta">Ver catálogo completo</Link>
        </div>
        <div className="ofertas-banner__grafico" aria-hidden="true">
          <span className="ofertas-banner__badge">%</span>
        </div>
      </section>

      {/* Chips rápidos (estructura — sin lógica de filtrado todavía) */}
      <div className="ofertas-chips">
        <button type="button" className="ofertas-chip ofertas-chip--activo">Todas</button>
        <button type="button" className="ofertas-chip">Mayor descuento</button>
        <button type="button" className="ofertas-chip">Recién agregadas</button>
        <button type="button" className="ofertas-chip">Por vencer</button>
      </div>

      {/* Grid de productos */}
      <main className="ofertas-main">
        {cargando ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productosEnOferta.length === 0 ? (
          <div className="ofertas-vacio">
            <span className="ofertas-vacio__icono">🏷️</span>
            <h3>Todavía no hay ofertas activas</h3>
            <p>En cuanto activemos descuentos, van a aparecer aquí automáticamente.</p>
            <Link to="/catalogo" className="ofertas-vacio__cta">Ir al catálogo</Link>
          </div>
        ) : (
          <div className="product-grid">
            {productosEnOferta.map((producto) => (
              <ProductCard key={producto.id} producto={producto} tasaVes={tasaVes} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Ofertas