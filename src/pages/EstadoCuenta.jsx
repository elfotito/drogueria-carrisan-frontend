import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  FileText, DollarSign, Eye, Download, Upload, X, Loader2,
  AlertCircle, CreditCard, Menu, Search, FileBarChart, TrendingUp,
  MessageCircle, Send, Plus, Package
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import './EstadoCuenta.css'

function formatearMonto(valor) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function claveGrupoFecha(fecha) {
  const hoy = new Date()
  const d = new Date(fecha)
  const esMismoDia = (a, b) => a.toDateString() === b.toDateString()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  if (esMismoDia(d, hoy)) return 'Hoy'
  if (esMismoDia(d, ayer)) return 'Ayer'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function EstadoCuenta() {
  const { user } = useAuth()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'facturas' | 'pagos'
  const [busqueda, setBusqueda] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    cargarEstadoCuenta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarEstadoCuenta() {
    setCargando(true)
    try {
      const { data } = await api.get(`/clientes/${user.id}/estado-cuenta`)
      setDatos(data)
      setError('')
    } catch (err) {
      setError('No se pudo cargar el estado de cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  async function exportarFacturaPDF(factura) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Droguería Carrisan', 14, 20)
    doc.setFontSize(11)
    doc.text(`Factura #${factura.numero_factura}`, 14, 32)
    doc.text(`Fecha: ${formatearFecha(factura.created_at)}`, 14, 40)
    doc.text(`Estado: ${factura.estado || 'pendiente'}`, 14, 48)
    doc.text(`Monto: ${formatearMonto(factura.monto_facturado)}`, 14, 56)
    if (datos?.cliente?.nombre) doc.text(`Cliente: ${datos.cliente.nombre}`, 14, 64)
    doc.save(`factura-${factura.numero_factura}.pdf`)
  }

  async function exportarEstadoCompletoPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Estado de Cuenta', 14, 20)
    doc.setFontSize(11)
    doc.text(`Cliente: ${datos.cliente?.nombre || ''}`, 14, 30)
    doc.text(`Línea de crédito: ${formatearMonto(datos.resumen.linea_credito)}`, 14, 40)
    doc.text(`Deuda actual: ${formatearMonto(datos.resumen.deuda_actual)}`, 14, 48)
    doc.text(`Disponible: ${formatearMonto(datos.resumen.saldo)}`, 14, 56)

    let y = 70
    doc.setFontSize(12)
    doc.text('Historial:', 14, y)
    y += 8
    doc.setFontSize(10)
    historial.forEach((mov) => {
      const linea = `${mov.tipo === 'factura' ? 'Factura' : mov.tipo === 'pago' ? 'Pago' : 'Orden'} #${mov.tipo === 'factura' ? mov.numero_factura : mov.id} — ${formatearMonto(mov.monto_facturado || mov.monto)} — ${formatearFecha(mov.created_at)}`
      doc.text(linea, 14, y)
      y += 7
      if (y > 280) { doc.addPage(); y = 20 }
    })
    doc.save('estado-de-cuenta.pdf')
  }

  async function reportarPago(formData) {
    // TODO backend: crear endpoint POST /clientes/:id/pagos/reportar que reciba
    // monto, referencia, metodo, fecha y comprobante (multipart/form-data), y marque
    // el pago como "pendiente de verificación" hasta que un administrador lo confirme.
    await api.post(`/clientes/${user.id}/pagos/reportar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await cargarEstadoCuenta()
  }

  const historial = useMemo(() => {
    if (!datos) return []
    return [
      ...datos.ordenes_pendientes.map(o => ({ ...o, tipo: 'orden_pendiente' })),
      ...datos.facturas.map(f => ({ ...f, tipo: 'factura' })),
      ...datos.pagos.map(p => ({ ...p, tipo: 'pago' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [datos])

  const historialFiltrado = useMemo(() => {
    return historial.filter((mov) => {
      if (filtro === 'facturas' && mov.tipo !== 'factura') return false
      if (filtro === 'pagos' && mov.tipo !== 'pago') return false
      if (busqueda.trim()) {
        const termino = busqueda.trim().toLowerCase()
        const idTexto = mov.tipo === 'factura' ? `${mov.numero_factura}` : `${mov.id}`
        const montoTexto = `${mov.monto_facturado || mov.monto}`
        return idTexto.toLowerCase().includes(termino) || montoTexto.includes(termino)
      }
      return true
    })
  }, [historial, filtro, busqueda])

  const gruposPorFecha = useMemo(() => {
    const grupos = {}
    historialFiltrado.forEach((mov) => {
      const clave = claveGrupoFecha(mov.created_at)
      if (!grupos[clave]) grupos[clave] = []
      grupos[clave].push(mov)
    })
    return grupos
  }, [historialFiltrado])

  if (cargando) {
    return (
      <div className="estado-cuenta__cargando">
        <Loader2 className="estado-cuenta__spinner" size={28} />
        <p>Cargando estado de cuenta…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="estado-cuenta__error">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    )
  }

  if (!datos) return null

  const { resumen, facturas, pagos } = datos
  const disponible = resumen.saldo
  const porcentajeUsado = resumen.linea_credito > 0
    ? Math.min((resumen.deuda_actual / resumen.linea_credito) * 100, 100)
    : 0

  return (
    <div className="ec-container">
      {/* Header */}
      <header className="ec-header">
        <button className="ec-menu-btn" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <h1 className="ec-header__titulo">Estado de cuenta</h1>
        <button className="ec-header__exportar" onClick={exportarEstadoCompletoPDF} aria-label="Exportar todo">
          <Download size={20} />
        </button>
      </header>

      {/* Drawer lateral */}
      <nav className={`ec-drawer ${menuAbierto ? 'ec-drawer--abierto' : ''}`}>
        <div className="ec-drawer__header">
          <h3>Estado de cuenta</h3>
          <button className="ec-drawer__cerrar" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>
        <ul className="ec-drawer__lista">
          <li>
            <button className="ec-drawer__item" onClick={() => setMenuAbierto(false)}>
              <FileBarChart size={20} />
              <span>Reportes</span>
            </button>
          </li>
          <li>
            <button className="ec-drawer__item" onClick={() => setMenuAbierto(false)}>
              <TrendingUp size={20} />
              <span>Solicitar ampliación de línea</span>
            </button>
          </li>
          <li>
            <button className="ec-drawer__item" onClick={() => setMenuAbierto(false)}>
              <MessageCircle size={20} />
              <span>Contacto directo</span>
            </button>
          </li>
        </ul>
      </nav>
      {menuAbierto && <div className="ec-drawer-overlay" onClick={() => setMenuAbierto(false)} />}

      {/* Tarjeta de saldo grande */}
      <section className="ec-balance">
        <span className="ec-balance__label">Disponible</span>
        <strong className={`ec-balance__monto ${disponible < 0 ? 'ec-balance__monto--negativo' : ''}`}>
          {formatearMonto(disponible)}
        </strong>

        {resumen.linea_credito > 0 && (
          <>
            <div className="ec-balance__barra">
              <div
                className="ec-balance__progreso"
                style={{
                  width: `${porcentajeUsado}%`,
                  background: porcentajeUsado > 90
                    ? 'var(--ec-negativo)'
                    : porcentajeUsado > 60
                      ? 'var(--ec-warning)'
                      : 'var(--ec-brand)'
                }}
              />
            </div>
            <div className="ec-balance__leyenda">
              <span>Deuda: {formatearMonto(resumen.deuda_actual)}</span>
              <span>Línea: {formatearMonto(resumen.linea_credito)}</span>
            </div>
          </>
        )}
      </section>

      {/* Accesos rápidos (placeholders) */}
      <section className="ec-accesos">
        <button className="ec-acceso" onClick={() => setModalPagoAbierto(true)}>
          <div className="ec-acceso__icono"><Send size={20} /></div>
          <span>Reportar pago</span>
        </button>
        <button className="ec-acceso">
          <div className="ec-acceso__icono"><Plus size={20} /></div>
          <span>Acción</span>
        </button>
        <button className="ec-acceso">
          <div className="ec-acceso__icono"><CreditCard size={20} /></div>
          <span>Acción</span>
        </button>
      </section>

      {/* Buscador + filtros */}
      <section className="ec-movimientos">
        <div className="ec-buscador">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar transacción (# o monto)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="ec-filtros">
          {[
            { key: 'todos', label: 'Todos', total: historial.length },
            { key: 'facturas', label: 'Facturas', total: facturas.length },
            { key: 'pagos', label: 'Pagos', total: pagos.length },
          ].map((f) => (
            <button
              key={f.key}
              className={`ec-filtros__pill ${filtro === f.key ? 'ec-filtros__pill--activo' : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label} <span>{f.total}</span>
            </button>
          ))}
        </div>

        {/* Lista agrupada por fecha */}
        {Object.keys(gruposPorFecha).length === 0 ? (
          <p className="ec-movimientos__vacio">No hay movimientos que coincidan</p>
        ) : (
          Object.entries(gruposPorFecha).map(([fechaLabel, movimientos]) => (
            <div key={fechaLabel} className="ec-grupo-fecha">
              <p className="ec-grupo-fecha__titulo">{fechaLabel}</p>
              <ul className="ec-movimientos__lista">
                {movimientos.map((mov) => (
                  <li key={`${mov.tipo}-${mov.id}`} className="ec-movimiento">
                    <div className={`ec-movimiento__icono ec-movimiento__icono--${mov.tipo === 'factura' ? 'factura' : mov.tipo === 'pago' ? 'pago' : 'orden'}`}>
                      {mov.tipo === 'factura' ? <FileText size={18} /> : mov.tipo === 'pago' ? <DollarSign size={18} /> : <Package size={18} />}
                    </div>
                    
                    <div className="ec-movimiento__info">
                      <span className="ec-movimiento__titulo">
                        {mov.tipo === 'factura' ? `Factura #${mov.numero_factura}` : mov.tipo === 'pago' ? `Pago #${mov.id}` : `Orden #${mov.id}`}
                      </span>
                      <span className={`ec-badge ec-badge--${mov.tipo === 'orden_pendiente' ? 'pendiente' : (mov.estado || 'registrado')}`}>
                        {mov.tipo === 'orden_pendiente' ? 'por pagar' : (mov.estado || 'registrado')}
                      </span>
                    </div>
                    
                    <strong className={`ec-movimiento__monto ${mov.tipo === 'pago' ? 'ec-movimiento__monto--verde' : 'ec-movimiento__monto--rojo'}`}>
                      {mov.tipo === 'pago' ? '+' : '-'}{formatearMonto(mov.monto_facturado || mov.monto || mov.total_usd)}
                    </strong>
                    
                    {mov.tipo === 'factura' && (
                      <div className="ec-movimiento__acciones">
                        <button title="Ver orden" onClick={() => setOrdenSeleccionada(mov)}>
                          <Eye size={16} />
                        </button>
                        <button title="Exportar PDF" onClick={() => exportarFacturaPDF(mov)}>
                          <Download size={16} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {ordenSeleccionada && (
        <ModalOrden orden={ordenSeleccionada} onCerrar={() => setOrdenSeleccionada(null)} />
      )}

      {modalPagoAbierto && (
        <ModalReportarPago onCerrar={() => setModalPagoAbierto(false)} onEnviar={reportarPago} />
      )}

      <BottomNav />
    </div>
  )
}

function ModalOrden({ orden, onCerrar }) {
  return (
    <div className="ec-modal-fondo" onClick={onCerrar}>
      <div className="ec-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal__encabezado">
          <h3>Factura #{orden.numero_factura}</h3>
          <button onClick={onCerrar}><X size={20} /></button>
        </div>
        <div className="ec-modal__cuerpo">
          <p><strong>Fecha:</strong> {formatearFecha(orden.created_at)}</p>
          <p><strong>Estado:</strong> {orden.estado || 'pendiente'}</p>
          <p><strong>Monto:</strong> {formatearMonto(orden.monto_facturado)}</p>

          {orden.items?.length > 0 && (
            <>
              <h4>Productos</h4>
              <ul className="ec-modal__items">
                {orden.items.map((item, i) => (
                  <li key={i}>
                    <span>{item.nombre} × {item.cantidad}</span>
                    <span>{formatearMonto(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalReportarPago({ onCerrar, onEnviar }) {
  const [monto, setMonto] = useState('')
  const [referencia, setReferencia] = useState('')
  const [metodo, setMetodo] = useState('transferencia')
  const [fecha, setFecha] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function manejarEnvio(e) {
    e.preventDefault()
    if (!monto || !referencia || !fecha) {
      setError('Completa monto, referencia y fecha')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('monto', monto)
      formData.append('referencia', referencia)
      formData.append('metodo', metodo)
      formData.append('fecha', fecha)
      if (comprobante) formData.append('comprobante', comprobante)
      await onEnviar(formData)
      onCerrar()
    } catch {
      setError('No se pudo enviar el reporte de pago. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="ec-modal-fondo" onClick={onCerrar}>
      <form className="ec-modal" onClick={(e) => e.stopPropagation()} onSubmit={manejarEnvio}>
        <div className="ec-modal__encabezado">
          <h3>Reportar pago</h3>
          <button type="button" onClick={onCerrar}><X size={20} /></button>
        </div>
        <div className="ec-modal__cuerpo ec-modal__cuerpo--form">
          <label>
            Monto pagado
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={monto} 
              onChange={(e) => setMonto(e.target.value)} 
              required 
            />
          </label>
          <label>
            Método de pago
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="transferencia">Transferencia</option>
              <option value="pago_movil">Pago móvil</option>
              <option value="zelle">Zelle</option>
              <option value="efectivo">Efectivo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label>
            Número de referencia
            <input 
              type="text" 
              value={referencia} 
              onChange={(e) => setReferencia(e.target.value)} 
              required 
            />
          </label>
          <label>
            Fecha del pago
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              required 
            />
          </label>
          <label>
            Comprobante (opcional)
            <div className="ec-modal__upload">
              <Upload size={16} />
              <span>{comprobante ? comprobante.name : 'Subir imagen o PDF'}</span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={(e) => setComprobante(e.target.files?.[0] || null)} 
              />
            </div>
          </label>
          {error && (
            <p className="ec-modal__error">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>
        <div className="ec-modal__pie">
          <button type="button" className="ec-btn ec-btn--secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="ec-btn ec-btn--primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}