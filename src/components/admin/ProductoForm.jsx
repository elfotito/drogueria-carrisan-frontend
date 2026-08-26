import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './ProductoForm.css'

const LINEAS = ['Linea Hospitalaria', 'Linea Farmacia', 'Material Medico']
const FORMAS = ['Ampollas', 'Tabletas', 'Jarabes']
const PAISES = ['Venezuela', 'Colombia', 'Argentina', 'Brasil', 'México', 'Estados Unidos', 'India', 'China']

function ProductoForm({ producto, marcas, onClose, onGuardado }) {
  const esEdicion = Boolean(producto?.id)
  const [paso, setPaso] = useState(1)

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
  const [errores, setErrores] = useState({})
  const [imagenFile, setImagenFile] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [previewLocal, setPreviewLocal] = useState(null)

  function validarFormulario() {
    const nuevosErrores = {}

    if (!nombreComercial.trim()) {
      nuevosErrores.nombreComercial = 'El nombre comercial es requerido'
    }
    if (!marcaId) {
      nuevosErrores.marcaId = 'Selecciona una marca'
    }
    if (!precioUsd || Number(precioUsd) <= 0) {
      nuevosErrores.precioUsd = 'Ingresa un precio válido'
    }
    if (fotoUrl && !isValidUrl(fotoUrl)) {
      nuevosErrores.fotoUrl = 'URL de imagen no válida'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!validarFormulario()) return

    setGuardando(true)

    try {
      let urlFinal = fotoUrl

      if (imagenFile) {
        setSubiendoImagen(true)
        const formData = new FormData()
        formData.append('imagen', imagenFile)
        const { data } = await api.post('/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        urlFinal = data.url
        setSubiendoImagen(false)
      }

      const payload = {
        nombre_comercial: nombreComercial,
        descripcion,
        marca_id: marcaId,
        precio_usd: Number(precioUsd),
        foto_url: urlFinal,
        laboratorio,
        pais_origen: paisOrigen,
        molecula,
        linea: linea || null,
        forma: forma || null,
        disponible,
        ...(esEdicion && { activo }),
      }

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
      setSubiendoImagen(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content producto-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{esEdicion ? '✏️ Editar Producto' : '🆕 Nuevo Producto'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Pasos */}
        <div className="form-pasos">
          <div className={`paso ${paso === 1 ? 'active' : paso > 1 ? 'completed' : ''}`}>
            <div className="paso-numero">1</div>
            <span>Información Básica</span>
          </div>
          <div className="paso-linea"></div>
          <div className={`paso ${paso === 2 ? 'active' : paso > 2 ? 'completed' : ''}`}>
            <div className="paso-numero">2</div>
            <span>Clasificación</span>
          </div>
          <div className="paso-linea"></div>
          <div className={`paso ${paso === 3 ? 'active' : ''}`}>
            <div className="paso-numero">3</div>
            <span>Precio y Estado</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Paso 1: Información Básica */}
          {paso === 1 && (
            <div className="form-section">
              <div className="form-group">
                <label>Nombre Comercial *</label>
                <input
                  value={nombreComercial}
                  onChange={(e) => {
                    setNombreComercial(e.target.value)
                    setErrores({...errores, nombreComercial: ''})
                  }}
                  className={errores.nombreComercial ? 'error' : ''}
                  placeholder="Ej: Acetaminofén 500mg"
                />
                {errores.nombreComercial && <span className="error-text">{errores.nombreComercial}</span>}
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={descripcion} 
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada del producto..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Marca *</label>
                <select 
                  value={marcaId} 
                  onChange={(e) => {
                    setMarcaId(e.target.value)
                    setErrores({...errores, marcaId: ''})
                  }}
                  className={errores.marcaId ? 'error' : ''}
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
                {errores.marcaId && <span className="error-text">{errores.marcaId}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Laboratorio</label>
                  <input 
                    value={laboratorio} 
                    onChange={(e) => setLaboratorio(e.target.value)}
                    placeholder="Nombre del laboratorio"
                  />
                </div>

                <div className="form-group">
                  <label>País de Origen</label>
                  <select value={paisOrigen} onChange={(e) => setPaisOrigen(e.target.value)}>
                    <option value="">Seleccionar país</option>
                    {PAISES.map((pais) => (
                      <option key={pais} value={pais}>{pais}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Molécula(s)</label>
                <input
                  value={molecula}
                  onChange={(e) => setMolecula(e.target.value)}
                  placeholder="Ej: Paracetamol + Cafeína"
                />
              </div>
            </div>
          )}

          {/* Paso 2: Clasificación */}
          {paso === 2 && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Línea</label>
                  <select value={linea} onChange={(e) => setLinea(e.target.value)}>
                    <option value="">Seleccionar línea</option>
                    {LINEAS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Forma Farmacéutica</label>
                  <select value={forma} onChange={(e) => setForma(e.target.value)}>
                    <option value="">Seleccionar forma</option>
                    {FORMAS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Imagen del Producto</label>
                
                <div className="upload-area">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setImagenFile(file)
                        setPreviewLocal(URL.createObjectURL(file))
                      }
                    }}
                    id="imagen-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imagen-upload" className="upload-label">
                    {previewLocal || fotoUrl ? (
                      <img src={previewLocal || fotoUrl} alt="Preview" className="upload-preview" />
                    ) : (
                      <span>📷 Click para subir imagen</span>
                    )}
                  </label>
                </div>

                <input 
                  value={fotoUrl} 
                  onChange={(e) => {
                    setFotoUrl(e.target.value)
                    setImagenFile(null)
                    setPreviewLocal(null)
                    setErrores({...errores, fotoUrl: ''})
                  }}
                  className={errores.fotoUrl ? 'error' : ''}
                  placeholder="O pega una URL de imagen"
                  style={{ marginTop: '8px' }}
                />
                {errores.fotoUrl && <span className="error-text">{errores.fotoUrl}</span>}
              </div>
            </div>
          )}

          {/* Paso 3: Precio y Estado */}
          {paso === 3 && (
            <div className="form-section">
              <div className="form-group">
                <label>Precio (USD) *</label>
                <div className="input-precio">
                  <span className="precio-simbolo">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioUsd}
                    onChange={(e) => {
                      setPrecioUsd(e.target.value)
                      setErrores({...errores, precioUsd: ''})
                    }}
                    className={errores.precioUsd ? 'error' : ''}
                    placeholder="0.00"
                  />
                </div>
                {errores.precioUsd && <span className="error-text">{errores.precioUsd}</span>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={disponible}
                    onChange={(e) => setDisponible(e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <strong>Producto Disponible</strong>
                    <small>Si se desmarca, el catálogo oculta el precio y muestra "Pedir cotización"</small>
                  </div>
                </label>
              </div>

              {esEdicion && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                    />
                    <div className="checkbox-content">
                      <strong>Producto Activo</strong>
                      <small>Los productos inactivos no aparecen en el catálogo público</small>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="form-navegacion">
            {paso > 1 && (
              <button 
                type="button" 
                onClick={() => setPaso(p => p - 1)}
                className="btn-secundario"
              >
                ← Anterior
              </button>
            )}
            
            {paso < 3 ? (
              <button 
                type="button" 
                onClick={() => setPaso(p => p + 1)}
                className="btn-primario"
              >
                Siguiente →
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={guardando}
                className="btn-guardar"
              >
                {guardando ? (
                  <>
                    <span className="spinner-small"></span>
                    {subiendoImagen ? 'Subiendo imagen...' : 'Guardando...'}
                  </>
                ) : (
                  esEdicion ? '💾 Guardar Cambios' : '✨ Crear Producto'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductoForm