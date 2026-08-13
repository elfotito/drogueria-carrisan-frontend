import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import HomeCarrusel from '../components/HomeCarrusel'
import SeccionesCarrusel from '../components/SeccionesCarrusel'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import './ProductoDetalle.css'

// Cuántos carruseles mostrar al final de la página (elegidos al azar del pool).
// Súbelo a 3 si quieres más variedad, o bájalo a 1 si prefieres una página más corta.
const CANTIDAD_CARRUSELES = 2
const MINIMO_POR_CARRUSEL = 4 // no vale la pena mostrar un carrusel con 1-2 productos

function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Arma el pool de carruseles POSIBLES para este producto (solo entran los
// que realmente tengan suficiente contenido) y devuelve una selección al azar.
function elegirCarruseles(producto, otrosActivos) {
  const pool = []

  const mismaLinea = otrosActivos.filter((p) => p.linea && p.linea === producto.linea)
  if (mismaLinea.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: `Más de ${producto.linea}`, productos: barajar(mismaLinea).slice(0, 12) })
  }

  const mismoLaboratorio = otrosActivos.filter((p) => p.laboratorio && p.laboratorio === producto.laboratorio)
  if (mismoLaboratorio.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: `Más de ${producto.laboratorio}`, productos: barajar(mismoLaboratorio).slice(0, 12) })
  }

  const mismaMolecula = otrosActivos.filter((p) => p.molecula && p.molecula === producto.molecula)
  if (mismaMolecula.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: 'Mismo principio activo', productos: barajar(mismaMolecula).slice(0, 12) })
  }

  const ofertas = otrosActivos.filter((p) => p.descuento_activo)
  if (ofertas.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: 'Ofertas destacadas', productos: barajar(ofertas).slice(0, 12) })
  }

  if (otrosActivos.length >= MINIMO_POR_CARRUSEL * 2) {
    pool.push({ tipo: 'productos', titulo: 'También te puede interesar', productos: barajar(otrosActivos).slice(0, 12) })
  }

  const secciones = agruparPorLinea(otrosActivos)
  if (secciones.length >= 2) {
    pool.push({ tipo: 'secciones', titulo: 'Explora por categoría', secciones })
  }

  return barajar(pool).slice(0, CANTIDAD_CARRUSELES)
}

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
  const [carruseles, setCarruseles] = useState([])

  useEffect(() => {
    cargarProducto()
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarProducto() {
    setCargando(true)
    setCarruseles([])
    try {
      const [resProducto, resTasa] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/prices'),
      ])
      setProducto(resProducto.data)
      setTasaVes(resTasa.data.usd_a_ves)
      setError('')

      // Los carruseles relacionados son un "extra": si esta llamada falla,
      // no tumbamos la página del producto, simplemente no se muestran.
      try {
        const { data: todos } = await api.get('/products')
        const otrosActivos = todos.filter((p) => p.activo && p.id !== resProducto.data.id)
        setCarruseles(elegirCarruseles(resProducto.data, otrosActivos))
      } catch (err) {
        console.error('No se pudieron cargar los carruseles relacionados', err)
      }
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
        <Link to="/">Inicio</Link>
        <span>›</span>
        <Link to="/catalogo">Catálogo</Link>
        <span>›</span>
        <span className="detalle-breadcrumb__actual">{producto.nombre_comercial}</span>
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
          {producto.marcas?.nombre && (
            <p className="detalle-marca">{producto.marcas.nombre}</p>
          )}
          <h1 className="detalle-titulo">{producto.nombre_comercial}</h1>

          <span className={`detalle-disponibilidad ${producto.disponible ? 'disponible' : 'agotado'}`}>
            {producto.disponible ? '✓ Disponible' : 'Agotado'}
          </span>

          {/* Precios */}
          <div className="detalle-precios">
            {producto.precio_usd != null ? (
              <>
                <span className="detalle-precio-usd">
                  ${Number(producto.precio_usd).toFixed(2)}
                </span>
                {precioVes && (
                  <span className="detalle-precio-ves">
                    Bs. {precioVes}
                  </span>
                )}
              </>
            ) : (
              <span className="detalle-precio-usd detalle-precio-usd--consultar">Consultar precio</span>
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
              <Link to="/login">Inicia sesión</Link> para comprar
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

      {/* Carruseles relacionados — 2 elegidos al azar de un pool más grande,
          recalculados cada vez que cambia el producto (ver elegirCarruseles) */}
      {carruseles.length > 0 && (
        <div className="detalle-carruseles">
          {carruseles.map((c, i) => (
            c.tipo === 'productos' ? (
              <HomeCarrusel
                key={`${producto.id}-${i}`}
                titulo={c.titulo}
                productos={c.productos}
                tasaVes={tasaVes}
                verTodoTo="/catalogo"
                cargando={false}
              />
            ) : (
              <SeccionesCarrusel
                key={`${producto.id}-${i}`}
                titulo={c.titulo}
                secciones={c.secciones}
                tasaVes={tasaVes}
                cargando={false}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductoDetalle
