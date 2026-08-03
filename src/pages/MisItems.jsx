import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

function MisItems() {
  const { addItem } = useCart()
  const [listas, setListas] = useState([])
  const [listaActiva, setListaActiva] = useState(null)
  const [items, setItems] = useState([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarListas()
  }, [])

  async function cargarListas() {
    try {
      const { data } = await api.get('/lists')
      setListas(data)
      if (data.length > 0 && !listaActiva) {
        setListaActiva(data[0].id)
      }
    } catch (err) {
      setError('No se pudieron cargar las listas')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (listaActiva) {
      cargarItems(listaActiva)
    }
  }, [listaActiva])

  async function cargarItems(listaId) {
    try {
      const { data } = await api.get(`/lists/${listaId}/items`)
      setItems(data)
    } catch (err) {
      console.error('Error al cargar items:', err)
    }
  }

  async function crearLista() {
    if (!nuevoNombre.trim()) return
    try {
      await api.post('/lists', { nombre: nuevoNombre })
      setNuevoNombre('')
      setMostrarCrear(false)
      cargarListas()
    } catch (err) {
      alert('Error al crear lista')
    }
  }

  async function eliminarLista(listaId) {
    if (!confirm('¿Eliminar esta lista?')) return
    try {
      await api.delete(`/lists/${listaId}`)
      if (listaActiva === listaId) {
        const predeterminada = listas.find(l => l.es_predeterminada)
        setListaActiva(predeterminada?.id || null)
      }
      cargarListas()
    } catch (err) {
      alert('No se puede eliminar la lista predeterminada')
    }
  }

  async function quitarItem(productoId) {
    try {
      await api.delete(`/lists/${listaActiva}/items/${productoId}`)
      cargarItems(listaActiva)
    } catch (err) {
      alert('Error al quitar item')
    }
  }

  function agregarTodosAlCarrito() {
    items.forEach(item => {
      addItem(item.productos, 1)
    })
    alert('Todos los items fueron agregados al carrito')
  }

  if (cargando) return <p>Cargando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>Mis Items</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Sidebar de listas */}
        <div style={{ width: '250px' }}>
          <h3>Mis listas</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {listas.map(lista => (
              <li
                key={lista.id}
                onClick={() => setListaActiva(lista.id)}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  background: listaActiva === lista.id ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {lista.es_predeterminada ? '📌' : '📋'} {lista.nombre}
                </span>
                {!lista.es_predeterminada && (
                  <button
                    onClick={(e) => { e.stopPropagation(); eliminarLista(lista.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f' }}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>

          {mostrarCrear ? (
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre de la lista"
                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              />
              <button onClick={crearLista} style={{ marginRight: '5px' }}>Crear</button>
              <button onClick={() => setMostrarCrear(false)}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setMostrarCrear(true)} style={{ marginTop: '10px', width: '100%' }}>
              + Nueva lista
            </button>
          )}
        </div>

        {/* Items de la lista activa */}
        <div style={{ flex: 1 }}>
          {items.length === 0 ? (
            <p>Esta lista está vacía. Agrega productos desde el catálogo.</p>
          ) : (
            <>
              <button onClick={agregarTodosAlCarrito} style={{ marginBottom: '20px' }}>
                🛒 Agregar todos al carrito
              </button>

              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio USD</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.productos?.foto_url && (
                          <img
                            src={item.productos.foto_url}
                            alt={item.productos.nombre_comercial}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px', verticalAlign: 'middle' }}
                          />
                        )}
                        {item.productos?.nombre_comercial}
                      </td>
                      <td>${Number(item.productos?.precio_usd).toFixed(2)}</td>
                      <td>
                        <button onClick={() => addItem(item.productos, 1)}>
                          🛒
                        </button>
                        <button onClick={() => quitarItem(item.producto_id)} style={{ marginLeft: '5px', color: '#d32f2f' }}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MisItems