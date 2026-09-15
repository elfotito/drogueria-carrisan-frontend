import { useRef } from 'react'
import { ICONOS_CATEGORIAS, ICONO_CATEGORIA_FALLBACK } from '../config/categoriasIconos'
import './CategoriasCarruselCatalogo.css'

// Carrusel compacto de categorías EXCLUSIVO del catálogo (/catalogo).
// A diferencia del CategoriasCarrusel compartido (Home), aquí no hay tarjeta
// "Ver todo" ni enlace a /catalogo (ya estamos ahí): cada item es un chip que
// filtra la grilla en vivo y el primer chip ("Todo") deselecciona la categoría.
// El padre ya cargó /products/metadata, así que recibe `categorias` como prop.
function CategoriasCarruselCatalogo({ categorias = [], activoId = 'todos', onSeleccionar }) {
  const filaRef = useRef(null)

  function scroll(direccion) {
    filaRef.current?.scrollBy({ left: direccion * 220, behavior: 'smooth' })
  }

  const lista = [{ id: 'todos', nombre: 'Todo', icono: 'LayoutGrid' }, ...categorias]

  return (
    <section className="ccc" aria-label="Categorías del catálogo">
      {lista.length > 1 && (
        <button
          type="button"
          className="ccc__flecha ccc__flecha--prev"
          onClick={() => scroll(-1)}
          aria-label="Categorías anteriores"
        >
          ‹
        </button>
      )}

      <div className="ccc__fila" ref={filaRef}>
        {lista.map((cat) => {
          const Icono = ICONOS_CATEGORIAS[cat.icono] || ICONO_CATEGORIA_FALLBACK
          const activa = activoId === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              className={`ccc__chip${activa ? ' ccc__chip--activo' : ''}`}
              onClick={() => onSeleccionar(cat.id)}
              aria-pressed={activa}
            >
              <Icono className="ccc__chip-icono" strokeWidth={2} aria-hidden="true" />
              <span>{cat.nombre}</span>
            </button>
          )
        })}
      </div>

      {lista.length > 1 && (
        <button
          type="button"
          className="ccc__flecha ccc__flecha--next"
          onClick={() => scroll(1)}
          aria-label="Siguientes categorías"
        >
          ›
        </button>
      )}
    </section>
  )
}

export default CategoriasCarruselCatalogo