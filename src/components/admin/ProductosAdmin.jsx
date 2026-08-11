import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import ProductoForm from './ProductoForm'
import ProductoCard from './ProductoCard'
import EstadisticasProductos from './EstadisticasProductos'
import './ProductosAdmin.css'

const LINEAS = ['Linea Hospitalaria', 'Linea Farmacia', 'Material Medico']
const FORMAS = ['Ampollas', 'Tabletas', 'Jarabes']
const ITEMS_POR_PAGINA = 10

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroLinea, setFiltroLinea] = useState('')
  const [filtroForma, setFiltroForma] = useState('')
  const [filtroDisponible, setFiltroDisponible] = useState('todos') // todos, disponible, no-disponible
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [vista, setVista] = useState('tabla') // tabla o cards
  const [paginaActual, setPaginaActual] = useState(1)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [ordenarPor, setOrdenarPor] = useState('nombre')
  const [ordenDireccion, setOrdenDireccion] = useState('asc')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setCargando(true)
      const [resProductos, resMarcas] = await Promise.all([
        api.get('/products'),
        api.get('/marcas'),
      ])
      setProductos(resProductos.data)
      setMarcas(resMarcas.data)
    } catch (err) {
      setError('No se pudieron cargar los productos')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setProductoEnEdicion(null)
    setMostrarForm(true)
  }

  function abrirEdicion(producto) {
    setProductoEnEdicion(producto)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setProductoEnEdicion(null)
  }

  async function handleGuardado() {
    cerrarForm()
    await cargarDatos()
  }

  async function eliminarProducto(id) {
    try {
      await api.delete(`/products/${id}`)
      setProductoAEliminar(null)
      await cargarDatos()
    } catch (err) {
      setError('Error al eliminar el producto')
      console.error(err)
    }
  }

  function duplicarProducto(producto) {
    const productoDuplicado = {
      ...producto,
      id: undefined,
      nombre_comercial: `${producto.nombre_comercial} (copia)`,
      activo: true
    }
    setProductoEnEdicion(productoDuplicado)
    setMostrarForm(true)
  }

  // Filtros y búsqueda
  const productosFiltrados = useMemo(() => {
    return productos
      .filter((producto) => {
        const texto = busqueda.toLowerCase()
        const coincideTexto =
          !texto ||
          producto.nombre_comercial?.toLowerCase().includes(texto) ||
          producto.marcas?.nombre?.toLowerCase().includes(texto) ||
          producto.laboratorio?.toLowerCase().includes(texto) ||
          producto.molecula?.toLowerCase().includes(texto)

        const coincideLinea = !filtroLinea || producto.linea === filtroLinea
        const coincideForma = !filtroForma || producto.forma === filtroForma
        const coincideDisponible = 
          filtroDisponible === 'todos' ||
          (filtroDisponible === 'disponible' && producto.disponible) ||
          (filtroDisponible === 'no-disponible' && !producto.disponible)

        return coincideTexto && coincideLinea && coincideForma && coincideDisponible
      })
      .sort((a, b) => {
        let valorA, valorB
        
        switch(ordenarPor) {
          case 'nombre':
            valorA = a.nombre_comercial?.toLowerCase()
            valorB = b.nombre_comercial?.toLowerCase()
            break
          case 'precio':
            valorA = Number(a.precio_usd)
            valorB = Number(b.precio_usd)
            break
          case 'marca':
            valorA = a.marcas?.nombre?.toLowerCase()
            valorB = b.marcas?.nombre?.toLowerCase()
            break
          default:
            valorA = a.nombre_comercial?.toLowerCase()
            valorB = b.nombre_comercial?.toLowerCase()
        }

        if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1
        if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1
        return 0
      })
  }, [productos, busqueda, filtroLinea, filtroForma, filtroDisponible, ordenarPor, ordenDireccion])

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

  // Reset página cuando cambian filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroLinea, filtroForma, filtroDisponible])

  function toggleOrden(campo) {
    if (ordenarPor === campo) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenarPor(campo)
      setOrdenDireccion('asc')
    }
  }

  function exportarCSV() {
    const headers = ['Nombre Comercial', 'Marca', 'Laboratorio', 'País', 'Línea', 'Forma', 'Precio USD', 'Disponible']
    const rows = productosFiltrados.map(p => [
      p.nombre_comercial,
      p.marcas?.nombre,
      p.laboratorio,
      p.pais_origen,
      p.linea,
      p.forma,
      p.precio_usd,
      p.disponible ? 'Sí' : 'No'
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'productos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarDatos} className="btn-reintentar">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="productos-admin">
      {/* Header */}
      <div className="section-header">
        <div className="header-top">
          <h2>📦 Productos</h2>
          <div className="header-actions">
            <button onClick={exportarCSV} className="btn-exportar" title="Exportar a CSV">
              📥 Exportar
            </button>
            <button onClick={abrirNuevo} className="btn-agregar">
              + Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasProductos productos={productos} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filtros">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={filtroLinea} 
            onChange={(e) => setFiltroLinea(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las líneas</option>
            {LINEAS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select 
            value={filtroForma} 
            onChange={(e) => setFiltroForma(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las formas</option>
            {FORMAS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select 
            value={filtroDisponible} 
            onChange={(e) => setFiltroDisponible(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="disponible">Disponibles</option>
            <option value="no-disponible">No disponibles</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <div className="vista-toggle">
            <button 
              className={`vista-btn ${vista === 'tabla' ? 'active' : ''}`}
              onClick={() => setVista('tabla')}
              title="Vista tabla"
            >
              📋
            </button>
            <button 
              className={`vista-btn ${vista === 'cards' ? 'active' : ''}`}
              onClick={() => setVista('cards')}
              title="Vista cards"
            >
              🎴
            </button>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div className="resultados-info">
        Mostrando {productosPaginados.length} de {productosFiltrados.length} productos
        {busqueda && ` (filtrados de ${productos.length} totales)`}
      </div>

      {/* Contenido principal */}
      {vista === 'tabla' ? (
        <div className="table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th className="col-img">Imagen</th>
                <th onClick={() => toggleOrden('nombre')} className="sortable">
                  Nombre Comercial {ordenarPor === 'nombre' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('marca')} className="sortable">
                  Marca {ordenarPor === 'marca' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th>Laboratorio</th>
                <th>Línea/Forma</th>
                <th onClick={() => toggleOrden('precio')} className="sortable">
                  Precio USD {ordenarPor === 'precio' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.map((producto) => (
                <tr key={producto.id} className={!producto.activo ? 'inactivo' : ''}>
                  <td>
                    <div className="producto-img-mini">
                      {producto.foto_url ? (
                        <img src={producto.foto_url} alt={producto.nombre_comercial} />
                      ) : (
                        <div className="no-img">📦</div>
                      )}
                    </div>
                  </td>
                  <td className="nombre-cell">
                    <div className="nombre-producto">{producto.nombre_comercial}</div>
                    {producto.molecula && (
                      <div className="molecula-text">{producto.molecula}</div>
                    )}
                  </td>
                  <td>{producto.marcas?.nombre}</td>
                  <td>
                    <div>{producto.laboratorio}</div>
                    <div className="pais-text">{producto.pais_origen}</div>
                  </td>
                  <td>
                    <span className="badge badge-linea">{producto.linea || '-'}</span>
                    <span className="badge badge-forma">{producto.forma || '-'}</span>
                  </td>
                  <td className="precio-cell">${Number(producto.precio_usd).toFixed(2)}</td>
                  <td>
                    <div className="estado-badges">
                      <span className={`estado-badge ${producto.disponible ? 'disponible' : 'no-disponible'}`}>
                        {producto.disponible ? 'Disponible' : 'Cotizar'}
                      </span>
                      {!producto.activo && (
                        <span className="estado-badge inactivo-badge">Inactivo</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="acciones-cell">
                      <button 
                        onClick={() => abrirEdicion(producto)}
                        className="btn-icon" 
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => duplicarProducto(producto)}
                        className="btn-icon" 
                        title="Duplicar"
                      >
                        📋
                      </button>
                      <button 
                        onClick={() => setProductoAEliminar(producto)}
                        className="btn-icon btn-danger" 
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards-grid">
          {productosPaginados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEditar={() => abrirEdicion(producto)}
              onDuplicar={() => duplicarProducto(producto)}
              onEliminar={() => setProductoAEliminar(producto)}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            onClick={() => setPaginaActual(1)}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >
            ⏮️
          </button>
          <button 
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >
            ◀️
          </button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(p => 
              p === 1 || 
              p === totalPaginas || 
              Math.abs(p - paginaActual) <= 2
            )
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span className="paginacion-dots">...</span>}
                <button
                  onClick={() => setPaginaActual(p)}
                  className={`btn-pagina ${paginaActual === p ? 'active' : ''}`}
                >
                  {p}
                </button>
              </span>
            ))}
          
          <button 
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >
            ▶️
          </button>
          <button 
            onClick={() => setPaginaActual(totalPaginas)}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >
            ⏭️
          </button>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {productoAEliminar && (
        <div className="modal-overlay" onClick={() => setProductoAEliminar(null)}>
          <div className="modal-content modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Confirmar Eliminación</h3>
            <p>¿Estás seguro de eliminar el producto <strong>{productoAEliminar.nombre_comercial}</strong>?</p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-acciones">
              <button 
                onClick={() => setProductoAEliminar(null)}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={() => eliminarProducto(productoAEliminar.id)}
                className="btn-eliminar"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del formulario */}
      {mostrarForm && (
        <ProductoForm
          producto={productoEnEdicion}
          marcas={marcas}
          onClose={cerrarForm}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}

export default ProductosAdmin