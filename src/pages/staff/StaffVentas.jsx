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

function tipoDocumento(tipo) {
  if (tipo === 'nota_credito') return 'Nota de crédito'
  if (tipo === 'nota_debito') return 'Nota de débito'
  return 'Factura'
}

const TABS = [
  { id: 'facturas', texto: 'Facturas' },
  { id: 'notas', texto: 'Notas de crédito y débito' },
]

// ------------------------------------------------------------------
// Tab: Facturas (emitir + historial + anular)
// ------------------------------------------------------------------
function TabFacturas() {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [anulando, setAnulando] = useState(null)
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

  async function anularFactura(f) {
    if (!window.confirm(`¿Anular la factura #${f.numero_factura}? Se eliminará el registro y no podrá recuperarse.`)) return
    setAnulando(f.id)
    setError('')
    try {
      await staffApi.delete(`/staff/contabilidad/facturas/${f.id}`)
      await cargarFacturas()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo anular la factura')
    } finally {
      setAnulando(null)
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {facturas.length === 0 ? (
                <tr><td colSpan="6">Sin facturas emitidas</td></tr>
              ) : (
                facturas.map((f) => (
                  <tr key={f.id}>
                    <td>{f.users?.nombre || `#${f.usuario_id}`}</td>
                    <td>{f.numero_factura}</td>
                    <td>${formatUSD(f.monto_facturado !== null && f.monto_facturado !== undefined ? f.monto_facturado : f.monto)}</td>
                    <td>{f.estado}</td>
                    <td>{formatFecha(f.created_at)}</td>
                    <td>
                      <button
                        className="stf-btn stf-btn--small stf-btn--danger"
                        onClick={() => anularFactura(f)}
                        disabled={anulando === f.id}
                      >
                        {anulando === f.id ? 'Anulando...' : 'Anular'}
                      </button>
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
// Tab: Notas de crédito y débito
// Requiere la migración 012 (columna `tipo` en facturas).
// ------------------------------------------------------------------
function TabNotas() {
  const [notas, setNotas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [anulando, setAnulando] = useState(null)
  const [nueva, setNueva] = useState({
    usuario_id: '',
    numero_factura: '',
    monto_facturado: '',
    tipo: 'nota_credito',
    factura_referencia_id: '',
    motivo: '',
  })
  const [guardando, setGuardando] = useState(false)

  async function cargarNotas() {
    setCargando(true)
    setError('')
    try {
      const { data } = await staffApi.get('/staff/contabilidad/facturas')
      const filtrarTipo = (f) => f.tipo === 'nota_credito' || f.tipo === 'nota_debito'
      setNotas((data || []).filter(filtrarTipo))
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las notas')
    } finally {
      setCargando(false)
    }
  }

  async function crearNota(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await staffApi.post('/staff/contabilidad/facturas', {
        usuario_id: nueva.usuario_id,
        numero_factura: nueva.numero_factura,
        monto_facturado: Number(nueva.monto_facturado),
        tipo: nueva.tipo,
        factura_referencia_id: nueva.factura_referencia_id ? Number(nueva.factura_referencia_id) : undefined,
        motivo: nueva.motivo || undefined,
      })
      setNueva({
        usuario_id: '',
        numero_factura: '',
        monto_facturado: '',
        tipo: 'nota_credito',
        factura_referencia_id: '',
        motivo: '',
      })
      await cargarNotas()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la nota')
    } finally {
      setGuardando(false)
    }
  }

  async function anularNota(n) {
    if (!window.confirm(`¿Anular la ${tipoDocumento(n.tipo)} #${n.numero_factura}? Se eliminará el registro y no podrá recuperarse.`)) return
    setAnulando(n.id)
    setError('')
    try {
      await staffApi.delete(`/staff/contabilidad/facturas/${n.id}`)
      await cargarNotas()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo anular la nota')
    } finally {
      setAnulando(null)
    }
  }

  useEffect(() => {
    cargarNotas()
  }, [])

  return (
    <div>
      <h3 className="stf-subtitulo">Emitir nota de crédito o débito</h3>
      <form className="stf-form" onSubmit={crearNota}>
        <div className="stf-form-row">
          <input
            className="stf-input"
            placeholder="ID del cliente (usuario)"
            value={nueva.usuario_id}
            onChange={(e) => setNueva({ ...nueva, usuario_id: e.target.value })}
            required
          />
          <select
            className="stf-input"
            value={nueva.tipo}
            onChange={(e) => setNueva({ ...nueva, tipo: e.target.value })}
          >
            <option value="nota_credito">Nota de crédito</option>
            <option value="nota_debito">Nota de débito</option>
          </select>
          <input
            className="stf-input"
            placeholder="N° de la nota"
            value={nueva.numero_factura}
            onChange={(e) => setNueva({ ...nueva, numero_factura: e.target.value })}
            required
          />
          <input
            className="stf-input"
            placeholder="Monto"
            type="number"
            step="0.01"
            value={nueva.monto_facturado}
            onChange={(e) => setNueva({ ...nueva, monto_facturado: e.target.value })}
            required
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <div className="stf-form-row">
            <input
              className="stf-input"
              placeholder="ID de la factura que ajusta (opcional)"
              type="number"
              value={nueva.factura_referencia_id}
              onChange={(e) => setNueva({ ...nueva, factura_referencia_id: e.target.value })}
            />
            <input
              className="stf-input"
              placeholder="Motivo (devolución, ajuste, descuento…)"
              value={nueva.motivo}
              onChange={(e) => setNueva({ ...nueva, motivo: e.target.value })}
            />
            <button className="stf-btn stf-btn--primary" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Emitir nota'}
            </button>
          </div>
        </div>
      </form>

      {error && <p style={{ color: '#DC2626', marginTop: 8 }}>{error}</p>}

      <h3 className="stf-subtitulo">Notas emitidas</h3>
      {cargando && <p>Cargando...</p>}
      {!cargando && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>N°</th>
                <th>Monto</th>
                <th>Factura ref.</th>
                <th>Motivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notas.length === 0 ? (
                <tr><td colSpan="7">Aún no hay notas de crédito o débito.</td></tr>
              ) : (
                notas.map((n) => (
                  <tr key={n.id}>
                    <td>{n.users?.nombre || `#${n.usuario_id}`}</td>
                    <td>{tipoDocumento(n.tipo)}</td>
                    <td>{n.numero_factura}</td>
                    <td>${formatUSD(n.monto_facturado !== null && n.monto_facturado !== undefined ? n.monto_facturado : n.monto)}</td>
                    <td>{n.factura_referencia_id ? `#${n.factura_referencia_id}` : '—'}</td>
                    <td>{n.motivo || '—'}</td>
                    <td>
                      <button
                        className="stf-btn stf-btn--small stf-btn--danger"
                        onClick={() => anularNota(n)}
                        disabled={anulando === n.id}
                      >
                        {anulando === n.id ? 'Anulando...' : 'Anular'}
                      </button>
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
// Página principal: Ventas (facturación)
// ------------------------------------------------------------------
function StaffVentas() {
  const [tab, setTab] = useState('facturas')

  return (
    <LayoutDepartamento departamento="finanzas" activo="ventas" titulo="Ventas y facturación">
      <StaffTabs tabs={TABS} activo={tab} onChange={setTab} />

      <div className="stf-tab-content">
        {tab === 'facturas' && <TabFacturas />}
        {tab === 'notas' && <TabNotas />}
      </div>
    </LayoutDepartamento>
  )
}

export default StaffVentas