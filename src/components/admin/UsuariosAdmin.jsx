import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import UsuarioForm from './UsuarioForm'
import './UsuariosAdmin.css'

const ITEMS_POR_PAGINA = 10

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [usuarioDescuento, setUsuarioDescuento] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenarPor, setOrdenarPor] = useState('nombre')
  const [ordenDireccion, setOrdenDireccion] = useState('asc')

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    try {
      setCargando(true)
      const response = await api.get('/users')
      setUsuarios(response.data)
    } catch (err) {
      setError('No se pudieron cargar los usuarios')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setUsuarioEnEdicion(null)
    setMostrarForm(true)
  }

  function abrirEdicion(usuario) {
    setUsuarioEnEdicion(usuario)
    setMostrarForm(true)
  }

  function cerrarForm() {
    setMostrarForm(false)
    setUsuarioEnEdicion(null)
  }

  async function handleGuardado() {
    cerrarForm()
    await cargarUsuarios()
  }

  async function handleEliminarUsuario(id) {
    try {
      await api.delete(`/users/${id}`)
      setUsuarios(prev => prev.filter(u => u.id !== id))
      setUsuarioAEliminar(null)
    } catch (err) {
      alert('No se pudo eliminar el usuario')
      console.error(err)
    }
  }

  async function handleToggleActivo(usuario) {
    try {
      await api.patch(`/users/${usuario.id}`, { activo: !usuario.activo })
      setUsuarios(prev =>
        prev.map(u => u.id === usuario.id ? { ...u, activo: !u.activo } : u)
      )
    } catch (err) {
      alert('No se pudo cambiar el estado')
      console.error(err)
    }
  }

  function abrirDescuento(usuario) {
    setUsuarioDescuento(usuario)
  }

  function cerrarDescuento() {
    setUsuarioDescuento(null)
  }

  function toggleOrden(campo) {
    if (ordenarPor === campo) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenarPor(campo)
      setOrdenDireccion('asc')
    }
  }

  const usuariosFiltrados = useMemo(() => {
    let resultado = [...usuarios]

    if (busqueda) {
      const texto = busqueda.toLowerCase()
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(texto) ||
        u.email?.toLowerCase().includes(texto) ||
        u.rif_cedula?.toLowerCase().includes(texto) ||
        u.telefono?.toLowerCase().includes(texto)
      )
    }

    if (filtroEtiqueta !== 'todos') {
      resultado = resultado.filter(u => u.etiqueta === filtroEtiqueta)
    }

    if (filtroEstado !== 'todos') {
      const activo = filtroEstado === 'activo'
      resultado = resultado.filter(u => (u.activo !== false) === activo)
    }

    resultado.sort((a, b) => {
      let valorA, valorB
      switch(ordenarPor) {
        case 'nombre':
          valorA = (a.nombre || '').toLowerCase()
          valorB = (b.nombre || '').toLowerCase()
          break
        case 'email':
          valorA = (a.email || '').toLowerCase()
          valorB = (b.email || '').toLowerCase()
          break
        case 'credito':
          valorA = Number(a.linea_credito) || 0
          valorB = Number(b.linea_credito) || 0
          break
        case 'fecha':
          valorA = new Date(a.created_at).getTime()
          valorB = new Date(b.created_at).getTime()
          break
        default:
          valorA = (a.nombre || '').toLowerCase()
          valorB = (b.nombre || '').toLowerCase()
      }
      
      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [usuarios, busqueda, filtroEtiqueta, filtroEstado, ordenarPor, ordenDireccion])

  const totalPaginas = Math.ceil(usuariosFiltrados.length / ITEMS_POR_PAGINA)
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroEtiqueta, filtroEstado])

  const etiquetas = [...new Set(usuarios.map(u => u.etiqueta).filter(Boolean))]

  const stats = useMemo(() => {
    return {
      total: usuarios.length,
      activos: usuarios.filter(u => u.activo !== false).length,
      admins: usuarios.filter(u => u.es_admin || u.etiqueta === 'admin').length,
      deliveryGratis: usuarios.filter(u => u.delivery_gratis).length
    }
  }, [usuarios])

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarUsuarios} className="btn-reintentar">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="usuarios-admin">
      {/* Header */}
      <div className="section-header">
        <div className="header-top">
          <h2>👥 Usuarios</h2>
          <div className="header-actions">
            <button onClick={abrirNuevo} className="btn-agregar">
              + Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.total}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div className="stat-card stat-activos">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.activos}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>
        <div className="stat-card stat-admins">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.admins}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>
        <div className="stat-card stat-delivery">
          <div className="stat-icon">🛵</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.deliveryGratis}</div>
            <div className="stat-label">Delivery Gratis</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-filtros">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, email, RIF o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={filtroEtiqueta} 
            onChange={(e) => setFiltroEtiqueta(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todas las etiquetas</option>
            {etiquetas.map(etq => (
              <option key={etq} value={etq}>
                {etq === 'admin' ? '🛡️ Admin' : 
                 etq === 'distribuidor' ? '🏢 Distribuidor' : 
                 `👤 ${etq}`}
              </option>
            ))}
          </select>

          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">✅ Activos</option>
            <option value="inactivo">❌ Inactivos</option>
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="resultados-info">
        Mostrando {usuariosPaginados.length} de {usuariosFiltrados.length} usuarios
        {busqueda && ` (filtrados de ${usuarios.length} totales)`}
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th onClick={() => toggleOrden('nombre')} className="sortable">
                Usuario {ordenarPor === 'nombre' && (ordenDireccion === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleOrden('email')} className="sortable">
                Email {ordenarPor === 'email' && (ordenDireccion === 'asc' ? '↑' : '↓')}
              </th>
              <th>RIF/Cédula</th>
              <th>Etiqueta</th>
              <th>Teléfono</th>
              <th onClick={() => toggleOrden('credito')} className="sortable">
                Crédito {ordenarPor === 'credito' && (ordenDireccion === 'asc' ? '↑' : '↓')}
              </th>
              <th>Delivery</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPaginados.length === 0 ? (
              <tr>
                <td colSpan="9" className="sin-resultados">
                  <div className="empty-state">
                    <span className="empty-icon">👻</span>
                    <p>No se encontraron usuarios</p>
                    {busqueda && <p className="empty-hint">Intenta con otros filtros</p>}
                  </div>
                </td>
              </tr>
            ) : (
              usuariosPaginados.map((usuario) => (
                <tr key={usuario.id} className={usuario.activo === false ? 'usuario-inactivo' : ''}>
                  <td>
                    <div className="usuario-cell">
                      <div className="usuario-avatar">
                        {(usuario.nombre?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div className="usuario-nombre">
                          {usuario.nombre || 'Sin nombre'}
                          {usuario.es_admin && <span className="admin-badge">ADMIN</span>}
                        </div>
                        <div className="usuario-fecha">
                          Desde {new Date(usuario.created_at).toLocaleDateString('es-VE')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{usuario.email}</td>
                  <td>{usuario.rif_cedula || '-'}</td>
                  <td>
                    <span className={`etiqueta-badge etiqueta-${usuario.etiqueta || 'cliente'}`}>
                      {usuario.etiqueta === 'admin' ? '🛡️ Admin' :
                       usuario.etiqueta === 'distribuidor' ? '🏢 Distribuidor' :
                       `👤 ${usuario.etiqueta || 'Cliente'}`}
                    </span>
                  </td>
                  <td>{usuario.telefono || '-'}</td>
                  <td className="credito-cell">
                    ${Number(usuario.linea_credito || 0).toFixed(2)}
                  </td>
                  <td>
                    {usuario.delivery_gratis ? (
                      <span className="delivery-badge">🛵 Gratis</span>
                    ) : (
                      <span className="delivery-no">-</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActivo(usuario)}
                      className={`estado-toggle ${usuario.activo !== false ? 'activo' : 'inactivo'}`}
                      title={usuario.activo !== false ? 'Desactivar' : 'Activar'}
                    >
                      {usuario.activo !== false ? '✅' : '❌'}
                    </button>
                  </td>
                  <td>
                    <div className="acciones-cell">
                      <button 
                        onClick={() => abrirEdicion(usuario)}
                        className="btn-icon" 
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => abrirDescuento(usuario)}
                        className="btn-icon btn-descuento" 
                        title="Gestionar descuento"
                      >
                        💰
                      </button>
                      <button 
                        onClick={() => setUsuarioAEliminar(usuario)}
                        className="btn-icon btn-danger" 
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            onClick={() => setPaginaActual(1)}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >⏮️</button>
          <button 
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="btn-pagina"
          >◀️</button>
          
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 2)
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && <span className="paginacion-dots">...</span>}
                <button
                  onClick={() => setPaginaActual(p)}
                  className={`btn-pagina ${paginaActual === p ? 'active' : ''}`}
                >{p}</button>
              </span>
            ))}
          
          <button 
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >▶️</button>
          <button 
            onClick={() => setPaginaActual(totalPaginas)}
            disabled={paginaActual === totalPaginas}
            className="btn-pagina"
          >⏭️</button>
        </div>
      )}

      {/* Modal de descuento */}
      {usuarioDescuento && (
        <DescuentoUsuarioModal
          usuario={usuarioDescuento}
          onClose={cerrarDescuento}
          onGuardado={cargarUsuarios}
        />
      )}

      {/* Modal formulario */}
      {mostrarForm && (
        <UsuarioForm
          usuario={usuarioEnEdicion}
          onClose={cerrarForm}
          onGuardado={handleGuardado}
        />
      )}

      {/* Modal confirmar eliminación */}
      {usuarioAEliminar && (
        <div className="modal-overlay" onClick={() => setUsuarioAEliminar(null)}>
          <div className="modal-content modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Confirmar Eliminación</h3>
            <p>¿Estás seguro de eliminar al usuario <strong>{usuarioAEliminar.nombre || usuarioAEliminar.email}</strong>?</p>
            <p className="warning-text">Esta acción no se puede deshacer. Se eliminarán todos sus datos, órdenes y descuentos asociados.</p>
            <div className="modal-acciones">
              <button onClick={() => setUsuarioAEliminar(null)} className="btn-cancelar">
                Cancelar
              </button>
              <button onClick={() => handleEliminarUsuario(usuarioAEliminar.id)} className="btn-eliminar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Componente DescuentoUsuarioModal
// ============================================================

function DescuentoUsuarioModal({ usuario, onClose, onGuardado }) {
  const [porcentaje, setPorcentaje] = useState(usuario.descuento_porcentaje || 0)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function handleGuardarDescuento() {
    setGuardando(true)
    setMensaje('')
    try {
      // Aquí harías la llamada a tu API para guardar el descuento
      // await api.post('/usuario-descuento', { 
      //   usuario_id: usuario.id, 
      //   porcentaje: Number(porcentaje) 
      // })
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMensaje('✅ Descuento guardado correctamente')
      setTimeout(() => {
        onGuardado()
        onClose()
      }, 1500)
    } catch (err) {
      setMensaje('❌ Error al guardar el descuento')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content descuento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💰 Descuento de Usuario</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="descuento-body">
          <div className="descuento-usuario-info">
            <div className="usuario-avatar-grande">
              {(usuario.nombre?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <strong>{usuario.nombre || 'Sin nombre'}</strong>
              <span>{usuario.email}</span>
              <span className="etiqueta-badge etiqueta-{usuario.etiqueta || 'cliente'}">
                {usuario.etiqueta || 'Cliente'}
              </span>
            </div>
          </div>

          <div className="descuento-divider" />

          <div className="descuento-form">
            <label>Porcentaje de descuento para todos los productos</label>
            <div className="descuento-input-wrapper">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                placeholder="0.00"
              />
              <span className="descuento-simbolo">%</span>
            </div>

            {porcentaje > 0 && (
              <div className="descuento-ejemplo">
                <p>📊 Ejemplo:</p>
                <span>Producto de $100.00 → <strong>${(100 - Number(porcentaje)).toFixed(2)}</strong></span>
              </div>
            )}
          </div>

          {mensaje && (
            <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>
              {mensaje}
            </div>
          )}

          <div className="descuento-acciones">
            <button onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
            <button 
              onClick={handleGuardarDescuento} 
              className="btn-guardar"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : '💾 Guardar Descuento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsuariosAdmin