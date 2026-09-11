import { useState, useEffect, useCallback } from 'react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import StaffTabs from '../../components/staff/StaffTabs'
import './StaffFinanzas.css'

function formatUSD(v) { return Number(v || 0).toFixed(2) }
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TIPOS_NOTA = [
  { id: 'llamada', texto: 'Llamada' },
  { id: 'promesa_pago', texto: 'Promesa de pago' },
  { id: 'pago_parcial', texto: 'Pago parcial' },
  { id: 'reclamo', texto: 'Reclamo' },
  { id: 'otro', texto: 'Otro' },
]

const TABS = [
  { id: 'vencidos', texto: 'Vencidos' },
  { id: 'notas', texto: 'Notas de cobranza' },
  { id: 'seguimientos', texto: 'Próximos seguimientos' },
]

function AgingBadge({ monto, label }) {
  if (!monto) return null
  let color = '#16A34A'
  if (label === '31-60') color = '#CA8A04'
  else if (label === '61-90') color = '#EA580C'
  else if (label === '90+') color = '#DC2626'
  return (
    <span className="scr-aging-badge" style={{ background: color + '18', color, borderColor: color }}>
      {label}d: ${formatUSD(monto)}
    </span>
  )
}

function StaffCredito() {
  const [tab, setTab] = useState('vencidos')
  const [aging, setAging] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Detalle de cliente
  const [clienteId, setClienteId] = useState(null)
  const [detalle, setDetalle] = useState(null)

  // Notas
  const [notas, setNotas] = useState([])
  const [formNota, setFormNota] = useState({ usuario_id: '', tipo: 'llamada', nota: '', fecha_seguimiento: '' })
  const [enviandoNota, setEnviandoNota] = useState(false)

  // Recordatorio
  const [formRec, setFormRec] = useState({ usuario_id: '', mensaje: '' })
  const [enviandoRec, setEnviandoRec] = useState(false)

  // Cargar aging
  const cargarAging = useCallback(async () => {
    setCargando(true)
    try {
      const { data } = await staffApi.get('/staff/credito/aging')
      setAging(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }, [])

  // Cargar detalle cliente
  const cargarDetalle = useCallback(async (id) => {
    setClienteId(id)
    setDetalle(null)
    try {
      const { data } = await staffApi.get(`/staff/credito/clientes/${id}`)
      setDetalle(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar detalle')
    }
  }, [])

  // Cargar todas las notas
  const cargarNotas = useCallback(async () => {
    try {
      const { data } = await staffApi.get('/staff/credito/notas')
      setNotas(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar notas')
    }
  }, [])

  useEffect(() => {
    cargarAging()
    cargarNotas()
  }, [cargarAging, cargarNotas])

  // Crear nota
  async function crearNota(e) {
    e.preventDefault()
    if (!formNota.usuario_id || !formNota.nota) return
    setEnviandoNota(true)
    try {
      await staffApi.post('/staff/credito/notas', {
        usuario_id: Number(formNota.usuario_id),
        tipo: formNota.tipo,
        nota: formNota.nota,
        fecha_seguimiento: formNota.fecha_seguimiento || null,
      })
      setFormNota({ usuario_id: '', tipo: 'llamada', nota: '', fecha_seguimiento: '' })
      cargarNotas()
      if (clienteId) cargarDetalle(clienteId)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear nota')
    } finally {
      setEnviandoNota(false)
    }
  }

  // Enviar recordatorio
  async function enviarRecordatorio(e) {
    e.preventDefault()
    if (!formRec.usuario_id || !formRec.mensaje) return
    setEnviandoRec(true)
    try {
      await staffApi.post('/staff/credito/recordatorio', {
        usuario_id: Number(formRec.usuario_id),
        mensaje: formRec.mensaje,
      })
      setFormRec({ usuario_id: '', mensaje: '' })
      alert('Recordatorio enviado')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar recordatorio')
    } finally {
      setEnviandoRec(false)
    }
  }

  // Toggle bloqueo
  async function toggleBloqueo(cliente) {
    const accion = cliente.credito_bloqueado ? 'desbloquear' : 'bloquear'
    const motivo = accion === 'bloquear'
      ? prompt('Motivo del bloqueo (opcional):')
      : null
    if (accion === 'bloquear' && motivo === null) return // cancelado

    try {
      await staffApi.patch(`/staff/credito/bloquear/${cliente.id}`, {
        bloqueado: accion === 'bloquear',
        motivo: motivo || undefined,
      })
      cargarAging()
      if (detalle?.cliente?.id === cliente.id) cargarDetalle(cliente.id)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar bloqueo')
    }
  }

  // --- Vista detalle de cliente ---
  if (clienteId && detalle) {
    return (
      <LayoutDepartamento departamento="finanzas" activo="credito" titulo="Crédito y cobranza">
        <button className="stf-btn stf-btn--ghost" onClick={() => { setClienteId(null); setDetalle(null) }}>
          ← Volver a lista
        </button>

        {error && <p style={{ color: '#DC2626' }}>{error}</p>}

        <div className="scr-detalle-header">
          <h3>{detalle.cliente.nombre}</h3>
          <span>{detalle.cliente.email}</span>
          {detalle.cliente.rif_cedula && <span>RIF/CI: {detalle.cliente.rif_cedula}</span>}
        </div>

        {/* Resumen */}
        <div className="stf-grid-3">
          <div className="stf-stat">
            <span className="stf-stat-label">Línea de crédito</span>
            <span className="stf-stat-valor">${formatUSD(detalle.resumen.linea_credito)}</span>
          </div>
          <div className="stf-stat">
            <span className="stf-stat-label">Deuda total</span>
            <span className="stf-stat-valor" style={{ color: detalle.resumen.deuda_total > 0 ? '#DC2626' : 'inherit' }}>
              ${formatUSD(detalle.resumen.deuda_total)}
            </span>
          </div>
          <div className="stf-stat">
            <span className="stf-stat-label">Saldo disponible</span>
            <span className="stf-stat-valor">${formatUSD(detalle.resumen.saldo)}</span>
          </div>
        </div>

        {/* Bloqueo */}
        <div className="scr-bloqueo-bar">
          <span>
            Estado: {detalle.resumen.credito_bloqueado
              ? <strong style={{ color: '#DC2626' }}>BLOQUEADO</strong>
              : <strong style={{ color: '#16A34A' }}>Activo</strong>
            }
            {detalle.resumen.credito_bloqueado_motivo && ` — ${detalle.resumen.credito_bloqueado_motivo}`}
          </span>
          <button
            className={`stf-btn stf-btn--small ${detalle.resumen.credito_bloqueado ? 'stf-btn--success' : 'stf-btn--danger'}`}
            onClick={() => toggleBloqueo({ id: clienteId, credito_bloqueado: detalle.resumen.credito_bloqueado })}
          >
            {detalle.resumen.credito_bloqueado ? 'Desbloquear crédito' : 'Bloquear crédito'}
          </button>
        </div>

        {/* Aging buckets */}
        <h4 className="stf-subtitulo">Deuda por antigüedad</h4>
        <div className="scr-aging-row">
          <AgingBadge monto={detalle.resumen.buckets['0-30']} label="0-30" />
          <AgingBadge monto={detalle.resumen.buckets['31-60']} label="31-60" />
          <AgingBadge monto={detalle.resumen.buckets['61-90']} label="61-90" />
          <AgingBadge monto={detalle.resumen.buckets['90+']} label="90+" />
        </div>

        {/* Órdenes */}
        <h4 className="stf-subtitulo">Órdenes con deuda</h4>
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Total</th>
                <th>Forma pago</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Días vencida</th>
              </tr>
            </thead>
            <tbody>
              {detalle.ordenes.length === 0 ? (
                <tr><td colSpan="6">Sin órdenes con deuda</td></tr>
              ) : (
                detalle.ordenes.map((o) => (
                  <tr key={o.id} style={{ opacity: o.vencida ? 1 : 0.7 }}>
                    <td>#{o.id}</td>
                    <td>${formatUSD(o.total_usd)}</td>
                    <td>{o.forma_pago}</td>
                    <td>{o.estado}</td>
                    <td>{o.fecha_vencimiento ? formatFecha(o.fecha_vencimiento) : '—'}</td>
                    <td>{o.vencida ? `${o.dias_vencida}d` : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recordatorio */}
        <h4 className="stf-subtitulo">Enviar recordatorio</h4>
        <form className="scr-form-recordatorio" onSubmit={enviarRecordatorio}>
          <input type="hidden" value={clienteId} />
          <textarea
            placeholder="Mensaje para el cliente..."
            value={formRec.mensaje}
            onChange={(e) => setFormRec({ ...formRec, usuario_id: clienteId, mensaje: e.target.value })}
            rows={2}
          />
          <button className="stf-btn stf-btn--primary" disabled={enviandoRec || !formRec.mensaje}>
            {enviandoRec ? 'Enviando...' : 'Enviar recordatorio'}
          </button>
        </form>

        {/* Notas de cobranza */}
        <h4 className="stf-subtitulo">Notas de cobranza</h4>
        <form className="scr-form-nota" onSubmit={crearNota}>
          <select value={formNota.tipo} onChange={(e) => setFormNota({ ...formNota, tipo: e.target.value })}>
            {TIPOS_NOTA.map((t) => <option key={t.id} value={t.id}>{t.texto}</option>)}
          </select>
          <textarea
            placeholder="Nota..."
            value={formNota.nota}
            onChange={(e) => setFormNota({ ...formNota, usuario_id: clienteId, nota: e.target.value })}
            rows={2}
          />
          <input
            type="date"
            value={formNota.fecha_seguimiento}
            onChange={(e) => setFormNota({ ...formNota, fecha_seguimiento: e.target.value })}
            title="Fecha de seguimiento (opcional)"
          />
          <button className="stf-btn stf-btn--primary" disabled={enviandoNota || !formNota.nota}>
            {enviandoNota ? 'Guardando...' : 'Guardar nota'}
          </button>
        </form>

        <div className="scr-notas-lista">
          {detalle.notas.map((n) => (
            <div key={n.id} className="scr-nota-card">
              <div className="scr-nota-header">
                <span className="scr-nota-tipo">{TIPOS_NOTA.find(t => t.id === n.tipo)?.texto || n.tipo}</span>
                <span className="scr-nota-fecha">{formatFecha(n.created_at)}</span>
              </div>
              <p>{n.nota}</p>
              {n.fecha_seguimiento && (
                <span className="scr-nota-seguimiento">Seguimiento: {formatFecha(n.fecha_seguimiento)}</span>
              )}
              {n.staff && <span className="scr-nota-staff">Por: {n.staff.nombre}</span>}
            </div>
          ))}
          {detalle.notas.length === 0 && <p style={{ color: '#6B7280' }}>Sin notas de cobranza</p>}
        </div>
      </LayoutDepartamento>
    )
  }

  // --- Vistas principales (tabs) ---
  return (
    <LayoutDepartamento departamento="finanzas" activo="credito" titulo="Crédito y cobranza">
      <StaffTabs tabs={TABS} activo={tab} onChange={setTab} />

      {error && <p style={{ color: '#DC2626' }}>{error}</p>}

      {/* Tab VENCIDOS — Aging dashboard */}
      {tab === 'vencidos' && (
        <>
          {cargando && <p>Cargando...</p>}
          {!cargando && (
            <div className="stf-tabla-wrap">
              <table className="stf-tabla">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Línea</th>
                    <th>Deuda total</th>
                    <th>Vencida</th>
                    <th>0-30d</th>
                    <th>31-60d</th>
                    <th>61-90d</th>
                    <th>90+d</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {aging.length === 0 ? (
                    <tr><td colSpan="10">No hay clientes con línea de crédito</td></tr>
                  ) : (
                    aging.map((c) => (
                      <tr key={c.id} style={{ opacity: c.deuda_vencida > 0 ? 1 : 0.6 }}>
                        <td>
                          <div className="stf-cliente-cell">
                            <strong>{c.nombre}</strong>
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td>${formatUSD(c.linea_credito)}</td>
                        <td>${formatUSD(c.deuda_total)}</td>
                        <td style={{ color: c.deuda_vencida > 0 ? '#DC2626' : 'inherit', fontWeight: c.deuda_vencida > 0 ? 600 : 400 }}>
                          ${formatUSD(c.deuda_vencida)}
                        </td>
                        <td>{c.buckets['0-30'] > 0 ? `$${formatUSD(c.buckets['0-30'])}` : '—'}</td>
                        <td>{c.buckets['31-60'] > 0 ? `$${formatUSD(c.buckets['31-60'])}` : '—'}</td>
                        <td>{c.buckets['61-90'] > 0 ? `$${formatUSD(c.buckets['61-90'])}` : '—'}</td>
                        <td>{c.buckets['90+'] > 0 ? `$${formatUSD(c.buckets['90+'])}` : '—'}</td>
                        <td>
                          {c.credito_bloqueado
                            ? <span style={{ color: '#DC2626', fontWeight: 600 }}>Bloqueado</span>
                            : <span style={{ color: '#16A34A' }}>Activo</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="stf-btn stf-btn--small" onClick={() => cargarDetalle(c.id)}>Ver</button>
                            <button
                              className={`stf-btn stf-btn--small ${c.credito_bloqueado ? 'stf-btn--success' : 'stf-btn--danger'}`}
                              onClick={() => toggleBloqueo(c)}
                            >
                              {c.credito_bloqueado ? 'Activar' : 'Bloquear'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab NOTAS — Listado global + formulario */}
      {tab === 'notas' && (
        <>
          <form className="scr-form-nota-global" onSubmit={crearNota}>
            <div className="scr-form-row">
              <input
                type="number"
                placeholder="ID cliente"
                value={formNota.usuario_id}
                onChange={(e) => setFormNota({ ...formNota, usuario_id: e.target.value })}
                required
              />
              <select value={formNota.tipo} onChange={(e) => setFormNota({ ...formNota, tipo: e.target.value })}>
                {TIPOS_NOTA.map((t) => <option key={t.id} value={t.id}>{t.texto}</option>)}
              </select>
              <input
                type="date"
                value={formNota.fecha_seguimiento}
                onChange={(e) => setFormNota({ ...formNota, fecha_seguimiento: e.target.value })}
                title="Fecha de seguimiento"
              />
            </div>
            <textarea
              placeholder="Nota de cobranza..."
              value={formNota.nota}
              onChange={(e) => setFormNota({ ...formNota, nota: e.target.value })}
              rows={2}
            />
            <button className="stf-btn stf-btn--primary" disabled={enviandoNota || !formNota.usuario_id || !formNota.nota}>
              {enviandoNota ? 'Guardando...' : 'Guardar nota'}
            </button>
          </form>

          <div className="scr-notas-lista">
            {notas.map((n) => (
              <div key={n.id} className="scr-nota-card" style={{ cursor: 'pointer' }} onClick={() => n.usuario_id && cargarDetalle(n.usuario_id)}>
                <div className="scr-nota-header">
                  <span className="scr-nota-tipo">{TIPOS_NOTA.find(t => t.id === n.tipo)?.texto || n.tipo}</span>
                  <span className="scr-nota-cliente">{n.users?.nombre || `Cliente #${n.usuario_id}`}</span>
                  <span className="scr-nota-fecha">{formatFecha(n.created_at)}</span>
                </div>
                <p>{n.nota}</p>
                {n.fecha_seguimiento && (
                  <span className="scr-nota-seguimiento">Seguimiento: {formatFecha(n.fecha_seguimiento)}</span>
                )}
              </div>
            ))}
            {notas.length === 0 && <p style={{ color: '#6B7280' }}>Sin notas de cobranza</p>}
          </div>
        </>
      )}

      {/* Tab SEGUIMIENTOS — Próximos follow-ups */}
      {tab === 'seguimientos' && (
        <div className="stf-tabla-wrap">
          <table className="stf-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha seguimiento</th>
                <th>Tipo</th>
                <th>Nota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notas
                .filter((n) => n.fecha_seguimiento)
                .sort((a, b) => new Date(a.fecha_seguimiento) - new Date(b.fecha_seguimiento))
                .map((n) => (
                  <tr key={n.id}>
                    <td>{n.users?.nombre || `Cliente #${n.usuario_id}`}</td>
                    <td style={{
                      color: new Date(n.fecha_seguimiento) < new Date() ? '#DC2626' : 'inherit',
                      fontWeight: new Date(n.fecha_seguimiento) < new Date() ? 600 : 400,
                    }}>
                      {formatFecha(n.fecha_seguimiento)}
                    </td>
                    <td>{TIPOS_NOTA.find(t => t.id === n.tipo)?.texto || n.tipo}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.nota}</td>
                    <td>
                      <button className="stf-btn stf-btn--small" onClick={() => cargarDetalle(n.usuario_id)}>Ver cliente</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </LayoutDepartamento>
  )
}

export default StaffCredito