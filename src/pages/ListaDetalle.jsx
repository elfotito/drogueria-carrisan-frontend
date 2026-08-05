import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import './ListaDetalle.css'

function formatUSD(valor) {
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ListaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items: cartItems, addItem } = useCart()

  const [lista, setLista] = useState(null)
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [agregandoTodos, setAgregandoTodos] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [id])

  async function cargarDatos() {
    try {
      const { data: itemsData } = await api.get(`/lists/${id}/items`)
      setItems(itemsData)
      // Obtener info de la lista
      const { data: listas } = await api.get('/lists')
      const listaEncontrada = listas.find(l => l.id === Number(id))
      setLista(listaEncontrada)
    } catch (err) {
      setError('No se pudo cargar la lista')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function quitarItem(productoId) {
    try {
      await api.delete(`/lists/${id}/items/${productoId}`)
      setItems(prev => prev.filter(item => item.producto_id !== productoId))
    } catch (err) {
      console.error('Error al quitar item:', err)
    }
  }

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find(i => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  function handleAgregarTodos() {
    setAgregandoTodos(true)
    items.forEach(item => {
      addItem(item.productos, 1)
    })
    setTimeout(() => setAgregandoTodos(false), 800)
  }

  if (cargando) {
    return (
      <div className="lista-detalle">
        <p>Cargando lista...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lista-detalle">
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/mis-items">← Volver a Mis Items</Link>
      </div>
    )
  }

  return (
    <div className="lista-detalle">
      {/* Header */}
      <div className="lista-detalle-header">
        <Link to="/mis-items" className="lista-detalle-volver">
          ← Mis Items
        </Link>
        <h1>{lista?.es_predeterminada ? '📌' : '📋'} {lista?.nombre || 'Lista'}</h1>
        <p className="lista-detalle-contador">
          {items.length} producto{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Acciones */}
      {items.length > 0 && (
        <div className="lista-detalle-acciones">
          <button
            className={`lista-detalle-btn-todos ${agregandoTodos ? 'agregado' : ''}`}
            onClick={handleAgregarTodos}
          >
            {agregandoTodos ? '✓ Agregados' : '🛒 Agregar todos al carrito'}
          </button>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="lista-detalle-vacia">
          <p>Esta lista está vacía</p>
          <Link to="/catalogo" className="lista-detalle-cta">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="lista-detalle-grid">
          {items.map(item => (
            <div key={item.id} className="lista-item-card">
              {/* Imagen */}
              <div
                className="lista-item-imagen"
                onClick={() => navigate(`/producto/${item.producto_id}`)}
              >
                {item.productos?.foto_url ? (
                  <img src={item.productos.foto_url} alt={item.productos.nombre_comercial} />
                ) : (
                  <div className="lista-item-sin-imagen">Sin imagen</div>
                )}
                <button
                  className="lista-item-quitar"
                  onClick={(e) => { e.stopPropagation(); quitarItem(item.producto_id) }}
                  title="Quitar de la lista"
                >
                  ✕
                </button>
              </div>

              {/* Info */}
              <div className="lista-item-info">
                <h3
                  className="lista-item-nombre"
                  onClick={() => navigate(`/producto/${item.producto_id}`)}
                >
                  {item.productos?.nombre_comercial}
                </h3>
                <p className="lista-item-precio">
                  ${formatUSD(item.productos?.precio_usd)} USD
                </p>

                {/* Botón carrito */}
                <button
                  className={`lista-item-carrito ${cantidadEnCarrito(item.producto_id) ? 'en-carrito' : ''}`}
                  onClick={() => addItem(item.productos, 1)}
                >
                  {cantidadEnCarrito(item.producto_id)
                    ? `🛒 ${cantidadEnCarrito(item.producto_id)}`
                    : '+ Agregar al carrito'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListaDetalle