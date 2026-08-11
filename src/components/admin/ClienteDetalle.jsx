import { useState, useEffect } from 'react'
import api from '../../api/axios'
import FacturaForm from './FacturaForm'
import PagoForm from './PagoForm'
import './ClienteDetalle.css'

function ClienteDetalle({ clienteId, onVolver }) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarFacturaForm, setMostrarFacturaForm] = useState(false)
  const [mostrarPagoForm, setMostrarPagoForm] = useState(false)
  const [facturaEnEdicion, setFacturaEnEdicion] = useState(null)
  const [tabActiva, setTabActiva] = useState('facturas') // facturas, pagos

  useEffect(() => {
    cargarDetalle()
  }, [clienteId])

  async function cargarDetalle() {
    try {
      setCargando(true)
      const { data } = await api.get(`/clientes/estado-cuenta/${clienteId}`)
      setDatos(data)
    } catch (err) {
      setError('No se pudo cargar el detalle del cliente')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function handleEliminarPago(pagoId) {
    const confirmado = window.confirm(
      '¿Seguro que querés eliminar este pago? Las facturas que había saldado volverán a estado pendiente.'
    )
    if (!confirmado) return

    try {
      await api.delete(`/pagos/${pagoId}`)
      await cargarDetalle()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el pago')
    }
  }

  function abrirNuevaFactura() {
    setFacturaEnEdicion(null)
    setMostrarFacturaForm(true)
  }

  function abrirEdicionFactura(factura) {
    setFacturaEnEdicion(factura)
    setMostrarFacturaForm(true)
  }

  function cerrarFacturaForm() {
    setMostrarFacturaForm(false)
    setFacturaEnEdicion(null)
  }

  async function handleGuardado() {
    setMostrarFacturaForm(false)
    setFacturaEnEdicion(null)
    setMostrarPagoForm(false)
    await cargarDetalle()
  }

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando detalle del cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={cargarDetalle} className="btn-reintentar">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  const { cliente, resumen, facturas, pagos } = datos
  const estadoCliente = resumen.deuda_actual > 0 ? 'con-deuda' : 'al-dia'

  return (
    <div className="cliente-detalle">
      {/* Header */}
      <div className="cd-header">
        <button onClick={onVolver} className="btn-volver">
          ← Volver a Estado de Cuenta
        </button>
      </div>

      {/* Info del cliente */}
      <div className="cd-cliente-card">
        <div className="cd-cliente-info">
          <div className="cd-cliente-avatar">
            {(cliente.nombre?.[0] || 'C').toUpperCase()}
          </div>
          <div>
            <h2>{cliente.nombre || 'Sin nombre'}</h2>
            <span className="cd-cliente-email">{cliente.email || 'Sin email'}</span>
            {cliente.rif_cedula && (
              <span className="cd-cliente-rif">RIF: {cliente.rif_cedula}</span>
            )}
          </div>
        </div>
        <span className={`cd-estado-badge ${estadoCliente}`}>
          {estadoCliente === 'con-deuda' ? '⚠️ Con Deuda' : '✅ Al Día'}
        </span>
      </div>

      {/* Resumen de cuenta */}
      <div className="cd-resumen-grid">
        <div className="cd-resumen-item">
          <span className="cd-resumen-label">Línea de Crédito</span>
          <span className="cd-resumen-valor">
            ${Number(resumen.linea_credito).toFixed(2)}
          </span>
        </div>
        <div className="cd-resumen-item">
          <span className="cd-resumen-label">Total Facturado</span>
          <span className="cd-resumen-valor facturado">
            ${Number(resumen.total_facturado).toFixed(2)}
          </span>
        </div>
        <div className="cd-resumen-item">
          <span className="cd-resumen-label">Total Pagado</span>
          <span className="cd-resumen-valor pagado">
            ${Number(resumen.total_pagado).toFixed(2)}
          </span>
        </div>
        <div className="cd-resumen-item">
          <span className="cd-resumen-label">Deuda Actual</span>
          <span className={`cd-resumen-valor ${resumen.deuda_actual > 0 ? 'deuda' : ''}`}>
            ${Number(resumen.deuda_actual).toFixed(2)}
          </span>
        </div>
        <div className="cd-resumen-item cd-saldo">
          <span className="cd-resumen-label">Saldo</span>
          <span className={`cd-resumen-valor saldo ${resumen.saldo >= 0 ? 'positivo' : 'negativo'}`}>
            {resumen.saldo >= 0 ? '+' : ''}${Number(resumen.saldo).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="cd-acciones">
        <button onClick={abrirNuevaFactura} className="btn-accion btn-factura">
          + Nueva Factura
        </button>
        <button onClick={() => setMostrarPagoForm(true)} className="btn-accion btn-pago">
          + Registrar Pago
        </button>
      </div>

      {/* Tabs */}
      <div className="cd-tabs">
        <button 
          className={`cd-tab ${tabActiva === 'facturas' ? 'active' : ''}`}
          onClick={() => setTabActiva('facturas')}
        >
          🧾 Facturas ({facturas.length})
        </button>
        <button 
          className={`cd-tab ${tabActiva === 'pagos' ? 'active' : ''}`}
          onClick={() => setTabActiva('pagos')}
        >
          💰 Pagos ({pagos.length})
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="cd-tab-content">
        {tabActiva === 'facturas' && (
          <>
            {facturas.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <p>Sin facturas registradas</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="cd-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Órdenes</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map((f) => (
                      <tr key={f.id} className={`factura-row estado-${f.estado}`}>
                        <td>
                          <span className="factura-numero">#{f.numero_factura}</span>
                        </td>
                        <td className="monto-cell">
                          ${Number(f.monto_facturado).toFixed(2)}
                        </td>
                        <td>
                          <span className={`estado-badge-factura ${f.estado}`}>
                            {f.estado === 'pendiente' ? '⏳ Pendiente' :
                             f.estado === 'pagado' ? '✅ Pagado' :
                             f.estado === 'parcial' ? '🔶 Parcial' : f.estado}
                          </span>
                        </td>
                        <td>
                          {f.factura_ordenes?.length > 0 
                            ? f.factura_ordenes.map(fo => `#${fo.orden_id}`).join(', ')
                            : '—'}
                        </td>
                        <td className="fecha-cell">
                          {new Date(f.created_at).toLocaleDateString('es-VE')}
                        </td>
                        <td>
                          <button 
                            onClick={() => abrirEdicionFactura(f)}
                            className="btn-icon-editar"
                            title="Editar factura"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tabActiva === 'pagos' && (
          <>
            {pagos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💵</span>
                <p>Sin pagos registrados</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="cd-table">
                  <thead>
                    <tr>
                      <th>Monto</th>
                      <th>Tipo</th>
                      <th>Detalle</th>
                      <th>Facturas</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.id} className={`pago-row tipo-${p.tipo}`}>
                        <td className="monto-cell pagado">
                          ${Number(p.monto).toFixed(2)}
                        </td>
                        <td>
                          <span className={`tipo-pago-badge ${p.tipo}`}>
                            {p.tipo === 'abono' ? '💵 Abono' :
                             p.tipo === 'devolucion' ? '↩️ Devolución' :
                             p.tipo === 'nota_credito' ? '📝 Nota Crédito' : p.tipo}
                          </span>
                        </td>
                        <td className="detalle-cell">{p.detalle || '—'}</td>
                        <td>
                          {p.pago_facturas?.length > 0 
                            ? p.pago_facturas.map(pf => `#${pf.factura_id}`).join(', ')
                            : '—'}
                        </td>
                        <td className="fecha-cell">
                          {new Date(p.created_at).toLocaleDateString('es-VE')}
                        </td>
                        <td>
                          <button 
                            onClick={() => handleEliminarPago(p.id)}
                            className="btn-icon-eliminar"
                            title="Eliminar pago"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {mostrarFacturaForm && (
        <FacturaForm
          clienteId={clienteId}
          factura={facturaEnEdicion}
          onClose={cerrarFacturaForm}
          onGuardado={handleGuardado}
        />
      )}

      {mostrarPagoForm && (
        <PagoForm
          clienteId={clienteId}
          facturasPendientes={facturas.filter((f) => f.estado === 'pendiente')}
          onClose={() => setMostrarPagoForm(false)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}

export default ClienteDetalle