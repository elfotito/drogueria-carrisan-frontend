import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './ProductoDetalle.css'

function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [producto, setProducto] = useState(null)
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    cargarProducto()
  }, [id])

  async function cargarProducto() {
    try {
      const [resProducto, resTasa] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/prices'),
      ])
      setProducto(resProducto.data)
      setTasaVes(resTasa.data.usd_a_ves)
    } catch (err) {
      setError('Producto no encontrado')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function handleAgregar() {
    addItem(producto, cantidad)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  if (cargando) {
    return (
      <div className="detalle-container">
        <div className="detalle-skeleton">
          <div className="skeleton-imagen" />
          <div className="skeleton-info">
            <div className="skeleton-line skeleton-titulo" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-corto" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="detalle-container">
        <div className="detalle-error">
          <h2>Producto no encontrado</h2>
          <button onClick={() => navigate('/catalogo')}>Volver al catálogo</button>
        </div>
      </div>
    )
  }

  const precioVes = tasaVes && producto.precio_usd != null
    ? (producto.precio_usd * tasaVes).toFixed(2)
    : null

  return (
    <div className="detalle-container">
      {/* Breadcrumb */}
      <nav className="detalle-breadcrumb">
        <a href="/">Inicio</a>
        <span> / </span>
        <a href="/catalogo">Catálogo</a>
        <span> / </span>
        <span>{producto.nombre_comercial}</span>
      </nav>

      {/* Sección superior: Imagen + Info */}
      <div className="detalle-main">
        {/* Imagen */}
        <div className="detalle-imagen-wrapper">
          <img
            src={producto.foto_url || '/placeholder.png'}
            alt={producto.nombre_comercial}
            className="detalle-imagen"
          />
          {!producto.disponible && (
            <span className="detalle-no-disponible">No disponible</span>
          )}
        </div>

        {/* Información principal */}
        <div className="detalle-info">
          <h1 className="detalle-titulo">{producto.nombre_comercial}</h1>

          {producto.marcas?.nombre && (
            <p className="detalle-marca">Marca: {producto.marcas.nombre}</p>
          )}

          {/* Precios */}
          <div className="detalle-precios">
            {producto.precio_usd != null ? (
              <>
                <span className="detalle-precio-usd">
                  ${Number(producto.precio_usd).toFixed(2)} USD
                </span>
                {precioVes && (
                  <span className="detalle-precio-ves">
                    Bs. {precioVes}
                  </span>
                )}
              </>
            ) : (
              <span className="detalle-precio-usd">Consultar precio</span>
            )}
          </div>

          {/* Selector de cantidad + botón */}
          {producto.disponible && (
            <div className="detalle-acciones">
              <div className="detalle-cantidad">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                >
                  −
                </button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)}>+</button>
              </div>

              <button
                className={`detalle-btn-agregar ${agregado ? 'agregado' : ''}`}
                onClick={handleAgregar}
                disabled={!user}
              >
                {agregado ? '✓ Agregado' : 'Agregar al carrito'}
              </button>
            </div>
          )}

          {!user && (
            <p className="detalle-login-aviso">
              <a href="/login">Inicia sesión</a> para comprar
            </p>
          )}

          {/* Nota de precio */}
          <p className="detalle-nota-precio">
            * Los precios mostrados no incluyen IVA. Precios sujetos a cambios sin previo aviso.
          </p>
        </div>
      </div>

      {/* Sección inferior: Detalles completos */}
      <div className="detalle-detalles">
        <h2>Detalles del producto</h2>

        <div className="detalle-grid">
          {producto.laboratorio && (
            <div className="detalle-campo">
              <span className="detalle-label">Laboratorio</span>
              <span className="detalle-valor">{producto.laboratorio}</span>
            </div>
          )}

          {producto.molecula && (
            <div className="detalle-campo">
              <span className="detalle-label">Molécula</span>
              <span className="detalle-valor">{producto.molecula}</span>
            </div>
          )}

          {producto.forma && (
            <div className="detalle-campo">
              <span className="detalle-label">Forma farmacéutica</span>
              <span className="detalle-valor">{producto.forma}</span>
            </div>
          )}

          {producto.linea && (
            <div className="detalle-campo">
              <span className="detalle-label">Línea</span>
              <span className="detalle-valor">{producto.linea}</span>
            </div>
          )}

          {producto.pais_origen && (
            <div className="detalle-campo">
              <span className="detalle-label">País de origen</span>
              <span className="detalle-valor">{producto.pais_origen}</span>
            </div>
          )}

          <div className="detalle-campo">
            <span className="detalle-label">Disponibilidad</span>
            <span className={`detalle-valor ${producto.disponible ? 'disponible' : 'agotado'}`}>
              {producto.disponible ? 'Disponible' : 'Agotado'}
            </span>
          </div>
        </div>

        {producto.descripcion && (
          <div className="detalle-descripcion">
            <h3>Descripción</h3>
            <p>{producto.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductoDetalle