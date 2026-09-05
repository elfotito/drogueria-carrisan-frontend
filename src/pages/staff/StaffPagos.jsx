import { useState, useEffect } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import StaffTabs from '../../components/staff/StaffTabs'
import './StaffFinanzas.css'

function formatUSD(valor) {
  return Number(valor || 0).toFixed(2)
}

function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TABS = [
  { id: 'abonos', texto: 'Abonos' },
  { id: 'reportes', texto: 'Reportes por verificar' },
]

// ------------------------------------------------------------------
// Tab: Abonos (registrar + historial)
// ------------------------------------------------------------------
function TabAbonos() {
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
// Tab: Reportes de pago (cola de verificación)
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
// Página principal: Pagos
// ------------------------------------------------------------------
function StaffPagos() {
  const [tab, setTab] = useState('abonos')

  return (
    <LayoutDepartamento departamento="finanzas" activo="pagos" titulo="Pagos">
      <StaffTabs tabs={TABS} activo={tab} onChange={setTab} />

      <div className="stf-tab-content">
        {tab === 'abonos' && <TabAbonos />}
        {tab === 'reportes' && <TabReportes />}
      </div>
    </LayoutDepartamento>
  )
}

export default StaffPagos