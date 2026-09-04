import { useState, useEffect } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import './StaffContabilidad.css'

function formatUSD(valor) {
  return Number(valor || 0).toFixed(2)
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TABS = [
  { id: 'clientes', texto: 'Clientes' },
  { id: 'por-cobrar', texto: 'Por cobrar' },
  { id: 'pagos', texto: 'Pagos' },
  { id: 'facturas', texto: 'Facturas' },
  { id: 'reportes', texto: 'Reportes de pago' },
]

// ------------------------------------------------------------------
// Pestaña: Clientes (resumen + detalle)
// ------------------------------------------------------------------
function TabClientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [clienteActivo, setClienteActivo] = useState(null)
  const [detalle, setDetalle] = useState(null)

  async function cargarClientes() {
    setCargando(true)
    setError('')
    try {
      const { data } = await staffApi.get('/staff/contabilidad/clientes')
      setClientes(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el resumen de clientes')
    } finally {
      setCargando(false)
    }
  }

  async function verDetalle(cliente) {
    setError('')
    setDetalle(null)
    setClienteActivo(cliente)
    try {
      const { data } = await staffApi.get(`/staff/contabilidad/clientes/${cliente.id}`)
      setDetalle(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el estado de cuenta')
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  if (clienteActivo) {
    return (
      <div>
        <button className="stf-btn stf-btn--ghost" onClick={() => { setClienteActivo(null); setDetalle(null) }}>
          ← Volver a clientes
        </button>

        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        {detalle && (
          <>
            <div className="stf-grid-3">
              <div className="stf-stat">
                <span className="stf-stat-label">Línea de crédito</span>
                <span className="stf-stat-valor">${formatUSD(detalle.resumen.linea_credito)}</span>
              </div>
              <div className="stf-stat">
                <span className="stf-stat-label">Deuda actual</span>
                <span className="stf-stat-valor">${formatUSD(detalle.resumen.deuda_actual)}</span>
              </div>
              <div className="stf-stat">
                <span className="stf-stat-label">Saldo disponible</span>
                <span className="stf-stat-valor">${formatUSD(detalle.resumen.saldo)}</span>
              </div>
            </div>

            <h3 className="stf-subtitulo">Órdenes pendientes</h3>
            <div className="stf-tabla-wrap">
              <table className="stf-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Total</th>
                    <th>Forma pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.ordenes_pendientes || []).length === 0 ? (
                    <tr><td colSpan="5">Sin órdenes pendientes</td></tr>
                  ) : (
                    detalle.ordenes_pendientes.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>${formatUSD(o.total_usd)}</td>
                        <td>{o.forma_pago}</td>
                        <td>{o.estado}</td>
                        <td>{formatFecha(o.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="stf-subtitulo">Facturas</h3>
            <div className="stf-tabla-wrap">
              <table className="stf-tabla">
                <thead>
                  <tr>
                    <th>N° Factura</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.facturas || []).length === 0 ? (
                    <tr><td colSpan="4">Sin facturas</td></tr>
                  ) : (
                    detalle.facturas.map((f) => (
                      <tr key={f.id}>
                        <td>{f.numero_factura}</td>
                        <td>${formatUSD(f.monto_facturado !== null && f.monto_facturado !== undefined ? f.monto_facturado : f.monto)}</td>
                        <td>{f.estado}</td>
                        <td>{formatFecha(f.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="stf-subtitulo">Pagos</h3>
            <div className="stf-tabla-wrap">
              <table className="stf-tabla">
                <thead>
                  <tr>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.pagos || []).length === 0 ? (
                    <tr><td colSpan="3">Sin pagos</td></tr>
                  ) : (
                    detalle.pagos.map((p) => (
                      <tr key={p.id}>
                        <td>${formatUSD(p.monto)}</td>
                        <td>{p.tipo}</td>
                        <td>{formatFecha(p.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: '#DC2626' }}>{error}</p>}
      {!cargando && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Línea</th>
                <th>Deuda</th>
                <th>Saldo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan="5">No hay clientes con línea de crédito</td></tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="stf-cliente-cell">
                        <strong>{c.nombre}</strong>
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td>${formatUSD(c.linea_credito)}</td>
                    <td style={{ color: Number(c.deuda_actual) > 0 ? '#DC2626' : 'inherit' }}>${formatUSD(c.deuda_actual)}</td>
                    <td>${formatUSD(c.saldo)}</td>
                    <td>
                      <button className="stf-btn stf-btn--small" onClick={() => verDetalle(c)}>Ver cuenta</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Pestaña: Pagos
// ------------------------------------------------------------------
function TabPagos() {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState({ usuario_id: '', monto: '', tipo: 'abono', detalle: '' })
  const [guardando, setGuardando] = useState(false)

  async function cargarPagos() {
    setCargando(true)
    try {
      const { data } = await staffApi.get('/staff/contabilidad/pagos')
      setPagos(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los pagos')
    } finally {
      setCargando(false)
    }
  }

  async function registrarPago(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await staffApi.post('/staff/contabilidad/pagos', {
        usuario_id: nuevo.usuario_id,
        monto: Number(nuevo.monto),
        tipo: nuevo.tipo,
        detalle: nuevo.detalle || undefined,
      })
      setNuevo({ usuario_id: '', monto: '', tipo: 'abono', detalle: '' })
      await cargarPagos()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el pago')
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    cargarPagos()
  }, [])

  return (
    <div>
      <h3 className="stf-subtitulo">Registrar abono</h3>
      <form className="stf-form" onSubmit={registrarPago}>
        <div className="stf-form-row">
          <input
            className="stf-input"
            placeholder="ID del cliente (usuario)"
            value={nuevo.usuario_id}
            onChange={(e) => setNuevo({ ...nuevo, usuario_id: e.target.value })}
            required
          />
          <input
            className="stf-input"
            placeholder="Monto USD"
            type="number"
            step="0.01"
            value={nuevo.monto}
            onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value })}
            required
          />
          <select className="stf-input" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
            <option value="abono">Abono</option>
            <option value="contado">Contado</option>
            <option value="reporte_cliente">Reporte de cliente</option>
          </select>
          <input
            className="stf-input"
            placeholder="Detalle (opcional)"
            value={nuevo.detalle}
            onChange={(e) => setNuevo({ ...nuevo, detalle: e.target.value })}
          />
          <button className="stf-btn stf-btn--primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </form>

      {error && <p style={{ color: '#DC2626', marginTop: 8 }}>{error}</p>}

      <h3 className="stf-subtitulo">Historial de pagos</h3>
      {cargando && <p>Cargando...</p>}
      {!cargando && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.length === 0 ? (
                <tr><td colSpan="5">Sin pagos registrados</td></tr>
              ) : (
                pagos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.users?.nombre || `#${p.usuario_id}`}</td>
                    <td>${formatUSD(p.monto)}</td>
                    <td>{p.tipo}</td>
                    <td>{p.detalle || '—'}</td>
                    <td>{formatFecha(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Pestaña: Facturas
// ------------------------------------------------------------------
function TabFacturas() {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState({ usuario_id: '', numero_factura: '', monto_facturado: '', nota: '' })
  const [guardando, setGuardando] = useState(false)

  async function cargarFacturas() {
    setCargando(true)
    try {
      const { data } = await staffApi.get('/staff/contabilidad/facturas')
      setFacturas(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las facturas')
    } finally {
      setCargando(false)
    }
  }

  async function crearFactura(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await staffApi.post('/staff/contabilidad/facturas', {
        usuario_id: nueva.usuario_id,
        numero_factura: nueva.numero_factura,
        monto_facturado: Number(nueva.monto_facturado),
        nota: nueva.nota || undefined,
      })
      setNueva({ usuario_id: '', numero_factura: '', monto_facturado: '', nota: '' })
      await cargarFacturas()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la factura')
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    cargarFacturas()
  }, [])

  return (
    <div>
      <h3 className="stf-subtitulo">Emitir factura</h3>
      <form className="stf-form" onSubmit={crearFactura}>
        <div className="stf-form-row">
          <input
            className="stf-input"
            placeholder="ID del cliente (usuario)"
            value={nueva.usuario_id}
            onChange={(e) => setNueva({ ...nueva, usuario_id: e.target.value })}
            required
          />
          <input
            className="stf-input"
            placeholder="N° de factura"
            value={nueva.numero_factura}
            onChange={(e) => setNueva({ ...nueva, numero_factura: e.target.value })}
            required
          />
          <input
            className="stf-input"
            placeholder="Monto facturado"
            type="number"
            step="0.01"
            value={nueva.monto_facturado}
            onChange={(e) => setNueva({ ...nueva, monto_facturado: e.target.value })}
            required
          />
          <input
            className="stf-input"
            placeholder="Nota (opcional)"
            value={nueva.nota}
            onChange={(e) => setNueva({ ...nueva, nota: e.target.value })}
          />
          <button className="stf-btn stf-btn--primary" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Emitir'}
          </button>
        </div>
      </form>

      {error && <p style={{ color: '#DC2626', marginTop: 8 }}>{error}</p>}

      <h3 className="stf-subtitulo">Historial de facturas</h3>
      {cargando && <p>Cargando...</p>}
      {!cargando && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>N°</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {facturas.length === 0 ? (
                <tr><td colSpan="5">Sin facturas emitidas</td></tr>
              ) : (
                facturas.map((f) => (
                  <tr key={f.id}>
                    <td>{f.users?.nombre || `#${f.usuario_id}`}</td>
                    <td>{f.numero_factura}</td>
                    <td>${formatUSD(f.monto_facturado !== null && f.monto_facturado !== undefined ? f.monto_facturado : f.monto)}</td>
                    <td>{f.estado}</td>
                    <td>{formatFecha(f.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Pestaña: Reportes de pago (cola de verificación)
// ------------------------------------------------------------------
function TabReportes() {
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [reporteAbierto, setReporteAbierto] = useState(null)
  const [accion, setAccion] = useState(null) // 'verificar' | 'rechazar'
  const [numeroFactura, setNumeroFactura] = useState('')
  const [notaRechazo, setNotaRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  async function cargarReportes() {
    setCargando(true)
    try {
      const { data } = await staffApi.get('/staff/contabilidad/reportes-pago', {
        params: { estado: 'pendiente_verificacion' },
      })
      setReportes(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los reportes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [])

  function abrirVerificar(r) { setReporteAbierto(r); setAccion('verificar'); setNumeroFactura('') }
  function abrirRechazar(r) { setReporteAbierto(r); setAccion('rechazar'); setNotaRechazo('') }
  function cerrar() { setReporteAbierto(null); setAccion(null); setError('') }

  async function confirmarVerificar() {
    if (!numeroFactura.trim()) { setError('Debes indicar el número de factura'); return }
    setProcesando(true); setError('')
    try {
      await staffApi.patch(`/staff/contabilidad/reportes-pago/${reporteAbierto.id}/verificar`, {
        numero_factura: numeroFactura.trim(),
      })
      cerrar()
      await cargarReportes()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo verificar el pago')
    } finally {
      setProcesando(false)
    }
  }

  async function confirmarRechazar() {
    setProcesando(true); setError('')
    try {
      await staffApi.patch(`/staff/contabilidad/reportes-pago/${reporteAbierto.id}/rechazar`, {
        nota_rechazo: notaRechazo.trim() || undefined,
      })
      cerrar()
      await cargarReportes()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo rechazar el pago')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#DC2626', marginBottom: 8 }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && reportes.length === 0 && <p>No hay reportes de pago pendientes de verificar.</p>}
      {!cargando && reportes.length > 0 && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Órdenes</th>
                <th>Monto USD</th>
                <th>Monto Bs</th>
                <th>Fecha</th>
                <th>Comprobante</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id}>
                  <td>{r.users?.nombre || `#${r.usuario_id}`}</td>
                  <td>{(r.reporte_pago_ordenes || []).map((v) => `#${v.orden_id}`).join(', ')}</td>
                  <td>${formatUSD(r.monto_usd)}</td>
                  <td>Bs. {Number(r.monto_bs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td>{formatFecha(r.created_at)}</td>
                  <td>
                    {r.url_comprobante ? (
                      <a href={r.url_comprobante} target="_blank" rel="noreferrer">Ver</a>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="stf-acciones">
                      <button className="stf-btn stf-btn--small stf-btn--primary" onClick={() => abrirVerificar(r)}>Verificar</button>
                      <button className="stf-btn stf-btn--small stf-btn--danger" onClick={() => abrirRechazar(r)}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reporteAbierto && accion === 'verificar' && (
        <div className="stf-modal" onClick={cerrar}>
          <div className="stf-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Verificar pago #{reporteAbierto.id}</h3>
            <p>Creará la factura y el pago automáticamente, y avanzará la(s) orden(es) a "Preparando".</p>
            <input
              className="stf-input"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              placeholder="Número de factura"
              autoFocus
            />
            {error && <p style={{ color: '#DC2626', marginTop: 8 }}>{error}</p>}
            <div className="stf-acciones" style={{ marginTop: 14 }}>
              <button className="stf-btn" onClick={cerrar} disabled={procesando}>Cancelar</button>
              <button className="stf-btn stf-btn--primary" onClick={confirmarVerificar} disabled={procesando}>
                {procesando ? 'Verificando...' : 'Confirmar y generar factura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reporteAbierto && accion === 'rechazar' && (
        <div className="stf-modal" onClick={cerrar}>
          <div className="stf-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rechazar pago #{reporteAbierto.id}</h3>
            <textarea
              className="stf-input"
              value={notaRechazo}
              onChange={(e) => setNotaRechazo(e.target.value)}
              placeholder="Motivo (opcional)"
              rows={3}
            />
            {error && <p style={{ color: '#DC2626', marginTop: 8 }}>{error}</p>}
            <div className="stf-acciones" style={{ marginTop: 14 }}>
              <button className="stf-btn" onClick={cerrar} disabled={procesando}>Cancelar</button>
              <button className="stf-btn stf-btn--danger" onClick={confirmarRechazar} disabled={procesando}>
                {procesando ? 'Rechazando...' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Pestaña: Por cobrar (órdenes contado en 'procesando')
// ------------------------------------------------------------------
function TabPorCobrar() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(null)

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      const { data } = await staffApi.get('/staff/contabilidad/ordenes-procesando')
      setOrdenes(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las órdenes por cobrar')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cancelar(orden) {
    if (!window.confirm(`¿Cancelar la orden #${orden.id} de ${orden.users?.nombre || 'cliente'}? El cliente ya no podrá pagarla.`)) return
    setProcesando(orden.id)
    try {
      await staffApi.patch(`/staff/contabilidad/ordenes/${orden.id}/cancelar`)
      await cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cancelar la orden')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#DC2626', marginBottom: 8 }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && ordenes.length === 0 && <p>No hay órdenes contado pendientes de pago.</p>}
      {!cargando && ordenes.length > 0 && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total USD</th>
                <th>Estado pago</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.users?.nombre || `#${o.usuario_id}`}</td>
                  <td>${formatUSD(o.total_usd)}</td>
                  <td>{o.estado_pago === 'reportado' ? 'Pago reportado' : 'Esperando pago'}</td>
                  <td>{formatFecha(o.created_at)}</td>
                  <td>
                    <button
                      className="stf-btn stf-btn--small stf-btn--danger"
                      onClick={() => cancelar(o)}
                      disabled={procesando === o.id}
                    >
                      {procesando === o.id ? 'Cancelando...' : 'Cancelar pedido'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------
// Página principal de contabilidad (sub-pestañas)
// ------------------------------------------------------------------
function StaffContabilidad() {
  const [tab, setTab] = useState('clientes')

  return (
    <LayoutDepartamento departamento="finanzas" activo="contabilidad" titulo="Estado de cuenta, pagos y facturas">
      <div className="stf-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`stf-tab ${tab === t.id ? 'stf-tab--activo' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.texto}
          </button>
        ))}
      </div>

      <div className="stf-tab-content">
        {tab === 'clientes' && <TabClientes />}
        {tab === 'por-cobrar' && <TabPorCobrar />}
        {tab === 'pagos' && <TabPagos />}
        {tab === 'facturas' && <TabFacturas />}
        {tab === 'reportes' && <TabReportes />}
      </div>
    </LayoutDepartamento>
  )
}

export default StaffContabilidad
