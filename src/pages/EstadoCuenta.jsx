import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  Wallet, FileText, DollarSign, Eye, Download, Upload, X, Loader2,
  AlertCircle, CreditCard, Menu, Search, FileBarChart, TrendingUp,
  MessageCircle, Send, Plus, Package,
} from 'lucide-react'
import OrdenClienteModal from '../components/OrdenClienteModal'
import PagoClienteModal from '../components/PagoClienteModal'
import BottomNav from '../components/BottomNav'
import './EstadoCuenta.css'

function formatearMonto(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
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

// Contenido del menú lateral — mismo array alimenta el drawer móvil Y el sidebar fijo de desktop
function useMenuItems(navigate, cerrar) {
  return [
    { icono: DollarSign, label: 'Historial de pagos', ruta: '/estado-cuenta/pagos' },
    { icono: FileText, label: 'Historial de facturas', ruta: '/estado-cuenta/facturas' },
    { icono: FileBarChart, label: 'Reportes', ruta: '/estado-cuenta/reportes' },
    { icono: TrendingUp, label: 'Solicitar ampliación', ruta: '/estado-cuenta/ampliacion' },
    { icono: MessageCircle, label: 'Contacto directo', ruta: null },
  ].map((item) => ({
    ...item,
    onClick: () => {
      cerrar()
      if (item.ruta) navigate(item.ruta)
    },
  }))
}

export default function EstadoCuenta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [comparativa, setComparativa] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  const menuItems = useMenuItems(navigate, () => setMenuAbierto(false))

  useEffect(() => {
    cargarEstadoCuenta()
    api.get(`/clientes/${user.id}/estado-cuenta/comparativa`)
      .then(({ data }) => setComparativa(data))
      .catch(() => {})
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

  async function exportarEstadoCompletoPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Droguería Carrisan', 14, 20)
    doc.setFontSize(11)
    doc.text(`Cliente: ${datos.cliente?.nombre || ''}`, 14, 30)
    doc.text(`Línea de crédito: ${formatearMonto(datos.resumen.linea_credito)}`, 14, 40)
    doc.text(`Deuda actual: ${formatearMonto(datos.resumen.deuda_actual)}`, 14, 48)
    doc.text(`Disponible: ${formatearMonto(datos.resumen.saldo)}`, 14, 56)
    doc.save('estado-de-cuenta.pdf')
  }

  async function reportarPago(formData) {
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
      if (filtro === 'ordenes' && mov.tipo !== 'orden_pendiente') return false
      if (busqueda.trim()) {
        const termino = busqueda.trim().toLowerCase()
        const idTexto = `${mov.numero_factura || mov.id}`
        const montoTexto = `${mov.monto_facturado || mov.monto || mov.total_usd}`
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
      <div className="ec-estado-cargando">
        <Loader2 className="ec-spinner" size={28} />
        <p>Cargando estado de cuenta…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ec-estado-error">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    )
  }

  if (!datos) return null

  const { resumen } = datos
  const porcentajeUsado = resumen.linea_credito > 0
    ? Math.min((resumen.deuda_actual / resumen.linea_credito) * 100, 100)
    : 0

  return (
    <div className="ec-shell">
      {/* Sidebar — drawer en móvil, fijo desde md */}
      <aside className={`ec-sidebar ${menuAbierto ? 'ec-sidebar--abierto' : ''}`}>
        <div className="ec-sidebar__brand">
          <Wallet size={22} />
          <span>Estado de Cuenta</span>
        </div>

        <button className="ec-sidebar__close" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
          <X size={20} />
        </button>

        <nav className="ec-sidebar__nav">
          {menuItems.map((item) => (
            <button key={item.label} className="ec-sidebar__item" onClick={item.onClick}>
              <item.icono size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {menuAbierto && <div className="ec-sidebar-overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="ec-main">
        {/* Header */}
        <header className="ec-topbar">
          <button className="ec-menu-btn" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
            <Menu size={20} />
          </button>
          <h1 className="ec-topbar__titulo">Estado de cuenta</h1>
          <button className="ec-topbar__exportar" onClick={exportarEstadoCompletoPDF} aria-label="Exportar todo">
            <Download size={18} />
            <span className="ec-topbar__exportar-label">Exportar</span>
          </button>
        </header>

        <div className="ec-content">
          {/* Panel de saldo — hero en desktop, card compacta en móvil */}
          <section className="ec-hero">
            <div className="ec-hero__principal">
              <span className="ec-hero__label">Disponible</span>
              <strong className={`ec-hero__monto ${resumen.saldo < 0 ? 'ec-hero__monto--negativo' : ''}`}>
                {formatearMonto(resumen.saldo)}
              </strong>

              {resumen.linea_credito > 0 && (
                <>
                  <div className="ec-hero__barra">
                    <div
                      className="ec-hero__progreso"
                      style={{
                        width: `${porcentajeUsado}%`,
                        background: porcentajeUsado > 90 ? 'var(--ec-negativo)' : porcentajeUsado > 60 ? 'var(--ec-warning)' : 'var(--ec-accent)'
                      }}
                    />
                  </div>
                  <div className="ec-hero__leyenda">
                    <span>Deuda: {formatearMonto(resumen.deuda_actual)}</span>
                    <span>Línea: {formatearMonto(resumen.linea_credito)}</span>
                  </div>
                </>
              )}
            </div>

            {comparativa && (
              <div className="ec-hero__comparativa">
                <div className="ec-comp-item">
                  <span>Este mes</span>
                  <strong>{formatearMonto(comparativa.mes_actual)}</strong>
                </div>
                <div className="ec-comp-divider" />
                <div className="ec-comp-item">
                  <span>Mes pasado</span>
                  <strong>{formatearMonto(comparativa.mes_pasado)}</strong>
                </div>
                {comparativa.variacion_porcentaje !== null && (
                  <span className={`ec-comp-badge ${comparativa.variacion_porcentaje >= 0 ? 'ec-comp-badge--sube' : 'ec-comp-badge--baja'}`}>
                    {comparativa.variacion_porcentaje >= 0 ? '↑' : '↓'} {Math.abs(comparativa.variacion_porcentaje).toFixed(0)}%
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Accesos rápidos */}
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

          {/* Movimientos */}
          <section className="ec-movimientos">
            <div className="ec-movimientos__toolbar">
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
                  { key: 'todos', label: 'Todos' },
                  { key: 'ordenes', label: 'Por pagar' },
                  { key: 'facturas', label: 'Facturas' },
                  { key: 'pagos', label: 'Pagos' },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`ec-filtros__pill ${filtro === f.key ? 'ec-filtros__pill--activo' : ''}`}
                    onClick={() => setFiltro(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {Object.keys(gruposPorFecha).length === 0 ? (
              <p className="ec-movimientos__vacio">No hay movimientos que coincidan</p>
            ) : (
              Object.entries(gruposPorFecha).map(([fechaLabel, movimientos]) => (
                <div key={fechaLabel} className="ec-grupo-fecha">
                  <p className="ec-grupo-fecha__titulo">{fechaLabel}</p>
                  <ul className="ec-movimientos__lista">
                    {movimientos.map((mov) => (
                      <li
                        key={`${mov.tipo}-${mov.id}`}
                        className="ec-movimiento"
                        onClick={() => {
                          if (mov.tipo === 'pago') setPagoSeleccionado(mov)
                          else if (mov.tipo === 'orden_pendiente') setOrdenSeleccionada(mov)
                        }}
                      >
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
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      {ordenSeleccionada && <OrdenClienteModal orden={ordenSeleccionada} onClose={() => setOrdenSeleccionada(null)} />}
      {pagoSeleccionado && <PagoClienteModal pago={pagoSeleccionado} onClose={() => setPagoSeleccionado(null)} />}
      {modalPagoAbierto && <ModalReportarPago onCerrar={() => setModalPagoAbierto(false)} onEnviar={reportarPago} />}

      <BottomNav />
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
            <input type="number" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} required />
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
            <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} required />
          </label>
          <label>
            Fecha del pago
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>
          <label>
            Comprobante (opcional)
            <div className="ec-modal__upload">
              <Upload size={16} />
              <span>{comprobante ? comprobante.name : 'Subir imagen o PDF'}</span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
            </div>
          </label>
          {error && <p className="ec-modal__error"><AlertCircle size={14} /> {error}</p>}
        </div>
        <div className="ec-modal__pie">
          <button type="button" className="ec-btn ec-btn--secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="ec-btn ec-btn--primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}