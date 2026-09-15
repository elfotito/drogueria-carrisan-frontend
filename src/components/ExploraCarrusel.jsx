import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './ExploraCarrusel.css'

// ── DATA — Editá acá para agregar/quitar laboratorios ──
// Cada item: { imagen: 'URL', nombre: 'Etiqueta', link: '/catalogo?param=valor' }
// Las CATEGORÍAS ya no viven acá: ver CategoriasCarrusel.jsx (dinámicas desde
// /products/metadata, con los 16 iconos de categorias_tienda).
const BASE_IMG = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'

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

// ── Componente: fila de laboratorios ──
function ExploraLaboratorios() {
  return (
    <FilaExploracion
      titulo="Explorá por laboratorio"
      verTodoTo="/catalogo"
      items={LABORATORIOS}
    />
  )
}

export default ExploraLaboratorios
export { ExploraLaboratorios }
