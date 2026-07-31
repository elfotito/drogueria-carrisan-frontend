import { useState, useEffect } from 'react'
import api from '../../api/axios'

function ProductoForm({ producto, marcas, onClose, onGuardado }) {
  const esEdicion = Boolean(producto)

  const [nombre, setNombre] = useState(producto?.nombre || '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '')
  const [marcaId, setMarcaId] = useState(producto?.marca_id || '')
  const [precioUsd, setPrecioUsd] = useState(producto?.precio_usd || '')
  const [fotoUrl, setFotoUrl] = useState(producto?.foto_url || '')
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const payload = {
      nombre,
      descripcion,
      marca_id: marcaId,
      precio_usd: Number(precioUsd),
      foto_url: fotoUrl,
      ...(esEdicion && { activo }), // solo mandamos "activo" si estamos editando
    }

    try {
      if (esEdicion) {
        await api.patch(`/products/${producto.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>

          <label>
            Descripción
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>

          <label>
            Marca
            <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)} required>
              <option value="">Seleccionar marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </select>
          </label>

          <label>
            Precio (USD)
            <input
              type="number"
              step="0.01"
              min="0"
              value={precioUsd}
              onChange={(e) => setPrecioUsd(e.target.value)}
              required
            />
          </label>

          <label>
            URL de la foto
            <input value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
          </label>

          {esEdicion && (
            <label>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              Activo
            </label>
          )}

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProductoForm