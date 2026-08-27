import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useFavoritos } from '../context/FavoritosContext'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { NAV_UNIFICADO } from '../components/paginas-principales/NavUnificado'
import './MisItems.css'

// Sugerencias de listas rápidas. Solo crea la lista con este nombre;
// no llevan lógica especial más allá de eso.
const LISTAS_SUGERIDAS = [
  { nombre: 'Favoritos', icon: '⭐' },
  { nombre: 'Antibióticos', icon: '💊' },
  { nombre: 'Cuidado Personal', icon: '🧴' },
  { nombre: 'Vitaminas', icon: '🛡️' },
]

function formatUSD(valor) {
  return Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function IconoBuscar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconoGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconoLista() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="2.5" cy="4" r="1" fill="currentColor" />
      <circle cx="2.5" cy="9" r="1" fill="currentColor" />
      <circle cx="2.5" cy="14" r="1" fill="currentColor" />
      <path d="M6 4H16M6 9H16M6 14H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconoFiltro() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CarruselSkeleton() {
  return (
    <div className="itemcard itemcard--skeleton">
      <div className="itemcard__media itemcard__media--skeleton" />
      <div className="skel-line skel-line--btn" />
      <div className="skel-line skel-line--sm" />
      <div className="skel-line skel-line--md" />
    </div>
  )
}

// ---------------------------------------------------------
// ItemsCard — tarjeta compacta de producto (grid 2 columnas móvil /
// grid de N columnas desktop). Usada en Mis Favoritos y Comprar de nuevo.
// ---------------------------------------------------------
function ItemsCard({ producto, cantidadEnCarrito, onAgregar, onQuitar, mostrarQuitar, badge }) {
  return (
    <div className="itemcard">
      <Link to={`/producto/${producto?.id}`} className="itemcard__media">
        {producto?.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
        ) : (
          <div className="itemcard__media-placeholder">Sin imagen</div>
        )}

        {badge && <span className="itemcard__badge">{badge}</span>}

        {mostrarQuitar && (
          <button
            type="button"
            className="itemcard__quitar"
            onClick={(e) => { e.preventDefault(); onQuitar() }}
            aria-label="Quitar de la lista"
          >
            ✕
          </button>
        )}
      </Link>

      <div className="itemcard__body">
        <p className="itemcard__nombre">{producto?.nombre_comercial}</p>
        <div className="itemcard__footer">
          <p className="itemcard__precio">${formatUSD(producto?.precio_usd)}</p>
          <button
            type="button"
            className={`itemcard__cta ${cantidadEnCarrito ? 'itemcard__cta--cantidad' : ''}`}
            onClick={onAgregar}
          >
            {cantidadEnCarrito ? cantidadEnCarrito : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// Modal genérico de confirmación / formulario, estilo Amazon
// ("Crear una nueva lista", "Filtrar y ordenar", etc.)
//
// Se renderiza vía portal directo a document.body a propósito: así
// queda completamente afuera de .ppal-shift (el contenedor que
// LayoutPaginaPrincipal empuja/encoge cuando el drawer móvil está
// abierto). Si el modal fuera descendiente de ese contenedor, mientras
// el drawer cierra (overflow:hidden + transform en transición) el
// modal podría recortarse o mal-posicionarse por una fracción de
// segundo — con el portal, nunca depende de ese estado.
// ---------------------------------------------------------
function Modal({ titulo, onCerrar, children }) {
  return createPortal(
    <div className="misitems-modal-overlay" onClick={onCerrar}>
      <div className="misitems-modal" onClick={(e) => e.stopPropagation()}>
        <div className="misitems-modal__header">
          <h3>{titulo}</h3>
          <button type="button" className="misitems-modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="misitems-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------
// Carrusel de listas ("Listas y listas de regalos")
// ---------------------------------------------------------
function CarruselListas({ listas, cargando, onCrearNueva, onEliminar }) {
  return (
    <section className="carrusel-listas">
      <div className="carrusel-listas__header">
        <h2 className="misitems-section-title">Listas y listas de regalos</h2>
        <button
          type="button"
          className="carrusel-listas__agregar"
          onClick={onCrearNueva}
          aria-label="Crear nueva lista"
        >
          +
        </button>
      </div>

      {cargando ? (
        <div className="carrusel-listas__scroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="lista-chip lista-chip--skeleton" />
          ))}
        </div>
      ) : (
        <div className="carrusel-listas__scroll">
          {listas.map((lista) => (
            <div key={lista.id} className="lista-chip-wrap">
              {!lista.es_predeterminada && (
                <button
                  type="button"
                  className="lista-chip__eliminar"
                  onClick={(e) => { e.preventDefault(); onEliminar(lista) }}
                  aria-label={`Eliminar lista ${lista.nombre}`}
                >
                  ✕
                </button>
              )}
              <Link to={`/listas/${lista.id}`} className="lista-chip">
                <span className="lista-chip__icon">
                  {lista.es_predeterminada ? '📌' : '📋'}
                </span>
                <span className="lista-chip__nombre">{lista.nombre}</span>
              </Link>
            </div>
          ))}
          <button type="button" className="lista-chip lista-chip--nueva" onClick={onCrearNueva}>
            <span className="lista-chip__icon">+</span>
            <span className="lista-chip__nombre">Nueva lista</span>
          </button>
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------
// Buscador simple para el modal "Agregar producto": sin botón de
// buscar, muestra resultados en vivo con debounce (mismo patrón que
// BuscadorMovil.jsx) y al tocar un resultado ejecuta onSeleccionar.
// ---------------------------------------------------------
function BuscadorProducto({ onSeleccionar }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    if (query.trim().length < 1) {
      setResultados([])
      return
    }
    setBuscando(true)
    const debounce = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=8`)
        setResultados(data.slice(0, 8))
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 250)
    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div className="buscador-producto">
      <div className="misitems-buscador buscador-producto__input">
        <IconoBuscar />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto por nombre…"
          autoFocus
        />
      </div>

      {buscando && <p className="buscador-producto__estado">Buscando…</p>}

      {!buscando && query.trim().length > 0 && resultados.length === 0 && (
        <p className="buscador-producto__estado">No se encontraron productos para "{query}".</p>
      )}

      {resultados.length > 0 && (
        <ul className="buscador-producto__resultados">
          {resultados.map((producto) => (
            <li key={producto.id}>
              <button
                type="button"
                className="buscador-producto__resultado"
                onClick={() => onSeleccionar(producto)}
              >
                <span className="buscador-producto__resultado-media">
                  {producto.foto_url ? (
                    <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
                  ) : (
                    <span className="itemcard__media-placeholder">Sin imagen</span>
                  )}
                </span>
                <span className="buscador-producto__resultado-info">
                  <span className="buscador-producto__resultado-nombre">{producto.nombre_comercial}</span>
                  <span className="buscador-producto__resultado-precio">${formatUSD(producto.precio_usd)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// Tab: Mis Items (favoritos + carrusel de listas + filtro por línea)
// ---------------------------------------------------------
function TabMisItems({ mostrarCrear, setMostrarCrear }) {
  const { items: cartItems, addItem } = useCart()
  const { favoritos, toggleFavorito, loading: cargandoFav } = useFavoritos()

  const [listas, setListas] = useState([])
  const [cargandoListas, setCargandoListas] = useState(true)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [creando, setCreando] = useState(false)

  const [mostrarAgregarProducto, setMostrarAgregarProducto] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [lineaActiva, setLineaActiva] = useState('todo')
  const [vista, setVista] = useState('grid') // 'grid' | 'lista'
  const [mostrarFiltroMovil, setMostrarFiltroMovil] = useState(false)

  async function cargarListas() {
    try {
      const { data } = await api.get('/lists')
      setListas(data)
    } catch {
      console.error('Error al cargar listas')
    } finally {
      setCargandoListas(false)
    }
  }

  useEffect(() => {
    cargarListas()
  }, [])

  async function crearLista(nombre) {
    if (!nombre.trim()) return
    setCreando(true)
    try {
      await api.post('/lists', { nombre })
      setNuevoNombre('')
      setMostrarCrear(false)
      await cargarListas()
    } catch {
      alert('Error al crear lista')
    } finally {
      setCreando(false)
    }
  }

  async function eliminarLista(lista) {
    if (!confirm(`¿Eliminar la lista "${lista.nombre}"?`)) return
    try {
      await api.delete(`/lists/${lista.id}`)
      setListas((prev) => prev.filter((l) => l.id !== lista.id))
    } catch {
      alert('No se pudo eliminar la lista')
    }
  }

  const nombresExistentes = listas.map((l) => l.nombre.toLowerCase())
  const sugerenciasDisponibles = LISTAS_SUGERIDAS.filter(
    (s) => !nombresExistentes.includes(s.nombre.toLowerCase())
  )

  async function quitarItem(productoId) {
    const producto = favoritos.find((item) => item.id === productoId)
    if (producto) await toggleFavorito(producto)
  }

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find((i) => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  // Líneas de producto disponibles entre los favoritos, para armar los chips
  const lineasDisponibles = useMemo(() => {
    const unicas = new Set(favoritos.map((p) => p.linea).filter(Boolean))
    return Array.from(unicas)
  }, [favoritos])

  const itemsFiltrados = useMemo(() => {
    let resultado = favoritos
    if (lineaActiva !== 'todo') {
      resultado = resultado.filter((p) => p.linea === lineaActiva)
    }
    if (busqueda.trim()) {
      const termino = busqueda.trim().toLowerCase()
      resultado = resultado.filter((p) => p.nombre_comercial?.toLowerCase().includes(termino))
    }
    return resultado
  }, [favoritos, lineaActiva, busqueda])

  const cargando = cargandoFav

  return (
    <>
      <CarruselListas
        listas={listas}
        cargando={cargandoListas}
        onCrearNueva={() => setMostrarCrear(true)}
        onEliminar={eliminarLista}
      />

      <section className="misitems-section misitems-section--favoritos">
        <div className="misitems-section__header">
          <div>
            <h2 className="misitems-section-title">Todos los artículos guardados</h2>
            {!cargando && favoritos.length > 0 && (
              <p className="misitems-section-subtitulo">
                {favoritos.length} producto{favoritos.length !== 1 ? 's' : ''} guardado{favoritos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            className="misitems-agregar-todos"
            onClick={() => setMostrarAgregarProducto(true)}
          >
            + Agregar producto
          </button>
        </div>


        {!cargando && favoritos.length > 0 && (
          <div className="favoritos-layout">
            {/* Sidebar de filtros — visible en desktop */}
            <aside className="favoritos-filtros favoritos-filtros--desktop">
              <h3>Filtros</h3>
              <div className="favoritos-filtros__grupo">
                <button
                  type="button"
                  className={`filtro-chip ${lineaActiva === 'todo' ? 'filtro-chip--activo' : ''}`}
                  onClick={() => setLineaActiva('todo')}
                >
                  Todo
                </button>
                {lineasDisponibles.map((linea) => (
                  <button
                    key={linea}
                    type="button"
                    className={`filtro-chip ${lineaActiva === linea ? 'filtro-chip--activo' : ''}`}
                    onClick={() => setLineaActiva(linea)}
                  >
                    {linea}
                  </button>
                ))}
              </div>
            </aside>

            <div className="favoritos-contenido">
              {/* Barra: buscador + toggle vista + filtro móvil */}
              <div className="favoritos-toolbar">
                <div className="misitems-buscador">
                  <IconoBuscar />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar en esta lista"
                  />
                </div>
                <button
                  type="button"
                  className="favoritos-toolbar__filtro-movil"
                  onClick={() => setMostrarFiltroMovil(true)}
                >
                  <IconoFiltro /> Filtros
                </button>
                <div className="favoritos-toolbar__vista">
                  <button
                    type="button"
                    className={vista === 'lista' ? 'activo' : ''}
                    onClick={() => setVista('lista')}
                    aria-label="Vista de lista"
                  >
                    <IconoLista />
                  </button>
                  <button
                    type="button"
                    className={vista === 'grid' ? 'activo' : ''}
                    onClick={() => setVista('grid')}
                    aria-label="Vista de cuadrícula"
                  >
                    <IconoGrid />
                  </button>
                </div>
              </div>

              {/* Chips de filtro — visible en móvil, scrollable */}
              <div className="favoritos-filtros-movil">
                <button
                  type="button"
                  className={`filtro-chip ${lineaActiva === 'todo' ? 'filtro-chip--activo' : ''}`}
                  onClick={() => setLineaActiva('todo')}
                >
                  Todo
                </button>
                {lineasDisponibles.map((linea) => (
                  <button
                    key={linea}
                    type="button"
                    className={`filtro-chip ${lineaActiva === linea ? 'filtro-chip--activo' : ''}`}
                    onClick={() => setLineaActiva(linea)}
                  >
                    {linea}
                  </button>
                ))}
              </div>

              {itemsFiltrados.length === 0 ? (
                <p className="misitems-vacio-filtro">
                  No hay favoritos que coincidan con los filtros actuales.
                </p>
              ) : (
                <div className={vista === 'grid' ? 'product-grid' : 'product-lista'}>
                  {itemsFiltrados.map((producto) => (
                    <ItemsCard
                      key={producto.id}
                      producto={producto}
                      cantidadEnCarrito={cantidadEnCarrito(producto.id)}
                      onAgregar={() => addItem(producto, 1)}
                      onQuitar={() => quitarItem(producto.id)}
                      mostrarQuitar
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {cargando && (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, i) => <CarruselSkeleton key={i} />)}
          </div>
        )}

        {!cargando && favoritos.length === 0 && (
          <div className="misitems-vacio">
            <span className="misitems-vacio__icon">⭐</span>
            <p>Todavía no tienes productos favoritos.</p>
            <Link to="/catalogo" className="misitems-vacio__cta">Explorar catálogo</Link>
          </div>
        )}
      </section>

      {/* Modal: Crear una nueva lista o lista de regalos (estilo Amazon) */}
      {mostrarCrear && (
        <Modal
          titulo="Crear una nueva lista o lista de regalos"
          onCerrar={() => { setMostrarCrear(false); setNuevoNombre('') }}
        >
          <label className="misitems-modal__label" htmlFor="nombre-lista">
            Nombre de la lista (requerido)
          </label>
          <input
            id="nombre-lista"
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Ej. Lista de compras"
            className="misitems-modal__input"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && crearLista(nuevoNombre)}
          />

          {sugerenciasDisponibles.length > 0 && (
            <div className="misitems-modal__sugerencias">
              {sugerenciasDisponibles.map((s) => (
                <button
                  key={s.nombre}
                  type="button"
                  className="sugerencia-chip"
                  onClick={() => setNuevoNombre(s.nombre)}
                >
                  <span className="sugerencia-chip__icon">{s.icon}</span>
                  <span>{s.nombre}</span>
                </button>
              ))}
            </div>
          )}

          <p className="misitems-modal__nota">
            Utiliza listas para guardar artículos para más adelante. Todas las listas son privadas a menos que las compartas con otras personas.
          </p>
          <div className="misitems-modal__acciones">
            <button
              type="button"
              className="misitems-modal__btn misitems-modal__btn--cancelar"
              onClick={() => { setMostrarCrear(false); setNuevoNombre('') }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="misitems-modal__btn misitems-modal__btn--crear"
              onClick={() => crearLista(nuevoNombre)}
              disabled={creando || !nuevoNombre.trim()}
            >
              Crear
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Filtrar y ordenar (móvil) */}
      {mostrarFiltroMovil && (
        <Modal titulo="Filtrar" onCerrar={() => setMostrarFiltroMovil(false)}>
          <p className="misitems-modal__label">Tipo de producto</p>
          <div className="misitems-modal__chips">
            <button
              type="button"
              className={`filtro-chip ${lineaActiva === 'todo' ? 'filtro-chip--activo' : ''}`}
              onClick={() => setLineaActiva('todo')}
            >
              Todo
            </button>
            {lineasDisponibles.map((linea) => (
              <button
                key={linea}
                type="button"
                className={`filtro-chip ${lineaActiva === linea ? 'filtro-chip--activo' : ''}`}
                onClick={() => setLineaActiva(linea)}
              >
                {linea}
              </button>
            ))}
          </div>
          <div className="misitems-modal__acciones">
            <button
              type="button"
              className="misitems-modal__btn misitems-modal__btn--crear"
              onClick={() => setMostrarFiltroMovil(false)}
            >
              Ver resultados
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Agregar producto (buscador en vivo → agrega a favoritos) */}
      {mostrarAgregarProducto && (
        <Modal titulo="Agregar producto" onCerrar={() => setMostrarAgregarProducto(false)}>
          <BuscadorProducto
            onSeleccionar={async (producto) => {
              const yaEsFavorito = favoritos.some((f) => f.id === producto.id)
              if (!yaEsFavorito) await toggleFavorito(producto)
              setMostrarAgregarProducto(false)
            }}
          />
        </Modal>
      )}
    </>
  )
}

// ---------------------------------------------------------
// Tab: Comprar de nuevo
// Se arma a partir del historial real de órdenes del usuario
// (GET /orders, que ya incluye ordenes_items con producto_id).
// Por cada producto único comprado se consulta su ficha actual
// (GET /products/:id) para tener precio y foto vigentes.
// ---------------------------------------------------------
function TabComprarDeNuevo() {
  const { items: cartItems, addItem } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('todo') // 'todo' | 'ofertas'

  async function cargarRecompras() {
    try {
      const { data: ordenes } = await api.get('/orders')

      const conteoPorProducto = new Map()
      for (const orden of ordenes) {
        if (orden.estado === 'cancelado') continue
        for (const item of orden.ordenes_items || []) {
          const actual = conteoPorProducto.get(item.producto_id)
          const fechaOrden = orden.created_at
          if (!actual) {
            conteoPorProducto.set(item.producto_id, { veces: 1, ultimaFecha: fechaOrden })
          } else {
            conteoPorProducto.set(item.producto_id, {
              veces: actual.veces + 1,
              ultimaFecha: fechaOrden > actual.ultimaFecha ? fechaOrden : actual.ultimaFecha,
            })
          }
        }
      }

      const idsUnicos = Array.from(conteoPorProducto.keys())

      if (idsUnicos.length === 0) {
        setProductos([])
        return
      }

      const resultados = await Promise.allSettled(
        idsUnicos.map((id) => api.get(`/products/${id}`))
      )

      const productosConDatos = resultados
        .map((r, i) => {
          if (r.status !== 'fulfilled') return null
          const producto = r.value.data
          const meta = conteoPorProducto.get(idsUnicos[i])
          return { ...producto, _veces: meta.veces, _ultimaFecha: meta.ultimaFecha }
        })
        .filter(Boolean)
        .sort((a, b) => b._veces - a._veces || new Date(b._ultimaFecha) - new Date(a._ultimaFecha))

      setProductos(productosConDatos)
    } catch (err) {
      setError('No se pudo cargar tu historial de compras')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarRecompras()
  }, [])

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find((i) => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  if (error) return <p className="misitems-error">{error}</p>

  // "Ofertas" = productos con descuento activo, si el campo existe en el producto
  const productosFiltrados = productos
    .filter((p) => (filtroActivo === 'ofertas' ? p.precio_oferta_usd || p.en_oferta : true))
    .filter((p) =>
      busqueda.trim()
        ? p.nombre_comercial?.toLowerCase().includes(busqueda.trim().toLowerCase())
        : true
    )

  const cantidadOfertas = productos.filter((p) => p.precio_oferta_usd || p.en_oferta).length

  return (
    <section className="comprar-nuevo">
      <div className="comprar-nuevo__chips">
        <button
          type="button"
          className={`filtro-chip filtro-chip--pill ${filtroActivo === 'todo' ? 'filtro-chip--activo' : ''}`}
          onClick={() => setFiltroActivo('todo')}
        >
          Todo
        </button>
        {cantidadOfertas > 0 && (
          <button
            type="button"
            className={`comprar-nuevo__chip-oferta ${filtroActivo === 'ofertas' ? 'comprar-nuevo__chip-oferta--activo' : ''}`}
            onClick={() => setFiltroActivo(filtroActivo === 'ofertas' ? 'todo' : 'ofertas')}
          >
            <span className="comprar-nuevo__chip-oferta-icono">🏷️</span>
            <span>
              <strong>Ofertas</strong>
              <br />
              {cantidadOfertas} producto{cantidadOfertas !== 1 ? 's' : ''}
            </span>
          </button>
        )}
      </div>

      <div className="comprar-nuevo__buscador-row">
        <div className="misitems-buscador comprar-nuevo__buscador">
          <IconoBuscar />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar compras pasadas"
          />
        </div>
        <button type="button" className="comprar-nuevo__filtros-btn">
          <IconoFiltro /> Filtros
        </button>
      </div>

      {cargando ? (
        <div className="comprar-nuevo__lista">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="comprar-nuevo-card comprar-nuevo-card--skeleton" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="misitems-vacio">
          <span className="misitems-vacio__icon">🔁</span>
          <p>Todavía no tienes compras anteriores para recomprar.</p>
          <Link to="/orders" className="misitems-vacio__cta">Ver mis órdenes</Link>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <p className="misitems-vacio-filtro">No hay compras que coincidan con tu búsqueda.</p>
      ) : (
        <div className="comprar-nuevo__lista">
          {productosFiltrados.map((producto) => (
            <div key={producto.id} className="comprar-nuevo-card">
              <Link to={`/producto/${producto.id}`} className="comprar-nuevo-card__media">
                {producto.foto_url ? (
                  <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
                ) : (
                  <div className="itemcard__media-placeholder">Sin imagen</div>
                )}
              </Link>
              <div className="comprar-nuevo-card__info">
                <Link to={`/producto/${producto.id}`} className="comprar-nuevo-card__nombre">
                  {producto.nombre_comercial}
                </Link>
                <p className="comprar-nuevo-card__precio">${formatUSD(producto.precio_usd)}</p>
                <button
                  type="button"
                  className={`comprar-nuevo-card__cta ${cantidadEnCarrito(producto.id) ? 'comprar-nuevo-card__cta--cantidad' : ''}`}
                  onClick={() => addItem(producto, 1)}
                >
                  {cantidadEnCarrito(producto.id)
                    ? `En el carrito (${cantidadEnCarrito(producto.id)})`
                    : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------
// Componente principal
// ---------------------------------------------------------
const TABS = [
  { id: 'items', label: 'Mis Items' },
  { id: 'recomprar', label: 'Comprar de nuevo' },
]

function MisItems() {
  // La pestaña activa vive en la URL (?tab=recomprar) en vez de un
  // useState suelto: así el link "Comprar de nuevo" del menú de
  // Páginas Principales puede llevar directo a esa pestaña, y el
  // botón "atrás" del navegador también funciona como uno espera.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabActivo = searchParams.get('tab') === 'recomprar' ? 'recomprar' : 'items'

  function cambiarTab(id) {
    setSearchParams(id === 'recomprar' ? { tab: 'recomprar' } : {})
  }

  // "Crear lista" vive como acción del menú (no una ruta): la
  // controlamos acá arriba para poder dispararla tanto desde el botón
  // "+" del carrusel de listas como desde el link del sidebar/drawer.
  const [mostrarCrear, setMostrarCrear] = useState(false)

  function manejarAccionNav(accion) {
    if (accion === 'crear-lista') {
      cambiarTab('items')
      setMostrarCrear(true)
    }
  }

  return (
    <LayoutPaginaPrincipal
      activo={tabActivo}
      titulo="Mis Items"
      subtitulo="Tus favoritos, listas y compras frecuentes"
      nav={NAV_UNIFICADO}
      onAccion={manejarAccionNav}
    >
      <div className="misitems-page">
        <div className="misitems-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`misitems-tab ${tabActivo === tab.id ? 'misitems-tab--activo' : ''}`}
              onClick={() => cambiarTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="misitems-container">
          {tabActivo === 'items' && <TabMisItems mostrarCrear={mostrarCrear} setMostrarCrear={setMostrarCrear} />}
          {tabActivo === 'recomprar' && <TabComprarDeNuevo />}
        </div>
      </div>
    </LayoutPaginaPrincipal>
  )
}

export default MisItems
