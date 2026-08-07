import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom' // 🆕 Importar useSearchParams
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/Productcardskeleton'

import './Catalogo.css'

// ... (categoriasFiltro y filtrosRapidos se mantienen igual)

function Catalogo() {
  const [searchParams] = useSearchParams() // 🆕 Obtener parámetros de URL
  
  // 🆕 Obtener el término de búsqueda de la URL
  const searchTerm = searchParams.get('search') || ''
  
  const [productos, setProductos] = useState([])
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [sort, setSort] = useState('nombre_asc')
  const [categoriaActiva, setCategoriaActiva] = useState('todos')

  // ... (resto de estados se mantienen igual)

  const carruselRef = useRef(null)

  // 🆕 useEffect modificado para usar searchTerm
  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      
      try {
        // Si hay término de búsqueda, pasarlo al backend
        const endpoint = searchTerm 
          ? `/products?search=${encodeURIComponent(searchTerm)}`
          : '/products'
        
        const [resProductos, resTasa] = await Promise.all([
          api.get(endpoint), // 🆕 Usar endpoint dinámico
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
    
    // 🆕 Limpiar filtros locales cuando hay búsqueda
    if (searchTerm) {
      limpiarFiltros()
    }
  }, [searchTerm]) // 🆕 Dependencia: se ejecuta cuando cambia el searchTerm

  // ... (laboratoriosDisponibles, formasDisponibles se mantienen igual)

  // ... (productosFiltrados se mantiene igual, pero ahora ya vienen filtrados del backend)
  
  // ... (toggleSeccion, irAFiltro, toggleEnArray, scrollCarrusel se mantienen igual)

  function limpiarFiltros() {
    setCategoriaActiva('todos')
    setLaboratoriosActivos([])
    setFormasActivas([])
    setSoloDisponibles(false)
    setPrecioMin('')
    setPrecioMax('')
  }

  // ... (resto del código)

  return (
    <div className="catalogo-layout">
      {/* ... barra superior igual ... */}

      {/* ... carrusel de categorías igual ... */}

      <div className="catalogo-divider"></div>

      {/* 🆕 Header modificado para mostrar búsqueda */}
      <header className="catalogo-header">
        <div className="header-titles">
          <h1>
            {searchTerm ? (
              <>Resultados para "{searchTerm}"</>
            ) : (
              <>Resultados para "{categoriaActiva === 'todos' ? 'Catálogo' : categoriaActiva}"</>
            )}
            {' '}
            <span>({productosFiltrados.length} artículos)</span>
          </h1>
          <p className="header-subtitle">
            {searchTerm 
              ? `Mostrando productos que coinciden con "${searchTerm}"`
              : 'Usa los detalles del artículo. Precio al comprar en línea.'
            }
          </p>
          
          {/* 🆕 Botón para limpiar búsqueda y mostrar todo */}
          {searchTerm && (
            <button 
              className="btn-limpiar-busqueda" 
              onClick={() => {
                // Navegar a catálogo sin búsqueda
                window.history.pushState({}, '', '/catalogo')
                // Forzar recarga de productos
                setCategoriaActiva('todos')
              }}
            >
              ← Volver al catálogo completo
            </button>
          )}
        </div>
      </header>

      {/* ... resto del código igual ... */}
    </div>
  )
}

export default Catalogo