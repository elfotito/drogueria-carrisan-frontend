function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="skeleton-block skeleton-img" />
      <div className="skeleton-block skeleton-line skeleton-line--marca" />
      <div className="skeleton-block skeleton-line skeleton-line--nombre" />
      <div className="skeleton-block skeleton-line skeleton-line--desc" />
      <div className="skeleton-block skeleton-line skeleton-line--desc-corta" />
      <div className="skeleton-block skeleton-line skeleton-line--precio" />
      <div className="skeleton-block skeleton-btn" />
    </div>
  )
}

export default ProductCardSkeleton