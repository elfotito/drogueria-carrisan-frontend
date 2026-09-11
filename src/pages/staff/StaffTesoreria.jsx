// StaffTesoreria.jsx
import { useState, useEffect } from 'react'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import StaffTabs from '../../components/staff/StaffTabs'
import staffApi from '../../api/staffAxios'
import './StaffFinanzas.css'
import './StaffTesoreria.css'

const CATEGORIAS_EGRESO = ['Proveedores', 'Nómina', 'Servicios', 'Mantenimiento', 'Impuestos', 'Otro']

const TABS = [
  { id: 'resumen', texto: 'Resumen' },
  { id: 'egresos', texto: 'Registrar egreso' },
]

function formatUSD(n) {
  return `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function primerDiaDelMes() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export default function StaffTesoreria() {
  const [tab, setTab] = useState('resumen')
  const [desde, setDesde] = useState(primerDiaDelMes)
  const [hasta, setHasta] = useState(hoy)
  const [resumen, setResumen] = useState(null)
  const [egresos, setEgresos] = useState([])
  const [form, setForm] = useState({ categoria: 'Proveedores', concepto: '', monto: '', fecha: hoy() })
  const [cargando, setCargando] = useState(false)

  const cargarResumen = async () => {
    try {
      setCargando(true)
      const [resumenRes, movRes] = await Promise.all([
        staffApi.get('/staff/tesoreria/resumen', { params: { desde, hasta } }),
        staffApi.get('/staff/tesoreria/movimientos', { params: { desde, hasta } }),
      ])
      setResumen(resumenRes.data)
      setEgresos(movRes.data.filter((m) => m.tipo === 'egreso'))
    } catch (e) {
      console.error('Error cargando tesorería:', e)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarResumen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta])

  const crearEgreso = async (e) => {
    e.preventDefault()
    if (!form.concepto.trim() || !form.monto || Number(form.monto) <= 0) return
    try {
      await staffApi.post('/staff/tesoreria/egresos', {
        categoria: form.categoria,
        concepto: form.concepto.trim(),
        monto: Number(form.monto),
        fecha: form.fecha,
      })
      setForm({ categoria: 'Proveedores', concepto: '', monto: '', fecha: hoy() })
      await cargarResumen()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear egreso')
    }
  }

  const eliminarEgreso = async (id) => {
    if (!window.confirm('¿Eliminar este egreso?')) return
    try {
      await staffApi.delete(`/staff/tesoreria/egresos/${id}`)
      await cargarResumen()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <LayoutDepartamento departamento="finanzas" activo="tesoreria" titulo="Tesorería">
      <h3 className="stf-subtitulo">Flujo de caja del período</h3>

      <StaffTabs tabs={TABS} activo={tab} onChange={setTab} />

      {tab === 'resumen' && (
        <div style={{ marginTop: 16 }}>
          <div className="st-filtros-fecha">
            <label>
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label>
              Hasta
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
          </div>

          {cargando && <p style={{ color: '#6b7280' }}>Cargando...</p>}

          {resumen && (
            <>
              <div className="st-resumen-cards">
                <div className="st-resumen-card">
                  <div className="st-resumen-card__label">Ingresos (pagos)</div>
                  <div className="st-resumen-card__valor">{formatUSD(resumen.ingresos)}</div>
                </div>
                <div className="st-resumen-card">
                  <div className="st-resumen-card__label">Egresos manuales</div>
                  <div className="st-resumen-card__valor" style={{ color: '#dc2626' }}>{formatUSD(resumen.egresos)}</div>
                </div>
                <div className="st-resumen-card">
                  <div className="st-resumen-card__label">Saldo del período</div>
                  <div className={`st-resumen-card__valor ${resumen.saldo < 0 ? 'st-resumen-card__valor--negativo' : ''}`}>
                    {formatUSD(resumen.saldo)}
                  </div>
                </div>
              </div>

              {resumen.movimientos_por_dia.length > 0 && (
                <table className="st-tabla-dia">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'right' }}>Ingresos</th>
                      <th style={{ textAlign: 'right' }}>Egresos</th>
                      <th style={{ textAlign: 'right' }}>Saldo del día</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.movimientos_por_dia.map((d) => (
                      <tr key={d.fecha}>
                        <td>{new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-VE')}</td>
                        <td style={{ textAlign: 'right' }} className="st-saldo-positivo">{formatUSD(d.ingresos)}</td>
                        <td style={{ textAlign: 'right' }} className="st-saldo-negativo">{formatUSD(d.egresos)}</td>
                        <td style={{ textAlign: 'right' }} className={d.saldo >= 0 ? 'st-saldo-positivo' : 'st-saldo-negativo'}>
                          {formatUSD(d.saldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {resumen.movimientos_por_dia.length === 0 && !cargando && (
                <p style={{ color: '#6b7280', marginTop: 16 }}>No hay movimientos en este período.</p>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'egresos' && (
        <div style={{ marginTop: 16 }}>
          <form className="st-form-egreso" onSubmit={crearEgreso}>
            <label>
              Categoría
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS_EGRESO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Concepto
              <input
                type="text"
                placeholder="Descripción del gasto..."
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                required
              />
            </label>
            <label>
              Monto ($)
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </label>
            <button type="submit" className="stf-btn stf-btn--primary">
              Registrar egreso
            </button>
          </form>

          <h4 className="stf-subtitulo" style={{ fontSize: 14 }}>Egresos del período</h4>

          {egresos.length === 0 && (
            <p style={{ color: '#6b7280' }}>No hay egresos registrados en este período.</p>
          )}

          {egresos.map((e) => (
            <div key={e.id} className="st-egreso-item">
              <div className="st-egreso-item__datos">
                <div className="st-egreso-item__categoria">{e.categoria}</div>
                <div className="st-egreso-item__concepto">{e.concepto}</div>
                <div className="st-egreso-item__fecha">
                  {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-VE')}
                </div>
              </div>
              <div className="st-egreso-item__monto">−{formatUSD(e.monto)}</div>
              <button className="st-egreso-item__borrar" onClick={() => eliminarEgreso(e.id)} title="Eliminar">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </LayoutDepartamento>
  )
}