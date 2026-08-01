import { useState } from 'react'
import api from '../../api/axios'

const LINEAS = ['Linea Hospitalaria', 'Linea Farmacia', 'Material Medico']
const FORMAS = ['Ampollas', 'Tabletas', 'Jarabes']

function ProductoForm({ producto, marcas, onClose, onGuardado }) {
  const esEdicion = Boolean(producto)

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
  const [activo, setActivo] = useState(producto?.activo ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const payload = {
      nombre_comercial: nombreComercial,
      descripcion,
      marca_id: marcaId,
      precio_usd: Number(precioUsd),
      foto_url: fotoUrl,
      laboratorio,
      pais_origen: paisOrigen,
      molecula,
      linea: linea || null,
      forma: forma || null,
      disponible,
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
      setError(err.response?.data?.error || 'Error al guardar el producto')
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
            Nombre comercial
            <input
              value={nombreComercial}
              onChange={(e) => setNombreComercial(e.target.value)}
              required
            />
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

          <div className="form-row">
            <label>
              Laboratorio
              <input value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)} />
            </label>

            <label>
              País de origen
              <input value={paisOrigen} onChange={(e) => setPaisOrigen(e.target.value)} />
            </label>
          </div>

          <label>
            Molécula(s)
            <input
              value={molecula}
              onChange={(e) => setMolecula(e.target.value)}
              placeholder="Ej: Paracetamol+Cafeina"
            />
          </label>

          <div className="form-row">
            <label>
              Línea
              <select value={linea} onChange={(e) => setLinea(e.target.value)}>
                <option value="">Seleccionar línea</option>
                {LINEAS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </label>

            <label>
              Forma
              <select value={forma} onChange={(e) => setForma(e.target.value)}>
                <option value="">Seleccionar forma</option>
                {FORMAS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>

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

          <label>
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            Disponible (si se desmarca, el catálogo oculta el precio y muestra "Pedir cotización")
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