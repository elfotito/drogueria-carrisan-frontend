import { useState, useEffect } from 'react'
import api from '../../api/axios'

function ProductoForm({ producto, marcas, onClose, onGuardado }) {
  const esEdicion = Boolean(producto)

  // Estado con todos los campos nuevos
  const [nombreComercial, setNombreComercial] = useState(producto?.nombre_comercial || '')
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '')
  const [marcaId, setMarcaId] = useState(producto?.marca_id || '')
  const [precioUsd, setPrecioUsd] = useState(producto?.precio_usd || '')
  const [fotoUrl, setFotoUrl] = useState(producto?.foto_url || '')
  const [laboratorio, setLaboratorio] = useState(producto?.laboratorio || '')
  const [paisOrigen, setPaisOrigen] = useState(producto?.pais_origen || '')
  const [molecula, setMolecula] = useState(producto?.molecula || '')
  const [linea, setLinea] = useState(producto?.linea || '')
  const [forma, setForma] = useState(producto?.forma || '')
  const [disponible, setDisponible] = useState(producto?.disponible ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const payload = {
      nombre_comercial: nombreComercial,
      descripcion,
      marca_id: marcaId || null, // Permitir null si no se selecciona
      precio_usd: Number(precioUsd),
      foto_url: fotoUrl || null,
      laboratorio: laboratorio || null,
      pais_origen: paisOrigen || null,
      molecula: molecula || null,
      linea: linea || null,
      forma: forma || null,
      disponible
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Campos requeridos */}
          <label>
            Nombre Comercial *
            <input 
              value={nombreComercial} 
              onChange={(e) => setNombreComercial(e.target.value)} 
              required 
            />
          </label>

          <label>
            Precio (USD) *
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
            Marca
            <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)}>
              <option value="">Sin marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </select>
          </label>

          {/* Campos nuevos */}
          <label>
            Laboratorio
            <input 
              value={laboratorio} 
              onChange={(e) => setLaboratorio(e.target.value)} 
            />
          </label>

          <label>
            País de Origen
            <input 
              value={paisOrigen} 
              onChange={(e) => setPaisOrigen(e.target.value)} 
            />
          </label>

          <label>
            Molécula
            <input 
              value={molecula} 
              onChange={(e) => setMolecula(e.target.value)} 
            />
          </label>

          <label>
            Línea
            <input 
              value={linea} 
              onChange={(e) => setLinea(e.target.value)} 
            />
          </label>

          <label>
            Forma
            <input 
              value={forma} 
              onChange={(e) => setForma(e.target.value)} 
            />
          </label>

          <label>
            Descripción
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              rows="3"
            />
          </label>

          <label>
            URL de la foto
            <input 
              value={fotoUrl} 
              onChange={(e) => setFotoUrl(e.target.value)} 
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </label>

          {/* Checkbox de disponibilidad */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            Disponible
          </label>

          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProductoForm