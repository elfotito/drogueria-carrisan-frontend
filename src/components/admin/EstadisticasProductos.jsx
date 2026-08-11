import './EstadisticasProductos.css'

function EstadisticasProductos({ productos }) {
  const stats = {
    total: productos.length,
    disponibles: productos.filter(p => p.disponible && p.activo).length,
    lineas: [...new Set(productos.map(p => p.linea).filter(Boolean))].length,
    precioPromedio: productos.length > 0 
      ? (productos.reduce((sum, p) => sum + Number(p.precio_usd), 0) / productos.length).toFixed(2)
      : 0
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-info">
          <div className="stat-valor">{stats.total}</div>
          <div className="stat-label">Total Productos</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <div className="stat-valor">{stats.disponibles}</div>
          <div className="stat-label">Disponibles</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <div className="stat-valor">{stats.lineas}</div>
          <div className="stat-label">Líneas</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">💵</div>
        <div className="stat-info">
          <div className="stat-valor">${stats.precioPromedio}</div>
          <div className="stat-label">Precio Promedio</div>
        </div>
      </div>
    </div>
  )
}

export default EstadisticasProductos