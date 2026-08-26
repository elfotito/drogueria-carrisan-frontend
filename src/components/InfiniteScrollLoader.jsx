import './InfiniteScrollLoader.css'

// Skeleton/spinner que se muestra al final de la lista cuando
// el infinite scroll está cargando más contenido.
function InfiniteScrollLoader() {
  return (
    <div className="infinite-loader" role="status" aria-label="Cargando más contenido">
      <div className="infinite-loader__spinner" />
      <span className="infinite-loader__texto">Cargando más productos...</span>
    </div>
  )
}

export default InfiniteScrollLoader
