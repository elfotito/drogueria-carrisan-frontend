import { useState, useEffect } from 'react'
import api from '../../api/axios'
import ProductoForm from './ProductoForm'

const LINEAS = ['Linea Hospitalaria', 'Linea Farmacia', 'Material Medico']
const FORMAS = ['Ampollas', 'Tabletas', 'Jarabes']

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroLinea, setFiltroLinea] = useState('')
  const [filtroForma, setFiltroForma] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [productoEnEdicion, setProductoEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
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

  // Filtro en memoria: nombre comercial, marca, laboratorio, molécula + filtros de línea/forma
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase()
    const coincideTexto =
      producto.nombre_comercial?.toLowerCase().includes(texto) ||
      producto.marcas?.nombre?.toLowerCase().includes(texto) ||
      producto.laboratorio?.toLowerCase().includes(texto) ||
      producto.molecula?.toLowerCase().includes(texto)

    const coincideLinea = !filtroLinea || producto.linea === filtroLinea
    const coincideForma = !filtroForma || producto.forma === filtroForma

    return coincideTexto && coincideLinea && coincideForma
  })

  if (cargando) return <p>Cargando productos...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Productos</h2>

      <div className="productos-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, marca, laboratorio o molécula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select value={filtroLinea} onChange={(e) => setFiltroLinea(e.target.value)}>
          <option value="">Todas las líneas</option>
          {LINEAS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select value={filtroForma} onChange={(e) => setFiltroForma(e.target.value)}>
          <option value="">Todas las formas</option>
          {FORMAS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <button onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      <p>{productosFiltrados.length} de {productos.length} productos</p>

      <table>
        <thead>
          <tr>
            <th>Nombre comercial</th>
            <th>Marca</th>
            <th>Laboratorio</th>
            <th>País</th>
            <th>Línea</th>
            <th>Forma</th>
            <th>Precio</th>
            <th>Disponible</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre_comercial}</td>
              <td>{producto.marcas?.nombre}</td>
              <td>{producto.laboratorio}</td>
              <td>{producto.pais_origen}</td>
              <td>{producto.linea}</td>
              <td>{producto.forma}</td>
              <td>${Number(producto.precio_usd).toFixed(2)}</td>
              <td>{producto.disponible ? 'Sí' : 'No'}</td>
              <td>{producto.activo ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => abrirEdicion(producto)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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