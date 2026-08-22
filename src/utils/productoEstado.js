// ---------------------------------------------------------------
// Mismo helper que en ProductoDetalle.jsx — un solo lugar para la
// regla de los 3 estados, así ProductCard/PromoCard/ProductoDetalle
// nunca se desincronizan.
// ---------------------------------------------------------------

export function getEstadoProducto(producto) {
  if (producto.es_cotizacion) return 'cotizacion'
  if (!producto.precio_usd || Number(producto.precio_usd) === 0) return 'proximamente'
  return 'normal'
}
