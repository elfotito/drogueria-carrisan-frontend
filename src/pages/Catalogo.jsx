import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import BuscadorFiltro from '../components/BuscadorFiltro'

function Catalogo() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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
    try {
      const { data } = await api.get('/products', {
        params: { search, marca_id: marca_id || undefined },
      })
      setProductos(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  if (cargando) return <p>Cargando catálogo...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h1>Catálogo</h1>
      <BuscadorFiltro marcas={marcas} onFiltrar={handleFiltrar} />
      <div className="product-grid">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} tasaVes={tasaVes} />
        ))}
      </div>
    </div>
  )
}

export default Catalogo