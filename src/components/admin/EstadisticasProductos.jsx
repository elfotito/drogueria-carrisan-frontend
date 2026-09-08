import './EstadisticasProductos.css'

function EstadisticasProductos({ productos, stats }) {
  let datos
  if (stats) {
    datos = {
      total: stats.total,
      disponibles: stats.disponibles,
      lineas: (stats.lineas || []).length,
      precioPromedio: stats.precioPromedio,
    }
  } else {
    const lista = productos || []
    const conPrecio = lista.filter((p) => p.precio_usd != null && Number(p.precio_usd) > 0)
    datos = {
      total: lista.length,
      disponibles: lista.filter((p) => p.disponible && p.activo).length,
      lineas: new Set(lista.map((p) => p.linea).filter(Boolean)).size,
      precioPromedio: conPrecio.length
        ? (conPrecio.reduce((s, p) => s + Number(p.precio_usd), 0) / conPrecio.length).toFixed(2)
        : '0.00',
    }
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-info">
          <div className="stat-valor">{datos.total}</div>
          <div className="stat-label">Total Productos</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <div className="stat-valor">{datos.disponibles}</div>
          <div className="stat-label">Disponibles</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <div className="stat-valor">{datos.lineas}</div>
          <div className="stat-label">Líneas</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💵</div>
        <div className="stat-info">
          <div className="stat-valor">${datos.precioPromedio}</div>
          <div className="stat-label">Precio Promedio</div>
        </div>
      </div>
    </div>
  )
}

export default EstadisticasProductos