import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import api from '../../api/axios'
import ProductoForm from './ProductoForm'
import ProductoCard from './ProductoCard'
import EstadisticasProductos from './EstadisticasProductos'
import './ProductosAdmin.css'

const LINEAS = ['Linea Hospitalaria', 'Linea Farmacia', 'Material Medico']
const ITEMS_POR_PAGINA = 20

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [laboratoriosDisponibles, setLaboratoriosDisponibles] = useState([])
  const [formasDisponibles, setFormasDisponibles] = useState([])
  const [stats, setStats] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroLinea, setFiltroLinea] = useState('')
  const [filtroForma, setFiltroForma] = useState('')
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('')
  const [filtroDisponible, setFiltroDisponible] = useState('todos') // todos, disponible, no-disponible
  const [filtroSinPrecio, setFiltroSinPrecio] = useState(false)
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [vista, setVista] = useState('tabla') // tabla o cards
  const [paginaActual, setPaginaActual] = useState(1)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [sort, setSort] = useState('nombre_asc')
  const [precioEditando, setPrecioEditando] = useState({ id: null, valor: '' })
  const [recarga, setRecarga] = useState(0)

  const params = new URLSearchParams()
  if (busqueda) params.set('search', busqueda)
  if (filtroLinea) params.set('linea', filtroLinea)
  if (filtroForma) params.set('forma', filtroForma)
  if (filtroLaboratorio) params.set('laboratorio', filtroLaboratorio)
  if (filtroDisponible === 'disponible') params.set('disponible', 'true')
  if (filtroDisponible === 'no-disponible') params.set('disponible', 'false')
  if (filtroSinPrecio) params.set('sin_precio', 'true')
  params.set('sort', sort)
  params.set('page', String(paginaActual))
  params.set('limit', String(ITEMS_POR_PAGINA))

  useEffect(() => {
    // Sin setState síncrono en el cuerpo del efecto (regla de los
    // hooks de React): el spinner inicial sale de `cargando: true`,
    // y al cambiar filtros la lista anterior queda visible hasta
    // que llega la respuesta.
    let activo = true
    api.get(`/products?${params.toString()}`)
      .then((res) => {
        if (!activo) return
        setProductos(res.data.productos || res.data)
        setTotal(res.data.total != null ? res.data.total : (res.data.length || 0))
      })
      .catch((err) => {
        if (!activo) return
        setError('No se pudieron cargar los productos')
        console.error(err)
      })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, filtroLinea, filtroForma, filtroLaboratorio, filtroDisponible, filtroSinPrecio, sort, paginaActual, recarga])

  useEffect(() => {
    Promise.all([
      api.get('/products/stats'),
      api.get('/marcas'),
      api.get('/products/metadata'),
    ])
      .then(([rStats, rMarcas, rMeta]) => {
        setStats(rStats.data)
        setMarcas(rMarcas.data)
        setLaboratoriosDisponibles(rMeta.data.laboratorios || [])
        setFormasDisponibles(rMeta.data.formas || [])
      })
      .catch((err) => console.error('Error al cargar metadata admin:', err))
  }, [recarga])

  function recargar() {
    setRecarga((r) => r + 1)
  }

  // Cambia un filtro y vuelve a la página 1 (evita quedar en una página
  // vacía tras filtrar). Se llama desde los onChange, no desde un efecto.
  function cambiarFiltro(setter, valor) {
    if (paginaActual !== 1) setPaginaActual(1)
    setter(valor)
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
    recargar()
  }

  async function eliminarProducto(id) {
    try {
      await api.delete(`/products/${id}`)
      setProductoAEliminar(null)
      recargar()
    } catch (err) {
      setError('Error al eliminar el producto')
      console.error(err)
    }
  }

  async function guardarPrecioInline(id) {
    const valor = precioEditando.valor
    setPrecioEditando({ id: null, valor: '' })
    const precio = Number(valor)
    if (!Number.isFinite(precio) || precio < 0) return
    try {
      await api.patch(`/products/${id}`, { precio_usd: precio })
      setError('')
      recargar()
    } catch (err) {
      setError('Error al guardar el precio')
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

  function toggleOrden(campo) {
    const asc = `${campo}_asc`
    const desc = `${campo}_desc`
    if (sort === asc) setSort(desc)
    else if (sort === desc) setSort(asc)
    else setSort(asc)
    if (paginaActual !== 1) setPaginaActual(1)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA))
  const productosPaginados = productos

  function exportarCSV() {
    const headers = ['Nombre Comercial', 'Marca', 'Laboratorio', 'País', 'Línea', 'Forma', 'Precio USD', 'Disponible']
    const rows = productos.map(p => [
      p.nombre_comercial,
      p.marcas?.nombre,
      p.laboratorio,
      p.pais_origen,
      p.linea,
      p.forma,
      p.precio_usd ?? '',
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

  function handleArchivoPrecios(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const hoja = wb.Sheets[wb.SheetNames[0]]
        const filas = XLSX.utils.sheet_to_json(hoja) // { Nombre, Precio ... } según header del archivo
        const items = filas
          .map((f) => ({ id: Number(f['ID'] ?? f['Producto ID'] ?? f['Id']), precio_usd: Number(f['Precio'] ?? f['Precio USD'] ?? f['precio_usd']) }))
          .filter((i) => Number.isFinite(i.id) && Number.isFinite(i.precio_usd))
        await api.post('/products/precios-bulk', { items })
        setError('')
        recargar()
      } catch (err) {
        setError('Error al importar precios: ' + (err.response?.data?.error || err.message))
        console.error(err)
      }
    }
    reader.readAsArrayBuffer(file)
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
        <button onClick={recargar} className="btn-reintentar">
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
            <label htmlFor="precios-file" className="btn-exportar" title="Importar precios desde Excel/CSV (columnas esperadas: ID, Precio)">
              📥 Importar Precios
            </label>
            <input
              id="precios-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleArchivoPrecios}
            />
            <button onClick={abrirNuevo} className="btn-agregar">
              + Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasProductos stats={stats} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filtros">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => cambiarFiltro(setBusqueda, e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={filtroLinea} 
            onChange={(e) => cambiarFiltro(setFiltroLinea, e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las líneas</option>
            {LINEAS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select 
            value={filtroForma} 
            onChange={(e) => cambiarFiltro(setFiltroForma, e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las formas</option>
            {formasDisponibles.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={filtroLaboratorio}
            onChange={(e) => cambiarFiltro(setFiltroLaboratorio, e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los laboratorios</option>
            {laboratoriosDisponibles.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select 
            value={filtroDisponible} 
            onChange={(e) => cambiarFiltro(setFiltroDisponible, e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="disponible">Disponibles</option>
            <option value="no-disponible">No disponibles</option>
          </select>

          <label className="filter-check">
            <input
              type="checkbox"
              checked={filtroSinPrecio}
              onChange={(e) => cambiarFiltro(setFiltroSinPrecio, e.target.checked)}
            />
            Solo sin precio
          </label>
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
        Mostrando {productosPaginados.length} de {total} productos
        {busqueda && ' (filtrados por búsqueda)'}
        {filtroSinPrecio && ' — sin precio'}
      </div>

      {/* Contenido principal */}
      {vista === 'tabla' ? (
        <div className="table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th className="col-img">Imagen</th>
                <th onClick={() => toggleOrden('nombre')} className="sortable">
                  Nombre Comercial {sort === 'nombre_asc' ? '↑' : sort === 'nombre_desc' ? '↓' : ''}
                </th>
                <th onClick={() => toggleOrden('marca')} className="sortable">
                  Marca {sort === 'marca_asc' ? '↑' : sort === 'marca_desc' ? '↓' : ''}
                </th>
                <th>Laboratorio</th>
                <th>Línea/Forma</th>
                <th onClick={() => toggleOrden('precio')} className="sortable">
                  Precio USD {sort === 'precio_asc' ? '↑' : sort === 'precio_desc' ? '↓' : ''}
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
                  <td className="precio-cell">
                    {precioEditando.id === producto.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        autoFocus
                        className="precio-input-inline"
                        value={precioEditando.valor}
                        onChange={(e) => setPrecioEditando({ id: producto.id, valor: e.target.value })}
                        onBlur={() => guardarPrecioInline(producto.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarPrecioInline(producto.id)
                          if (e.key === 'Escape') setPrecioEditando({ id: null, valor: '' })
                        }}
                      />
                    ) : (
                      <button
                        className="precio-cell__btn"
                        onClick={() => setPrecioEditando({ id: producto.id, valor: producto.precio_usd != null ? String(producto.precio_usd) : '' })}
                        title="Editar precio"
                      >
                        {producto.precio_usd != null
                          ? `$${Number(producto.precio_usd).toFixed(2)}`
                          : 'Sin precio'}
                      </button>
                    )}
                  </td>
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