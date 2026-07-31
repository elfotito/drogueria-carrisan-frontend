import { useState, useEffect } from 'react'
import api from '../../api/axios'
import ProductoForm from './ProductoForm'

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [busqueda, setBusqueda] = useState('')
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

  // Filtro en memoria: por nombre o por nombre de marca, sin distinguir mayúsculas/minúsculas
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase()
    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.marcas?.nombre.toLowerCase().includes(texto)
    )
  })

  if (cargando) return <p>Cargando productos...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Productos</h2>

      <div className="productos-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      <p>{productosFiltrados.length} de {productos.length} productos</p>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Precio</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.marcas?.nombre}</td>
              <td>${producto.precio_usd.toFixed(2)}</td>
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