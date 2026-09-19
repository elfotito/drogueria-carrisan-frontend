import './InfiniteScrollLoader.css'

// Skeleton que imita la forma real de un HomeCarrusel (título + fila de
// cards) mientras el infinite scroll trae la siguiente ronda.
function InfiniteScrollLoader() {
  return (
    <div className="infinite-loader" role="status" aria-label="Cargando más contenido">
      <div className="infinite-loader__titulo" />
      <div className="infinite-loader__fila">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="infinite-loader__card" key={i} />
        ))}
      </div>
    </div>
  )
}

export default InfiniteScrollLoader