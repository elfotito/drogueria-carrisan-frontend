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

  // Filtro mejorado: busca en nombre_comercial, laboratorio, molecula y marca
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase()
    return (
      producto.nombre_comercial?.toLowerCase().includes(texto) ||
      producto.laboratorio?.toLowerCase().includes(texto) ||
      producto.molecula?.toLowerCase().includes(texto) ||
      producto.marcas?.nombre?.toLowerCase().includes(texto)
    )
  })

  if (cargando) return <p>Cargando productos...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Productos</h2>

      <div className="productos-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Buscar por nombre, laboratorio, molécula o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      <p>{productosFiltrados.length} de {productos.length} productos</p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Marca</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Laboratorio</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Molécula</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Precio</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Disponible</th>
            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}></th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((producto) => (
            <tr key={producto.id}>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{producto.nombre_comercial}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{producto.marcas?.nombre || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{producto.laboratorio || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{producto.molecula || '-'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>${producto.precio_usd?.toFixed(2)}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{producto.disponible ? '✅ Sí' : '❌ No'}</td>
              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
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