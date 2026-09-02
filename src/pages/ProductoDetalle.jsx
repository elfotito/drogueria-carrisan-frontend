import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import HomeCarrusel from '../components/HomeCarrusel'
import { agruparPorLinea } from '../utils/agruparPorLinea'
import BottomNav from '../components/BottomNav'
import './ProductoDetalle.css'

// Cuántos carruseles mostrar al final de la página (elegidos al azar del pool).
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

function elegirCarruseles(producto, otrosActivos, relacionadosPorMolecula) {
  const pool = []

  if (relacionadosPorMolecula.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: 'Mismo principio activo', productos: barajar(relacionadosPorMolecula).slice(0, 12) })
  }

  const mismaLinea = otrosActivos.filter((p) => p.linea && p.linea === producto.linea)
  if (mismaLinea.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: `Más de ${producto.linea}`, productos: barajar(mismaLinea).slice(0, 12) })
  }

  const mismoLaboratorio = otrosActivos.filter((p) => p.laboratorio && p.laboratorio === producto.laboratorio)
  if (mismoLaboratorio.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: `Más de ${producto.laboratorio}`, productos: barajar(mismoLaboratorio).slice(0, 12) })
  }

  const ofertas = otrosActivos.filter((p) => p.descuento_activo)
  if (ofertas.length >= MINIMO_POR_CARRUSEL) {
    pool.push({ tipo: 'productos', titulo: 'Ofertas destacadas', productos: barajar(ofertas).slice(0, 12) })
  }

  if (otrosActivos.length >= MINIMO_POR_CARRUSEL * 2) {
    pool.push({ tipo: 'productos', titulo: 'También te puede interesar', productos: barajar(otrosActivos).slice(0, 12) })
  }

  // agruparPorLinea ya devuelve carruseles individuales listos para HomeCarrusel
  // (cada uno con su propio título y link "ver todo"), no un bloque agregado.
  const seccionesPorLinea = agruparPorLinea(otrosActivos).map((s) => ({
    tipo: 'productos',
    titulo: s.titulo,
    productos: s.productos,
    verTodoTo: s.verTodoTo,
  }))
  pool.push(...seccionesPorLinea)

  return barajar(pool).slice(0, CANTIDAD_CARRUSELES)
}

// Estrellas de rating — solo lectura, usada arriba del título
function Estrellas({ promedio, tamano = '1rem' }) {
  return (
    <span className="rating-estrellas" style={{ fontSize: tamano }} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(promedio) ? 'estrella-llena' : 'estrella-vacia'}>
          ★
        </span>
      ))}
    </span>
  )
}

function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [producto, setProducto] = useState(null)
  const [detalles, setDetalles] = useState(null)
  const [moleculas, setMoleculas] = useState([])
  const [valoraciones, setValoraciones] = useState({ promedio: 0, total: 0, valoraciones: [] })
  const [tasaVes, setTasaVes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const [carruseles, setCarruseles] = useState([])
  const [imagenActiva, setImagenActiva] = useState(0)
  const [tabActiva, setTabActiva] = useState('descripcion')

  useEffect(() => {
    cargarProducto()
    window.scrollTo(0, 0)
    setImagenActiva(0)
    setTabActiva('descripcion')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function cargarProducto() {
    setCargando(true)
    setCarruseles([])
    try {
      const [resCompleto, resTasa] = await Promise.all([
        api.get(`/moleculas/products/${id}/completo`),
        api.get('/prices'),
      ])

      const { producto: p, detalles: d, moleculas: m } = resCompleto.data
      setProducto(p)
      setDetalles(d)
      setMoleculas(m || [])
      setTasaVes(resTasa.data.usd_a_ves)
      setError('')

      // Valoraciones: si falla, no tumbamos la página, solo no se muestra rating
      try {
        const resVal = await api.get(`/products/${id}/valoraciones`)
        setValoraciones(resVal.data)
      } catch (err) {
        console.error('No se pudieron cargar las valoraciones', err)
      }

      // Carruseles relacionados: mismo criterio, es un "extra"
      try {
        const [{ data: todos }, resRelacionados] = await Promise.all([
          api.get('/products'),
          api.get(`/moleculas/productos/${id}/relacionados-por-molecula`).catch(() => ({ data: [] })),
        ])
        const otrosActivos = todos.filter((prod) => prod.activo && prod.id !== p.id)
        setCarruseles(elegirCarruseles(p, otrosActivos, resRelacionados.data || []))
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

  // Galería: imagen principal + hasta 4 secundarias (si existen en producto_detalles)
  const galeria = [producto.foto_url, ...(detalles?.imagen_secundaria_urls || [])].filter(Boolean)

  const tieneFichaTecnica = !!detalles && (
    detalles.indicaciones || detalles.contraindicaciones || detalles.dosis_recomendada ||
    detalles.via_administracion || detalles.efectos_secundarios || detalles.precauciones ||
    detalles.presentacion || detalles.registro_sanitario
  )
  const tieneComposicion = moleculas.length > 0

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

      {/* Sección superior: Galería + Info + Columna de compra sticky */}
      <div className="detalle-main">
        {/* Galería */}
        <div className="detalle-galeria">
          <div className="detalle-imagen-wrapper">
            <img
              src={galeria[imagenActiva] || '/placeholder.png'}
              alt={producto.nombre_comercial}
              className="detalle-imagen"
            />
            {!producto.disponible && (
              <span className="detalle-no-disponible">No disponible</span>
            )}
          </div>

          {galeria.length > 1 && (
            <div className="detalle-miniaturas">
              {galeria.map((url, i) => (
                <button
                  key={i}
                  className={`detalle-miniatura ${i === imagenActiva ? 'activa' : ''}`}
                  onClick={() => setImagenActiva(i)}
                >
                  <img src={url} alt={`${producto.nombre_comercial} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className="detalle-info">
          {producto.marcas?.nombre && (
            <p className="detalle-marca">{producto.marcas.nombre}</p>
          )}

          <h1 className="detalle-titulo">{producto.nombre_comercial}</h1>

          {valoraciones.total > 0 && (
            <div className="detalle-rating">
              <Estrellas promedio={valoraciones.promedio} />
              <span className="detalle-rating-texto">
                {valoraciones.promedio} · {valoraciones.total} {valoraciones.total === 1 ? 'valoración' : 'valoraciones'}
              </span>
            </div>
          )}

          <span className={`detalle-disponibilidad ${producto.disponible ? 'disponible' : 'agotado'}`}>
            {producto.disponible ? '✓ Disponible' : 'Agotado'}
          </span>

          {producto.descripcion && (
            <p className="detalle-resumen">{producto.descripcion}</p>
          )}

          {/* Ficha rápida: laboratorio, forma, línea — lo esencial de un vistazo */}
          <div className="detalle-ficha-rapida">
            {producto.laboratorio && (
              <div className="ficha-rapida-item">
                <span className="ficha-rapida-label">Laboratorio</span>
                <span className="ficha-rapida-valor">{producto.laboratorio}</span>
              </div>
            )}
            {producto.forma && (
              <div className="ficha-rapida-item">
                <span className="ficha-rapida-label">Forma</span>
                <span className="ficha-rapida-valor">{producto.forma}</span>
              </div>
            )}
            {detalles?.presentacion && (
              <div className="ficha-rapida-item">
                <span className="ficha-rapida-label">Presentación</span>
                <span className="ficha-rapida-valor">{detalles.presentacion}</span>
              </div>
            )}
          </div>
        </div>

        {/* Columna de compra — sticky en desktop */}
        <div className="detalle-compra-columna">
          <div className="detalle-compra-card">
            <div className="detalle-precios">
              {producto.precio_usd != null ? (
                <>
                  <span className="detalle-precio-usd">
                    ${Number(producto.precio_usd).toFixed(2)}
                  </span>
                  {precioVes && (
                    <span className="detalle-precio-ves">Bs. {precioVes}</span>
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
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                  >
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button onClick={() => setCantidad((c) => c + 1)}>+</button>
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
      </div>

      {/* Tabs: Descripción / Ficha técnica / Composición */}
      <div className="detalle-tabs-container">
        <div className="detalle-tabs-nav">
          <button
            className={`detalle-tab-btn ${tabActiva === 'descripcion' ? 'activa' : ''}`}
            onClick={() => setTabActiva('descripcion')}
          >
            Descripción
          </button>
          {tieneFichaTecnica && (
            <button
              className={`detalle-tab-btn ${tabActiva === 'ficha' ? 'activa' : ''}`}
              onClick={() => setTabActiva('ficha')}
            >
              Ficha técnica
            </button>
          )}
          {tieneComposicion && (
            <button
              className={`detalle-tab-btn ${tabActiva === 'composicion' ? 'activa' : ''}`}
              onClick={() => setTabActiva('composicion')}
            >
              Composición
            </button>
          )}
        </div>

        <div className="detalle-tab-panel">
          {tabActiva === 'descripcion' && (
            <div className="detalle-grid">
              {producto.laboratorio && (
                <div className="detalle-campo">
                  <span className="detalle-label">Laboratorio</span>
                  <span className="detalle-valor">{producto.laboratorio}</span>
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

              {producto.descripcion && (
                <div className="detalle-descripcion-completa">
                  <p>{producto.descripcion}</p>
                </div>
              )}
            </div>
          )}

          {tabActiva === 'ficha' && detalles && (
            <table className="detalle-tabla-specs">
              <tbody>
                {detalles.indicaciones && (
                  <tr><th>Indicaciones</th><td>{detalles.indicaciones}</td></tr>
                )}
                {detalles.dosis_recomendada && (
                  <tr><th>Dosis recomendada</th><td>{detalles.dosis_recomendada}</td></tr>
                )}
                {detalles.via_administracion && (
                  <tr><th>Vía de administración</th><td>{detalles.via_administracion}</td></tr>
                )}
                {detalles.contraindicaciones && (
                  <tr><th>Contraindicaciones</th><td>{detalles.contraindicaciones}</td></tr>
                )}
                {detalles.efectos_secundarios && (
                  <tr><th>Efectos secundarios</th><td>{detalles.efectos_secundarios}</td></tr>
                )}
                {detalles.precauciones && (
                  <tr><th>Precauciones</th><td>{detalles.precauciones}</td></tr>
                )}
                {detalles.presentacion && (
                  <tr><th>Presentación</th><td>{detalles.presentacion}</td></tr>
                )}
                {detalles.unidades_por_presentacion && (
                  <tr><th>Unidades por presentación</th><td>{detalles.unidades_por_presentacion}</td></tr>
                )}
                {detalles.condiciones_almacenamiento && (
                  <tr><th>Almacenamiento</th><td>{detalles.condiciones_almacenamiento}</td></tr>
                )}
                {detalles.registro_sanitario && (
                  <tr><th>Registro sanitario</th><td>{detalles.registro_sanitario}</td></tr>
                )}
                {detalles.titular_registro && (
                  <tr><th>Titular del registro</th><td>{detalles.titular_registro}</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tabActiva === 'composicion' && (
            <div className="detalle-composicion">
              {moleculas.map((m, i) => (
                <div key={i} className="composicion-item">
                  <span className="composicion-nombre">{m.moleculas_referencias?.nombre}</span>
                  {m.concentracion && (
                    <span className="composicion-concentracion">
                      {m.concentracion} {m.unidad_concentracion}
                    </span>
                  )}
                </div>
              ))}
              <p className="detalle-nota-precio" style={{ marginTop: '16px' }}>
                * Consulta siempre con un profesional de la salud antes de usar cualquier medicamento.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Carruseles relacionados */}
      {carruseles.length > 0 && (
        <div className="detalle-carruseles">
          {carruseles.map((c, i) => (
            <HomeCarrusel
              key={`${producto.id}-${i}`}
              titulo={c.titulo}
              productos={c.productos}
              tasaVes={tasaVes}
              verTodoTo={c.verTodoTo || '/catalogo'}
              cargando={false}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

export default ProductoDetalle
