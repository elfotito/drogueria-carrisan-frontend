import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useFavoritos } from '../context/FavoritosContext'
import BottomNav from '../components/BottomNav'
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

// ---------------------------------------------------------
// ItemsCard — tarjeta de producto en grid, usada en Mis Items y
// ReComprar. Admite un badge superior opcional (ej. "Comprado 3 veces").
// ---------------------------------------------------------
function ItemsCard({ producto, cantidadEnCarrito, onAgregar, onQuitar, mostrarQuitar, badge }) {
  return (
    <div className="itemcard">
      <div className="itemcard__media">
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
            onClick={onQuitar}
            aria-label="Quitar de la lista"
          >
            ✕
          </button>
        )}
      </div>

      <button
        type="button"
        className={`itemcard__cta ${cantidadEnCarrito ? 'itemcard__cta--cantidad' : ''}`}
        onClick={onAgregar}
      >
        {cantidadEnCarrito ? cantidadEnCarrito : '+ Agregar'}
      </button>

      <p className="itemcard__precio">${formatUSD(producto?.precio_usd)}</p>
      <p className="itemcard__nombre">{producto?.nombre_comercial}</p>
    </div>
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

function IconoBuscar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TabMisItems() {
  const { items: cartItems, addItem } = useCart()
  const { favoritos, toggleFavorito, loading: cargandoFav } = useFavoritos() // ← desde el contexto
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    if (cargandoFav) return // espera a que el contexto termine de cargar
    setItems(favoritos)
    setCargando(false)
  }, [favoritos, cargandoFav])

  // quitar de favoritos (usa toggleFavorito del contexto)
  async function quitarItem(productoId) {
    const producto = items.find((item) => item.id === productoId)
    if (producto) {
      await toggleFavorito(producto)
      // el contexto actualiza favoritos y el useEffect dispara setItems
    }
  }

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find((i) => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  function agregarTodos() {
    itemsFiltrados.forEach((producto) => addItem(producto, 1))
  }

  if (error) return <p className="misitems-error">{error}</p>

  const itemsFiltrados = busqueda.trim()
    ? items.filter((p) => p.nombre_comercial?.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : items

  return (
    <section className="misitems-section">
      <div className="misitems-section__header">
        <div>
          <h2 className="misitems-section-title">Mis Favoritos</h2>
          {!cargando && items.length > 0 && (
            <p className="misitems-section-subtitulo">
              {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!cargando && items.length > 0 && (
          <button type="button" className="misitems-agregar-todos" onClick={agregarTodos}>
            + Agregar todos
          </button>
        )}
      </div>

      {!cargando && items.length > 0 && (
        <div className="misitems-buscador">
          <IconoBuscar />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en tus favoritos…"
          />
        </div>
      )}

      {cargando ? (
        <div className="product-grid">
          {Array.from({ length: 4 }).map((_, i) => <CarruselSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="misitems-vacio">
          <span className="misitems-vacio__icon">⭐</span>
          <p>Todavía no tienes productos favoritos.</p>
          <Link to="/catalogo" className="misitems-vacio__cta">Explorar catálogo</Link>
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <p className="misitems-vacio-filtro">No hay favoritos que coincidan con "{busqueda}".</p>
      ) : (
        <div className="product-grid">
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
    </section>
  )
}

// ---------------------------------------------------------
// Modal genérico de confirmación / formulario, estilo Amazon
// ("Crear una nueva lista", "Agregar a la lista", etc.)
// ---------------------------------------------------------
function Modal({ titulo, onCerrar, children }) {
  return (
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
    </div>
  )
}

// ---------------------------------------------------------
// Tab: Listas (crear / borrar / sugerencias rápidas)
// ---------------------------------------------------------
function TabListas() {
  const [listas, setListas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    cargarListas()
  }, [])

  async function cargarListas() {
    try {
      const { data } = await api.get('/lists')
      setListas(data)
    } catch (err) {
      setError('No se pudieron cargar las listas')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function crearLista(nombre) {
    if (!nombre.trim()) return
    setCreando(true)
    try {
      await api.post('/lists', { nombre })
      setNuevoNombre('')
      setMostrarCrear(false)
      await cargarListas()
    } catch (err) {
      alert('Error al crear lista')
    } finally {
      setCreando(false)
    }
  }

  async function eliminarLista(listaId) {
    if (!confirm('¿Eliminar esta lista?')) return
    try {
      await api.delete(`/lists/${listaId}`)
      await cargarListas()
    } catch (err) {
      alert('No se puede eliminar la lista predeterminada')
    }
  }

  const nombresExistentes = listas.map((l) => l.nombre.toLowerCase())
  const sugerenciasDisponibles = LISTAS_SUGERIDAS.filter(
    (s) => !nombresExistentes.includes(s.nombre.toLowerCase())
  )

  if (error) return <p className="misitems-error">{error}</p>

  return (
    <section className="misitems-section">
      {/* Listas existentes */}
      <h2 className="misitems-section-title">Mis listas</h2>

      {cargando ? (
        <div className="listas-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="lista-card lista-card--skeleton" />
          ))}
        </div>
      ) : (
        <div className="listas-grid">
          {listas.map((lista) => (
            <Link key={lista.id} to={`/listas/${lista.id}`} className="lista-card">
              <span className="lista-card__icon">
                {lista.es_predeterminada ? '📌' : '📋'}
              </span>
              <span className="lista-card__nombre">{lista.nombre}</span>
              {!lista.es_predeterminada && (
                <button
                  type="button"
                  className="lista-card__eliminar"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    eliminarLista(lista.id)
                  }}
                  aria-label={`Eliminar lista ${lista.nombre}`}
                >
                  ✕
                </button>
              )}
            </Link>
          ))}

          {/* Crear nueva lista — abre modal, estilo Amazon */}
          <button
            type="button"
            className="lista-card lista-card--nueva"
            onClick={() => setMostrarCrear(true)}
          >
            <span className="lista-card__icon">+</span>
            <span className="lista-card__nombre">Nueva lista</span>
          </button>
        </div>
      )}

      {/* Sugerencias rápidas */}
      {!cargando && sugerenciasDisponibles.length > 0 && (
        <>
          <h2 className="misitems-section-title misitems-section-title--sugerencias">
            Creación rápida
          </h2>
          <div className="sugerencias-carousel">
            {sugerenciasDisponibles.map((s) => (
              <button
                key={s.nombre}
                type="button"
                className="sugerencia-chip"
                onClick={() => crearLista(s.nombre)}
              >
                <span className="sugerencia-chip__icon">{s.icon}</span>
                <span>{s.nombre}</span>
              </button>
            ))}
          </div>
        </>
      )}

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
    </section>
  )
}

// ---------------------------------------------------------
// Tab: ReComprar
// Se arma a partir del historial real de órdenes del usuario
// (GET /orders, que ya incluye ordenes_items con producto_id).
// Por cada producto único comprado se consulta su ficha actual
// (GET /productos/:id) para tener precio y foto vigentes, y se
// cuentan las veces que fue pedido para mostrarlo como badge.
// ---------------------------------------------------------
function TabReComprar() {
  const { items: cartItems, addItem } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  async function cargarRecompras() {
    try {
      const { data: ordenes } = await api.get('/orders')

      // Cuenta cuántas veces se pidió cada producto y guarda la fecha
      // más reciente en la que apareció, para poder ordenar por recencia.
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

      // Se piden las fichas de producto actuales en paralelo (precio y
      // foto vigentes, no los que tenía la orden histórica).
      const resultados = await Promise.allSettled(
        idsUnicos.map((id) => api.get(`/productos/${id}`))
      )

      const productosConDatos = resultados
        .map((r, i) => {
          if (r.status !== 'fulfilled') return null
          const producto = r.value.data
          const meta = conteoPorProducto.get(idsUnicos[i])
          return { ...producto, _veces: meta.veces, _ultimaFecha: meta.ultimaFecha }
        })
        .filter(Boolean)
        // más comprado / más reciente primero
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find((i) => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  function agregarTodos() {
    productosFiltrados.forEach((producto) => addItem(producto, 1))
  }

  if (error) return <p className="misitems-error">{error}</p>

  const productosFiltrados = busqueda.trim()
    ? productos.filter((p) => p.nombre_comercial?.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : productos

  return (
    <section className="misitems-section">
      <div className="misitems-section__header">
        <div>
          <h2 className="misitems-section-title">Productos que ya compraste</h2>
          {!cargando && productos.length > 0 && (
            <p className="misitems-section-subtitulo">
              {productos.length} producto{productos.length !== 1 ? 's' : ''} en tu historial
            </p>
          )}
        </div>
        {!cargando && productos.length > 0 && (
          <button type="button" className="misitems-agregar-todos" onClick={agregarTodos}>
            + Agregar todos
          </button>
        )}
      </div>

      {!cargando && productos.length > 0 && (
        <div className="misitems-buscador">
          <IconoBuscar />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en tus compras anteriores…"
          />
        </div>
      )}

      {cargando ? (
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, i) => <CarruselSkeleton key={i} />)}
        </div>
      ) : productos.length === 0 ? (
        <div className="misitems-vacio">
          <span className="misitems-vacio__icon">🔁</span>
          <p>Todavía no tienes compras anteriores para recomprar.</p>
          <Link to="/orders" className="misitems-vacio__cta">Ver mis órdenes</Link>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <p className="misitems-vacio-filtro">No hay compras que coincidan con "{busqueda}".</p>
      ) : (
        <div className="product-grid">
          {productosFiltrados.map((producto) => (
            <ItemsCard
              key={producto.id}
              producto={producto}
              cantidadEnCarrito={cantidadEnCarrito(producto.id)}
              onAgregar={() => addItem(producto, 1)}
              mostrarQuitar={false}
              badge={producto._veces > 1 ? `Comprado ${producto._veces}×` : 'Ya comprado'}
            />
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
  { id: 'listas', label: 'Listas' },
  { id: 'recomprar', label: 'ReComprar' },
]

function MisItems() {
  const [tabActivo, setTabActivo] = useState('items')

  return (
    <div className="misitems-page">
      <div className="misitems-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`misitems-tab ${tabActivo === tab.id ? 'misitems-tab--activo' : ''}`}
            onClick={() => setTabActivo(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="misitems-container">
        {tabActivo === 'items' && <TabMisItems />}
        {tabActivo === 'listas' && <TabListas />}
        {tabActivo === 'recomprar' && <TabReComprar />}
      </div>
      <BottomNav />
    </div>
  )
}

export default MisItems

