import './ProductoCard.css'

function ProductoCard({ producto, onEditar, onDuplicar, onEliminar }) {
  return (
    <div className={`producto-card ${!producto.activo ? 'inactivo' : ''}`}>
      <div className="card-imagen">
        {producto.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre_comercial} />
        ) : (
          <div className="no-imagen">📦</div>
        )}
        <div className="card-badges">
          <span className={`badge-status ${producto.disponible ? 'disponible' : 'no-disponible'}`}>
            {producto.disponible ? '✓ Disponible' : 'Cotizar'}
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <h3>{producto.nombre_comercial}</h3>
        {producto.molecula && <p className="molecula">{producto.molecula}</p>}
        <p className="marca">{producto.marcas?.nombre}</p>
        <p className="laboratorio">{producto.laboratorio} - {producto.pais_origen}</p>
        
        <div className="card-tags">
          <span className="tag">{producto.linea || 'Sin línea'}</span>
          <span className="tag">{producto.forma || 'Sin forma'}</span>
        </div>
        
        <div className="card-precio">
          ${Number(producto.precio_usd).toFixed(2)}
        </div>
      </div>
      
      <div className="card-acciones">
        <button onClick={onEditar} title="Editar">✏️</button>
        <button onClick={onDuplicar} title="Duplicar">📋</button>
        <button onClick={onEliminar} title="Eliminar">🗑️</button>
      </div>
    </div>
  )
}

export default ProductoCard