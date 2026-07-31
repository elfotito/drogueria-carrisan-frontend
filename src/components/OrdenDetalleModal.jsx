function OrdenDetalleModal({ orden, onClose }) {
  if (!orden) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Orden #{orden.id}</h2>
        <p>Estado: {orden.estado}</p>
        <p>Fecha: {new Date(orden.created_at).toLocaleDateString('es-VE')}</p>

        {orden.users && (
          <p>Cliente: {orden.users.nombre} ({orden.users.email})</p>
        )}

        <hr />

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.ordenes_items.map((item) => (
              <tr key={item.id}>
                <td>{item.productos?.nombre}</td>
                <td>{item.cantidad}</td>
                <td>${item.precio_unitario.toFixed(2)}</td>
                <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <p><strong>Total: ${orden.total_usd.toFixed(2)}</strong></p>
      </div>
    </div>
  )
}

export default OrdenDetalleModal