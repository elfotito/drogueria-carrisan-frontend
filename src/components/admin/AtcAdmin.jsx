import { useState, useEffect } from 'react'
import api from '../../api/axios'

const NOMBRES_NIVEL = {
  1: 'Grupo anatómico',
  2: 'Subgrupo terapéutico',
  3: 'Subgrupo farmacológico',
  4: 'Subgrupo químico',
  5: 'Sustancia / molécula',
}

function AtcAdmin() {
  const [nodos, setNodos] = useState([])
  const [breadcrumb, setBreadcrumb] = useState([]) // pila de nodos padre navegados
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nodoEnEdicion, setNodoEnEdicion] = useState(null)
  const [nodoAEliminar, setNodoAEliminar] = useState(null)

  const padreActual = breadcrumb[breadcrumb.length - 1] || null
  const nivelActual = padreActual ? padreActual.nivel + 1 : 1

  useEffect(() => {
    cargarNodos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padreActual])

  async function cargarNodos() {
    try {
      setCargando(true)
      setError('')
      const params = padreActual ? { padre_id: padreActual.id } : { padre_id: '' }
      const res = await api.get('/moleculas/atc-clasificaciones', { params })
      setNodos(res.data)
    } catch (err) {
      setError('No se pudieron cargar las clasificaciones ATC')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function entrarANodo(nodo) {
    if (nodo.nivel >= 5) return // nivel 5 no tiene hijos
    setBreadcrumb([...breadcrumb, nodo])
  }

  function irABreadcrumb(index) {
    // index -1 = raíz
    setBreadcrumb(breadcrumb.slice(0, index + 1))
  }

  function abrirNuevo() {
    setNodoEnEdicion(null)
    setMostrarForm(true)
  }

  function abrirEdicion(nodo) {
    setNodoEnEdicion(nodo)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setNodoEnEdicion(null)
  }

  async function handleGuardado() {
    cerrarForm()
    await cargarNodos()
  }

  async function eliminarNodo(id) {
    try {
      await api.delete(`/moleculas/atc-clasificaciones/${id}`)
      setNodoAEliminar(null)
      await cargarNodos()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al eliminar la clasificación'
      setError(msg)
      setNodoAEliminar(null)
    }
  }

  return (
    <div className="atc-admin">
      <div className="mol-toolbar">
        <div className="mol-breadcrumb">
          <button className="mol-breadcrumb-item" onClick={() => irABreadcrumb(-1)}>
            Raíz
          </button>
          {breadcrumb.map((nodo, i) => (
            <span key={nodo.id}>
              <span className="mol-breadcrumb-sep"> / </span>
              <button className="mol-breadcrumb-item" onClick={() => irABreadcrumb(i)}>
                {nodo.codigo} — {nodo.nombre}
              </button>
            </span>
          ))}
        </div>
        <button onClick={abrirNuevo} className="mol-btn-agregar">
          + Nueva clasificación ({NOMBRES_NIVEL[nivelActual]})
        </button>
      </div>

      {error && <p className="mol-error-text">{error}</p>}

      {cargando ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : nodos.length === 0 ? (
        <div className="mol-empty-state">
          No hay clasificaciones en este nivel todavía.
        </div>
      ) : (
        <div className="mol-table-container">
          <table className="mol-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Origen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {nodos.map((nodo) => (
                <tr key={nodo.id}>
                  <td>
                    {nodo.nivel < 5 ? (
                      <button className="mol-link-btn" onClick={() => entrarANodo(nodo)}>
                        {nodo.codigo} →
                      </button>
                    ) : (
                      nodo.codigo
                    )}
                  </td>
                  <td>{nodo.nombre}</td>
                  <td>
                    <span className="mol-badge-nivel">
                      {nodo.es_sistema ? 'ATC oficial' : 'Personalizado'}
                    </span>
                  </td>
                  <td>
                    <div className="mol-acciones-cell">
                      <button onClick={() => abrirEdicion(nodo)} className="mol-btn-icon" title="Editar">
                        ✏️
                      </button>
                      <button
                        onClick={() => setNodoAEliminar(nodo)}
                        className="mol-btn-icon danger"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nodoAEliminar && (
        <div className="modal-overlay" onClick={() => setNodoAEliminar(null)}>
          <div className="mol-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Confirmar eliminación</h3>
            <p>
              ¿Eliminar <strong>{nodoAEliminar.codigo} — {nodoAEliminar.nombre}</strong>?
            </p>
            <p className="mol-error-text">
              No se podrá si tiene moléculas o subcategorías asociadas.
            </p>
            <div className="mol-modal-acciones">
              <button onClick={() => setNodoAEliminar(null)} className="mol-btn-cancelar">
                Cancelar
              </button>
              <button onClick={() => eliminarNodo(nodoAEliminar.id)} className="mol-btn-guardar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarForm && (
        <AtcForm
          nodo={nodoEnEdicion}
          nivel={nivelActual}
          padre={padreActual}
          onClose={cerrarForm}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}

function AtcForm({ nodo, nivel, padre, onClose, onGuardado }) {
  const [codigo, setCodigo] = useState(nodo?.codigo || '')
  const [nombre, setNombre] = useState(nodo?.nombre || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!codigo.trim() || !nombre.trim()) {
      setError('Código y nombre son requeridos')
      return
    }

    setGuardando(true)
    try {
      if (nodo) {
        await api.patch(`/moleculas/atc-clasificaciones/${nodo.id}`, { codigo, nombre })
      } else {
        await api.post('/moleculas/atc-clasificaciones', {
          codigo,
          nombre,
          nivel,
          padre_id: padre?.id || null,
        })
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mol-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{nodo ? '✏️ Editar' : '+ Nueva'} clasificación ATC</h3>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Nivel {nivel} — {NOMBRES_NIVEL[nivel]}
          {padre && <> · dentro de {padre.codigo} — {padre.nombre}</>}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mol-form-group">
            <label>Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder={nivel === 5 ? 'ej. N02BE01' : 'ej. N02B'}
            />
          </div>
          <div className="mol-form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="ej. Analgésicos"
            />
          </div>

          {error && <p className="mol-error-text">{error}</p>}

          <div className="mol-modal-acciones">
            <button type="button" onClick={onClose} className="mol-btn-cancelar">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="mol-btn-guardar">
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AtcAdmin
