import { useState, useEffect, useMemo } from 'react'
import api from '../../api/axios'
import ClienteDetalle from './ClienteDetalle'
import './EstadoCuentaAdmin.css'

const ITEMS_POR_PAGINA = 10

function EstadoCuentaAdmin() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroDeuda, setFiltroDeuda] = useState('todos') // todos, con-deuda, al-dia
  const [ordenarPor, setOrdenarPor] = useState('deuda')
  const [ordenDireccion, setOrdenDireccion] = useState('desc')
  const [paginaActual, setPaginaActual] = useState(1)
  const [vista, setVista] = useState('tabla')

  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    try {
      setCargando(true)
      const { data } = await api.get('/estado-cuenta')
      setClientes(data)
    } catch (err) {
      setError('No se pudo cargar el estado de cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function toggleOrden(campo) {
    if (ordenarPor === campo) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenarPor(campo)
      setOrdenDireccion('desc')
    }
  }

  // Filtrado y ordenamiento
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Búsqueda por nombre
    if (busqueda) {
      const texto = busqueda.toLowerCase()
      resultado = resultado.filter(c =>
        c.nombre?.toLowerCase().includes(texto) ||
        c.email?.toLowerCase().includes(texto)
      )
    }

    // Filtro deuda
    if (filtroDeuda === 'con-deuda') {
      resultado = resultado.filter(c => c.deuda_actual > 0)
    } else if (filtroDeuda === 'al-dia') {
      resultado = resultado.filter(c => c.deuda_actual <= 0)
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA, valorB
      switch(ordenarPor) {
        case 'nombre':
          valorA = (a.nombre || '').toLowerCase()
          valorB = (b.nombre || '').toLowerCase()
          break
        case 'credito':
          valorA = Number(a.linea_credito) || 0
          valorB = Number(b.linea_credito) || 0
          break
        case 'facturado':
          valorA = Number(a.total_facturado) || 0
          valorB = Number(b.total_facturado) || 0
          break
        case 'pagado':
          valorA = Number(a.total_pagado) || 0
          valorB = Number(b.total_pagado) || 0
          break
        case 'deuda':
          valorA = Number(a.deuda_actual) || 0
          valorB = Number(b.deuda_actual) || 0
          break
        case 'saldo':
          valorA = Number(a.saldo) || 0
          valorB = Number(b.saldo) || 0
          break
        default:
          valorA = Number(a.deuda_actual) || 0
          valorB = Number(b.deuda_actual) || 0
      }
      
      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [clientes, busqueda, filtroDeuda, ordenarPor, ordenDireccion])

  // Paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA)
  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  )

  useEffect(() => {
    setPaginaActual(1)
  }, [busqueda, filtroDeuda])

  // Estadísticas
  const stats = useMemo(() => {
    const total = clientes.length
    const conDeuda = clientes.filter(c => c.deuda_actual > 0).length
    const alDia = clientes.filter(c => c.deuda_actual <= 0).length
    const deudaTotal = clientes.reduce((sum, c) => sum + Number(c.deuda_actual || 0), 0)
    const saldoFavorTotal = clientes
      .filter(c => c.saldo > 0)
      .reduce((sum, c) => sum + Number(c.saldo || 0), 0)

    return { total, conDeuda, alDia, deudaTotal, saldoFavorTotal }
  }, [clientes])

  // Si hay un cliente seleccionado, mostramos su detalle
  if (clienteSeleccionadoId) {
    return (
      <ClienteDetalle
        clienteId={clienteSeleccionadoId}
        onVolver={() => {
          setClienteSeleccionadoId(null)
          cargarClientes()
        }}
      />
    )
  }

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando estado de cuenta...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarClientes} className="btn-reintentar">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="estado-cuenta-admin">
      {/* Header */}
      <div className="section-header">
        <div className="header-top">
          <h2>💳 Estado de Cuenta</h2>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.total}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>
        <div className="stat-card stat-deuda">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.conDeuda}</div>
            <div className="stat-label">Con Deuda</div>
          </div>
        </div>
        <div className="stat-card stat-aldia">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-valor">{stats.alDia}</div>
            <div className="stat-label">Al Día</div>
          </div>
        </div>
        <div className="stat-card stat-monto">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-valor">${stats.deudaTotal.toFixed(2)}</div>
            <div className="stat-label">Deuda Total</div>
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
              placeholder="Buscar cliente por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>

          <select 
            value={filtroDeuda} 
            onChange={(e) => setFiltroDeuda(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los clientes</option>
            <option value="con-deuda">⚠️ Con deuda</option>
            <option value="al-dia">✅ Al día</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <div className="vista-toggle">
            <button 
              className={`vista-btn ${vista === 'tabla' ? 'active' : ''}`}
              onClick={() => setVista('tabla')}
            >
              📋
            </button>
            <button 
              className={`vista-btn ${vista === 'cards' ? 'active' : ''}`}
              onClick={() => setVista('cards')}
            >
              🎴
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="resultados-info">
        Mostrando {clientesPaginados.length} de {clientesFiltrados.length} clientes
      </div>

      {/* Vista Tabla */}
      {vista === 'tabla' ? (
        <div className="table-container">
          <table className="estado-cuenta-table">
            <thead>
              <tr>
                <th onClick={() => toggleOrden('nombre')} className="sortable">
                  Cliente {ordenarPor === 'nombre' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('credito')} className="sortable">
                  Línea Crédito {ordenarPor === 'credito' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('facturado')} className="sortable">
                  Facturado {ordenarPor === 'facturado' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('pagado')} className="sortable">
                  Pagado {ordenarPor === 'pagado' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('deuda')} className="sortable">
                  Deuda {ordenarPor === 'deuda' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => toggleOrden('saldo')} className="sortable">
                  Saldo {ordenarPor === 'saldo' && (ordenDireccion === 'asc' ? '↑' : '↓')}
                </th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {clientesPaginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="sin-resultados">
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <p>No se encontraron clientes</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clientesPaginados.map((cliente) => (
                  <tr 
                    key={cliente.id}
                    className={`cliente-row ${cliente.deuda_actual > 0 ? 'tiene-deuda' : 'al-dia'}`}
                  >
                    <td>
                      <div className="cliente-cell">
                        <div className="cliente-avatar">
                          {(cliente.nombre?.[0] || 'C').toUpperCase()}
                        </div>
                        <div>
                          <div className="cliente-nombre">{cliente.nombre || 'Sin nombre'}</div>
                          {cliente.email && (
                            <div className="cliente-email">{cliente.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="monto-cell">
                      ${Number(cliente.linea_credito || 0).toFixed(2)}
                    </td>
                    <td className="monto-cell facturado">
                      ${Number(cliente.total_facturado || 0).toFixed(2)}
                    </td>
                    <td className="monto-cell pagado">
                      ${Number(cliente.total_pagado || 0).toFixed(2)}
                    </td>
                    <td className={`monto-cell deuda ${cliente.deuda_actual > 0 ? 'deuda-positiva' : ''}`}>
                      ${Number(cliente.deuda_actual || 0).toFixed(2)}
                    </td>
                    <td className={`monto-cell saldo ${cliente.saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
                      {cliente.saldo >= 0 ? '+' : ''}${Number(cliente.saldo || 0).toFixed(2)}
                    </td>
                    <td>
                      <button 
                        onClick={() => setClienteSeleccionadoId(cliente.id)}
                        className="btn-detalle"
                      >
                        👁️ Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vista Cards */
        <div className="cards-grid">
          {clientesPaginados.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            clientesPaginados.map((cliente) => (
              <div 
                key={cliente.id} 
                className={`estado-card ${cliente.deuda_actual > 0 ? 'tiene-deuda' : 'al-dia'}`}
              >
                <div className="card-header">
                  <div className="cliente-avatar-grande">
                    {(cliente.nombre?.[0] || 'C').toUpperCase()}
                  </div>
                  <div className="cliente-info">
                    <strong>{cliente.nombre || 'Sin nombre'}</strong>
                    {cliente.email && <span>{cliente.email}</span>}
                    <span className={`deuda-badge ${cliente.deuda_actual > 0 ? 'con-deuda' : 'sin-deuda'}`}>
                      {cliente.deuda_actual > 0 ? '⚠️ Con deuda' : '✅ Al día'}
                    </span>
                  </div>
                </div>
                
                <div className="card-montos">
                  <div className="monto-row">
                    <span>Crédito:</span>
                    <strong>${Number(cliente.linea_credito || 0).toFixed(2)}</strong>
                  </div>
                  <div className="monto-row">
                    <span>Facturado:</span>
                    <strong>${Number(cliente.total_facturado || 0).toFixed(2)}</strong>
                  </div>
                  <div className="monto-row">
                    <span>Pagado:</span>
                    <strong className="pagado">${Number(cliente.total_pagado || 0).toFixed(2)}</strong>
                  </div>
                  <div className="monto-divider"></div>
                  <div className="monto-row deuda-row">
                    <span>Deuda:</span>
                    <strong className={cliente.deuda_actual > 0 ? 'deuda' : ''}>
                      ${Number(cliente.deuda_actual || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className={`monto-row saldo-row ${cliente.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                    <span>Saldo:</span>
                    <strong>
                      {cliente.saldo >= 0 ? '+' : ''}${Number(cliente.saldo || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
                
                <button 
                  onClick={() => setClienteSeleccionadoId(cliente.id)}
                  className="btn-ver-detalle"
                >
                  👁️ Ver detalle completo
                </button>
              </div>
            ))
          )}
        </div>
      )}

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
    </div>
  )
}

export default EstadoCuentaAdmin