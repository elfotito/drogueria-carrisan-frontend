import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useFavoritos } from '../context/FavoritosContext'
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
// Card de item en carrusel horizontal (usada en Mis Items y ReComprar)
// ---------------------------------------------------------
function ItemCard({ producto, cantidadEnCarrito, onAgregar, onQuitar, mostrarQuitar }) {
  return (
    <div className="itemcard">
      <div className="itemcard__media">
        {producto?.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre_comercial} loading="lazy" />
        ) : (
          <div className="itemcard__media-placeholder">Sin imagen</div>
        )}

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

// ---------------------------------------------------------
// Tab: Mis Items (lista predeterminada, carrusel horizontal)
// ---------------------------------------------------------
// ---------------------------------------------------------
// Tab: Mis Items (ahora desde favoritos reales, no lista predeterminada)
// ---------------------------------------------------------
function TabMisItems() {
  const { items: cartItems, addItem } = useCart()
  const { favoritos, toggleFavorito, loading: cargandoFav } = useFavoritos() // ← desde el contexto
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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

  if (error) return <p className="misitems-error">{error}</p>

  return (
    <section className="misitems-section">
      <h2 className="misitems-section-title">Mis Favoritos</h2>

      {cargando ? (
        <div className="itemcard-carousel">
          {Array.from({ length: 4 }).map((_, i) => <CarruselSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="misitems-vacio">
          <p>Todavía no tienes productos favoritos.</p>
          <Link to="/catalogo" className="misitems-vacio__cta">Explorar catálogo</Link>
        </div>
      ) : (
        <div className="itemcard-carousel">
          {items.map((producto) => (
            <ItemCard
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

          {/* Crear nueva lista */}
          {mostrarCrear ? (
            <div className="lista-card lista-card--crear-form">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre de la lista"
                className="lista-crear-input"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && crearLista(nuevoNombre)}
              />
              <div className="lista-crear-actions">
                <button
                  type="button"
                  className="lista-crear-btn lista-crear-btn--confirmar"
                  onClick={() => crearLista(nuevoNombre)}
                  disabled={creando}
                >
                  Crear
                </button>
                <button
                  type="button"
                  className="lista-crear-btn"
                  onClick={() => { setMostrarCrear(false); setNuevoNombre('') }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="lista-card lista-card--nueva"
              onClick={() => setMostrarCrear(true)}
            >
              <span className="lista-card__icon">+</span>
              <span className="lista-card__nombre">Nueva lista</span>
            </button>
          )}
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
    </section>
  )
}

// ---------------------------------------------------------
// Tab: ReComprar
// NOTA: el backend todavía no tiene un endpoint de "productos ya
// comprados". Este tab queda funcional en UI, mockeado con estado
// vacío honesto, listo para conectar cuando exista /reorder o similar.
// ---------------------------------------------------------
function TabReComprar() {
  const { items: cartItems, addItem } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // TODO: reemplazar por api.get('/orders/reorder') o el endpoint
    // que definan cuando exista histórico de compras por producto.
    setCargando(false)
    setProductos([])
  }, [])

  function cantidadEnCarrito(productoId) {
    const linea = cartItems.find((i) => i.producto.id === productoId)
    return linea?.cantidad || 0
  }

  return (
    <section className="misitems-section">
      <h2 className="misitems-section-title">Productos que ya compraste</h2>

      {cargando ? (
        <div className="product-grid-recomprar">
          {Array.from({ length: 6 }).map((_, i) => <CarruselSkeleton key={i} />)}
        </div>
      ) : productos.length === 0 ? (
        <div className="misitems-vacio">
          <p>Todavía no tenemos historial de compras para sugerirte recompras.</p>
          <Link to="/pedidos" className="misitems-vacio__cta">Ver mis órdenes</Link>
        </div>
      ) : (
        <div className="product-grid-recomprar">
          {productos.map((producto) => (
            <ItemCard
              key={producto.id}
              producto={producto}
              cantidadEnCarrito={cantidadEnCarrito(producto.id)}
              onAgregar={() => addItem(producto, 1)}
              mostrarQuitar={false}
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
    </div>
  )
}

export default MisItems
