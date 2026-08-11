import { useState, useEffect } from 'react'
import api from '../../api/axios'
import './DescuentosForm.css'

const ALCANCES = [
  { valor: 'producto', label: 'Producto específico', icono: '📦' },
  { valor: 'marca', label: 'Marca', icono: '🏷️' },
  { valor: 'laboratorio', label: 'Laboratorio', icono: '🧪' },
  { valor: 'molecula', label: 'Molécula', icono: '⚗️' },
  { valor: 'linea', label: 'Línea', icono: '📊' },
  { valor: 'forma', label: 'Forma', icono: '💊' },
]

const CAMPOS_TEXTO = ['laboratorio', 'molecula', 'linea', 'forma']

export default function DescuentoForm({
  productoFijo = null,
  descuentoExistente = null,
  onGuardado,
  onCancelar,
}) {
  const esEdicion = !!descuentoExistente
  const alcanceBloqueado = !!productoFijo

  const [alcance, setAlcance] = useState(
    descuentoExistente?.alcance || (alcanceBloqueado ? 'producto' : 'producto')
  )
  const [productoId, setProductoId] = useState(
    descuentoExistente?.producto_id || productoFijo?.id || null
  )
  const [productoLabel, setProductoLabel] = useState(
    descuentoExistente?.productos?.nombre_comercial || productoFijo?.nombre_comercial || ''
  )
  const [marcaId, setMarcaId] = useState(descuentoExistente?.marca_id || '')
  const [alcanceValor, setAlcanceValor] = useState(descuentoExistente?.alcance_valor || '')
  const [tipo, setTipo] = useState(descuentoExistente?.tipo || 'porcentaje')
  const [valor, setValor] = useState(descuentoExistente?.valor || '')
  const [fechaInicio, setFechaInicio] = useState(
    descuentoExistente?.fecha_inicio?.slice(0, 16) || ''
  )
  const [fechaFin, setFechaFin] = useState(descuentoExistente?.fecha_fin?.slice(0, 16) || '')
  const [activo, setActivo] = useState(descuentoExistente?.activo ?? true)
  const [descripcion, setDescripcion] = useState(descuentoExistente?.descripcion || '')

  const [marcas, setMarcas] = useState([])
  const [valoresTexto, setValoresTexto] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [resultadosProducto, setResultadosProducto] = useState([])

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})
  const [paso, setPaso] = useState(1)

  useEffect(() => {
    if (alcanceBloqueado) return
    api.get('/marcas')
      .then(res => setMarcas(res.data))
      .catch(() => setMarcas([]))
  }, [alcanceBloqueado])

  useEffect(() => {
    if (!CAMPOS_TEXTO.includes(alcance)) return
    api.get(`/products/valores-distintos?campo=${alcance}`)
      .then(res => setValoresTexto(res.data))
      .catch(() => setValoresTexto([]))
  }, [alcance])

  useEffect(() => {
    if (alcanceBloqueado || alcance !== 'producto' || !busquedaProducto.trim()) {
      setResultadosProducto([])
      return
    }
    const timeout = setTimeout(() => {
      api.get(`/products?search=${encodeURIComponent(busquedaProducto)}`)
        .then(res => setResultadosProducto(res.data.slice(0, 8)))
        .catch(() => setResultadosProducto([]))
    }, 300)
    return () => clearTimeout(timeout)
  }, [busquedaProducto, alcance, alcanceBloqueado])

  function seleccionarProducto(p) {
    setProductoId(p.id)
    setProductoLabel(p.nombre_comercial)
    setResultadosProducto([])
    setBusquedaProducto('')
    setErrores({...errores, producto: ''})
  }

  function cambiarAlcance(nuevoAlcance) {
    setAlcance(nuevoAlcance)
    setProductoId(null)
    setProductoLabel('')
    setMarcaId('')
    setAlcanceValor('')
    setErrores({})
  }

  function validarPaso1() {
    const errs = {}
    if (alcance === 'producto' && !productoId) errs.producto = 'Selecciona un producto'
    if (alcance === 'marca' && !marcaId) errs.marca = 'Selecciona una marca'
    if (CAMPOS_TEXTO.includes(alcance) && !alcanceValor) errs.alcanceValor = 'Selecciona un valor'
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function validarPaso2() {
    const errs = {}
    if (!valor || Number(valor) <= 0) errs.valor = 'Ingresa un valor mayor a 0'
    if (tipo === 'porcentaje' && Number(valor) > 100) errs.valor = 'Máximo 100%'
    if (!fechaInicio) errs.fechaInicio = 'La fecha de inicio es requerida'
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
      errs.fechaFin = 'Debe ser posterior a la fecha de inicio'
    }
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function handleSiguiente() {
    if (paso === 1 && validarPaso1()) setPaso(2)
  }

  function handleAnterior() {
    setPaso(1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarPaso2()) return
    
    setError('')
    setGuardando(true)

    const payload = {
      alcance,
      producto_id: alcance === 'producto' ? productoId : null,
      marca_id: alcance === 'marca' ? Number(marcaId) : null,
      alcance_valor: CAMPOS_TEXTO.includes(alcance) ? alcanceValor : null,
      tipo,
      valor: Number(valor),
      fecha_inicio: new Date(fechaInicio).toISOString(),
      fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
      activo,
      descripcion: descripcion || undefined,
    }

    try {
      const res = esEdicion
        ? await api.put(`/descuentos/${descuentoExistente.id}`, payload)
        : await api.post('/descuentos', payload)
      onGuardado?.(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el descuento')
    } finally {
      setGuardando(false)
    }
  }

  const alcanceActual = ALCANCES.find(a => a.valor === alcance)

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-content descuento-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{esEdicion ? '✏️ Editar Descuento' : '🏷️ Nuevo Descuento'}</h2>
          <button className="modal-close" onClick={onCancelar}>✕</button>
        </div>

        {/* Pasos */}
        <div className="form-pasos">
          <div className={`paso ${paso === 1 ? 'active' : paso > 1 ? 'completed' : ''}`}>
            <div className="paso-numero">{paso > 1 ? '✓' : '1'}</div>
            <span>Alcance</span>
          </div>
          <div className="paso-linea"></div>
          <div className={`paso ${paso === 2 ? 'active' : ''}`}>
            <div className="paso-numero">2</div>
            <span>Valor y Fechas</span>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Paso 1: Alcance */}
          {paso === 1 && (
            <div className="form-section">
              {!alcanceBloqueado && (
                <div className="form-group">
                  <label>Aplicar descuento a</label>
                  <div className="alcance-grid">
                    {ALCANCES.map(a => (
                      <label
                        key={a.valor}
                        className={`alcance-card ${alcance === a.valor ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="alcance"
                          value={a.valor}
                          checked={alcance === a.valor}
                          onChange={() => cambiarAlcance(a.valor)}
                        />
                        <span className="alcance-icon">{a.icono}</span>
                        <span className="alcance-label">{a.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Campo dinámico según alcance */}
              {alcance === 'producto' && (
                <div className="form-group">
                  <label>Producto *</label>
                  {alcanceBloqueado ? (
                    <div className="producto-fijo">
                      <span className="producto-fijo-icon">📦</span>
                      {productoLabel}
                    </div>
                  ) : productoId ? (
                    <div className="producto-seleccionado">
                      <span>📦 {productoLabel}</span>
                      <button
                        type="button"
                        className="btn-cambiar"
                        onClick={() => {
                          setProductoId(null)
                          setProductoLabel('')
                        }}
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Buscar producto por nombre..."
                        value={busquedaProducto}
                        onChange={e => setBusquedaProducto(e.target.value)}
                        className={errores.producto ? 'error' : ''}
                      />
                      {resultadosProducto.length > 0 && (
                        <ul className="resultados-busqueda">
                          {resultadosProducto.map(p => (
                            <li key={p.id} onClick={() => seleccionarProducto(p)}>
                              <span>📦</span>
                              <div>
                                <strong>{p.nombre_comercial}</strong>
                                <small>{p.laboratorio}</small>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  {errores.producto && <span className="error-text">{errores.producto}</span>}
                </div>
              )}

              {alcance === 'marca' && (
                <div className="form-group">
                  <label>Marca *</label>
                  <select 
                    value={marcaId} 
                    onChange={e => { setMarcaId(e.target.value); setErrores({...errores, marca: ''}) }}
                    className={errores.marca ? 'error' : ''}
                  >
                    <option value="">Selecciona una marca</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                  {errores.marca && <span className="error-text">{errores.marca}</span>}
                </div>
              )}

              {CAMPOS_TEXTO.includes(alcance) && (
                <div className="form-group">
                  <label>{alcanceActual?.label} *</label>
                  <select 
                    value={alcanceValor} 
                    onChange={e => { setAlcanceValor(e.target.value); setErrores({...errores, alcanceValor: ''}) }}
                    className={errores.alcanceValor ? 'error' : ''}
                  >
                    <option value="">Selecciona un valor</option>
                    {valoresTexto.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {errores.alcanceValor && <span className="error-text">{errores.alcanceValor}</span>}
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Valor y Fechas */}
          {paso === 2 && (
            <div className="form-section">
              <div className="form-group">
                <label>Tipo de Descuento</label>
                <div className="tipo-selector">
                  <label className={`tipo-card ${tipo === 'porcentaje' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="tipo"
                      value="porcentaje"
                      checked={tipo === 'porcentaje'}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    <span className="tipo-icon">%</span>
                    <span className="tipo-label">Porcentaje</span>
                  </label>
                  <label className={`tipo-card ${tipo === 'monto' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="tipo"
                      value="monto"
                      checked={tipo === 'monto'}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                    <span className="tipo-icon">$</span>
                    <span className="tipo-label">Monto Fijo</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Valor del Descuento *</label>
                <div className="input-precio">
                  <span className="precio-simbolo">{tipo === 'porcentaje' ? '%' : '$'}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={tipo === 'porcentaje' ? 100 : undefined}
                    value={valor}
                    onChange={e => { setValor(e.target.value); setErrores({...errores, valor: ''}) }}
                    className={errores.valor ? 'error' : ''}
                    placeholder={tipo === 'porcentaje' ? '15' : '5.00'}
                  />
                </div>
                {errores.valor && <span className="error-text">{errores.valor}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={e => { setFechaInicio(e.target.value); setErrores({...errores, fechaInicio: ''}) }}
                    className={errores.fechaInicio ? 'error' : ''}
                  />
                  {errores.fechaInicio && <span className="error-text">{errores.fechaInicio}</span>}
                </div>

                <div className="form-group">
                  <label>Fecha de Fin (opcional)</label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={e => { setFechaFin(e.target.value); setErrores({...errores, fechaFin: ''}) }}
                    className={errores.fechaFin ? 'error' : ''}
                  />
                  {errores.fechaFin && <span className="error-text">{errores.fechaFin}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="2"
                  placeholder="Ej: Descuento de verano 2026..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                  />
                  <div className="checkbox-card-content">
                    <div className="checkbox-card-header">
                      <span className="checkbox-card-icon">{activo ? '✅' : '⏸️'}</span>
                      <strong>Descuento Activo</strong>
                    </div>
                    <small>Los descuentos inactivos no se aplican</small>
                  </div>
                </label>
              </div>

              {/* Resumen */}
              <div className="resumen-card">
                <h4>📋 Resumen del Descuento</h4>
                <div className="resumen-item">
                  <span>Alcance:</span>
                  <strong>{alcanceActual?.icono} {alcanceActual?.label}</strong>
                </div>
                <div className="resumen-item">
                  <span>Aplica a:</span>
                  <strong>
                    {alcance === 'producto' ? productoLabel :
                     alcance === 'marca' ? marcas.find(m => m.id == marcaId)?.nombre || '—' :
                     alcanceValor || '—'}
                  </strong>
                </div>
                <div className="resumen-item">
                  <span>Tipo:</span>
                  <strong>{tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}</strong>
                </div>
                <div className="resumen-item">
                  <span>Valor:</span>
                  <strong className="valor-descuento">
                    {tipo === 'porcentaje' ? `${valor}%` : `$${Number(valor).toFixed(2)}`}
                  </strong>
                </div>
                <div className="resumen-item">
                  <span>Vigencia:</span>
                  <strong>
                    {fechaInicio ? new Date(fechaInicio).toLocaleDateString('es-VE') : '—'}
                    {fechaFin ? ` → ${new Date(fechaFin).toLocaleDateString('es-VE')}` : ' (sin fin)'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="form-navegacion">
            {paso > 1 ? (
              <button type="button" onClick={handleAnterior} className="btn-secundario">
                ← Anterior
              </button>
            ) : (
              <button type="button" onClick={onCancelar} className="btn-secundario">
                Cancelar
              </button>
            )}
            
            {paso < 2 ? (
              <button type="button" onClick={handleSiguiente} className="btn-primario">
                Siguiente →
              </button>
            ) : (
              <button type="submit" disabled={guardando} className="btn-guardar">
                {guardando ? (
                  <><span className="spinner-small"></span> Guardando...</>
                ) : (
                  esEdicion ? '💾 Guardar Cambios' : '✨ Crear Descuento'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}