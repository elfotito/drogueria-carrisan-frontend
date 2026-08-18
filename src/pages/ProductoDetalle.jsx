import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import HomeCarrusel from '../components/HomeCarrusel'
import SeccionesCarrusel from '../components/SeccionesCarrusel'
import Footer from '../components/Footer'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import BottomNav from '../components/BottomNav'
import './ProductoDetalle.css'

const CANTIDAD_CARRUSELES = 2
const MINIMO_POR_CARRUSEL = 4

function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

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

// Arma las secciones tipo acordeón ("About this item") a partir de los campos
// que el producto realmente tenga. "Detalles del producto" siempre aparece;
// el resto solo si el backend trae ese dato (indicaciones, modo_uso, composicion
// aún no existen en el modelo — quedan listos para cuando los agregues).
function construirSecciones(producto) {
  const secciones = []

  secciones.push({
    id: 'detalles',
    titulo: 'Detalles del producto',
    contenido: (
      <div className="detalle-acc-grid">
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
    ),
  })

  if (producto.descripcion) {
    secciones.push({
      id: 'descripcion',
      titulo: 'Descripción',
      contenido: <p className="detalle-acc-texto">{producto.descripcion}</p>,
    })
  }

  if (producto.indicaciones) {
    secciones.push({
      id: 'indicaciones',
      titulo: 'Indicaciones',
      contenido: <p className="detalle-acc-texto">{producto.indicaciones}</p>,
    })
  }

  if (producto.modo_uso) {
    secciones.push({
      id: 'modo_uso',
      titulo: 'Modo de uso',
      contenido: <p className="detalle-acc-texto">{producto.modo_uso}</p>,
    })
  }

  if (producto.composicion) {
    secciones.push({
      id: 'composicion',
      titulo: 'Composición',
      contenido: <p className="detalle-acc-texto">{producto.composicion}</p>,
    })
  }

  return secciones
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
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({ detalles: true })

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
      setSeccionesAbiertas({ detalles: true })

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

  function toggleSeccion(id) {
    setSeccionesAbiertas((prev) => ({ ...prev, [id]: !prev[id] }))
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

  const secciones = construirSecciones(producto)

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

      {/* Sección superior: imagen + acordeón + reseñas (izquierda) / buybox (derecha) */}
      <div className="detalle-main">
        {/* Imagen */}
        <div className="detalle-imagen-wrapper detalle-area-imagen">
          <img
            src={producto.foto_url || '/placeholder.png'}
            alt={producto.nombre_comercial}
            className="detalle-imagen"
          />
          {!producto.disponible && (
            <span className="detalle-no-disponible">No disponible</span>
          )}
        </div>

        {/* Buybox flotante */}
        <aside className="detalle-area-buybox">
          <div className="detalle-buybox-wrapper">
            <div className="detalle-buybox">
              {producto.marcas?.nombre && (
                <p className="detalle-marca">{producto.marcas.nombre}</p>
              )}

              <h1 className="detalle-titulo">{producto.nombre_comercial}</h1>

              {/* Placeholder de estrellas — sin configurar todavía */}
              <div className="detalle-buybox-estrellas">
                <span className="detalle-estrellas-icono">☆ ☆ ☆ ☆ ☆</span>
                <span className="detalle-estrellas-texto">Sin calificaciones aún</span>
              </div>

              <span className={`detalle-disponibilidad ${producto.disponible ? 'disponible' : 'agotado'}`}>
                {producto.disponible ? '✓ Disponible' : 'Agotado'}
              </span>

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

              <p className="detalle-nota-precio">
                * Los precios mostrados no incluyen IVA. Precios sujetos a cambios sin previo aviso.
              </p>
            </div>
          </div>
        </aside>

        {/* Acordeón "Acerca de este producto" */}
        <div className="detalle-acordeon detalle-area-acordeon">
          <h2 className="detalle-seccion-titulo">Acerca de este producto</h2>

          {secciones.map((s) => (
            <div key={s.id} className="detalle-acc-item">
              <button
                type="button"
                className="detalle-acc-header"
                onClick={() => toggleSeccion(s.id)}
                aria-expanded={!!seccionesAbiertas[s.id]}
              >
                <span>{s.titulo}</span>
                <span className={`detalle-acc-flecha ${seccionesAbiertas[s.id] ? 'abierta' : ''}`}>⌄</span>
              </button>
              {seccionesAbiertas[s.id] && (
                <div className="detalle-acc-contenido">{s.contenido}</div>
              )}
            </div>
          ))}
        </div>

        {/* Calificaciones y reseñas — placeholder, aún sin configurar */}
        <div className="detalle-resenas detalle-area-resenas">
          <h2 className="detalle-seccion-titulo">Calificaciones y reseñas</h2>
          <div className="detalle-resenas-placeholder">
            <span className="detalle-estrellas-icono">☆ ☆ ☆ ☆ ☆</span>
            <p>Todavía no hay calificaciones para este producto.</p>
          </div>
        </div>
      </div>

      {/* Carruseles relacionados */}
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

      <Footer />
      <BottomNav />
    </div>
  )
}

export default ProductoDetalle