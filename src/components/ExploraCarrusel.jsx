import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './ExploraCarrusel.css'

// ── DATA — Editá acá para agregar/quitar categorías o laboratorios ──
// Cada item: { imagen: 'URL', nombre: 'Etiqueta', link: '/catalogo?param=valor' }
const BASE_IMG = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'

const CATEGORIAS = [
  { imagen: `${BASE_IMG}/medicamentos.png`, nombre: 'Analgésicos', link: '/catalogo?categoria=Analgésicos' },
  { imagen: `${BASE_IMG}/ampollas.png`, nombre: 'Inyectables', link: '/catalogo?categoria=Inyectables' },
  { imagen: `${BASE_IMG}/quirofano.png`, nombre: 'Hospitalaria', link: '/catalogo?categoria=Hospitalaria' },
  { imagen: `${BASE_IMG}/ampolla.jpg`, nombre: 'Antibióticos', link: '/catalogo?categoria=Antibióticos' },
  { imagen: `${BASE_IMG}/repartidor.jpg`, nombre: 'Cuidado Personal', link: '/catalogo?categoria=Cuidado Personal' },
  { imagen: `${BASE_IMG}/medicamentos.png`, nombre: 'Vitaminas', link: '/catalogo?categoria=Vitaminas' },
  { imagen: `${BASE_IMG}/ampollas.png`, nombre: 'Infantil', link: '/catalogo?categoria=Infantil' },
  { imagen: `${BASE_IMG}/quirofano.png`, nombre: 'Primeros Auxilios', link: '/catalogo?categoria=Primeros Auxilios' },
]

const LABORATORIOS = [
  { imagen: `${BASE_IMG}/medicamentos.png`, nombre: 'Bayer', link: '/catalogo?laboratorio=Bayer' },
  { imagen: `${BASE_IMG}/ampollas.png`, nombre: 'Roche', link: '/catalogo?laboratorio=Roche' },
  { imagen: `${BASE_IMG}/quirofano.png`, nombre: 'Pfizer', link: '/catalogo?laboratorio=Pfizer' },
  { imagen: `${BASE_IMG}/ampolla.jpg`, nombre: 'GSK', link: '/catalogo?laboratorio=GSK' },
  { imagen: `${BASE_IMG}/repartidor.jpg`, nombre: 'Sanofi', link: '/catalogo?laboratorio=Sanofi' },
  { imagen: `${BASE_IMG}/medicamentos.png`, nombre: 'AstraZeneca', link: '/catalogo?laboratorio=AstraZeneca' },
  { imagen: `${BASE_IMG}/ampollas.png`, nombre: 'Merck', link: '/catalogo?laboratorio=Merck' },
  { imagen: `${BASE_IMG}/quirofano.png`, nombre: 'Novartis', link: '/catalogo?laboratorio=Novartis' },
]

// ── Fila de items scrolleable ──
function FilaExploracion({ titulo, verTodoTo, items }) {
  const filaRef = useRef(null)

  function scroll(direccion) {
    filaRef.current?.scrollBy({ left: direccion * 260, behavior: 'smooth' })
  }

  if (!items || items.length === 0) return null

  return (
    <section className="explora-carrusel">
      <div className="explora-carrusel__header">
        <h2 className="explora-carrusel__titulo">{titulo}</h2>
        <div className="explora-carrusel__acciones">
          <Link to={verTodoTo} className="explora-carrusel__ver-todo">Ver todo</Link>
          <div className="explora-carrusel__flechas">
            <button onClick={() => scroll(-1)} aria-label="Anterior">‹</button>
            <button onClick={() => scroll(1)} aria-label="Siguiente">›</button>
          </div>
        </div>
      </div>

      <div className="explora-carrusel__fila" ref={filaRef}>
        {items.map((item) => (
          <Link to={item.link} key={item.nombre} className="explora-carrusel__card">
            <div className="explora-carrusel__card-img-wrap">
              <img
                src={item.imagen}
                alt={item.nombre}
                className="explora-carrusel__card-img"
                loading="lazy"
              />
            </div>
            <span className="explora-carrusel__card-nombre">{item.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Componentes separados: podés colocarlos en distintas partes ──
function ExploraCategorias() {
  return (
    <FilaExploracion
      titulo="Explorá por categoría"
      verTodoTo="/catalogo"
      items={CATEGORIAS}
    />
  )
}

function ExploraLaboratorios() {
  return (
    <FilaExploracion
      titulo="Explorá por laboratorio"
      verTodoTo="/catalogo"
      items={LABORATORIOS}
    />
  )
}

export default ExploraCategorias
export { ExploraCategorias, ExploraLaboratorios }
