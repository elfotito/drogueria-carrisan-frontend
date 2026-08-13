import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  Wallet, TrendingDown, CheckCircle2, FileText, DollarSign,
  Eye, Download, Upload, X, Loader2, AlertCircle, CreditCard
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import './EstadoCuenta.css'


function formatearMonto(valor) {
  return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EstadoCuenta() {
  const { user } = useAuth()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'facturas' | 'pagos'
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)

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
    doc.text(`Saldo disponible: ${formatearMonto(datos.resumen.saldo)}`, 14, 56)
    let y = 70
    doc.setFontSize(12)
    doc.text('Historial:', 14, y)
    y += 8
    doc.setFontSize(10)
    historial.forEach((mov) => {
      const linea = `${mov.tipo === 'factura' ? 'Factura' : 'Pago'} #${mov.tipo === 'factura' ? mov.numero_factura : mov.id} — ${formatearMonto(mov.monto_facturado || mov.monto)} — ${formatearFecha(mov.created_at)}`
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

  const { cliente, resumen, facturas, pagos } = datos
  const porcentajeUsado = resumen.linea_credito > 0
    ? Math.min((resumen.deuda_actual / resumen.linea_credito) * 100, 100)
    : 0

  const historial = [
    ...facturas.map(f => ({ ...f, tipo: 'factura' })),
    ...pagos.map(p => ({ ...p, tipo: 'pago' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const historialFiltrado = historial.filter(mov => {
    if (filtro === 'facturas') return mov.tipo === 'factura'
    if (filtro === 'pagos') return mov.tipo === 'pago'
    return true
  })

  return (
    <div className="estado-cuenta">
      <header className="estado-cuenta__header">
        <div>
          <h1>Estado de cuenta</h1>
          {cliente?.nombre && <p className="estado-cuenta__subtitulo">{cliente.nombre}</p>}
        </div>
        <button className="btn btn--secundario" onClick={exportarEstadoCompletoPDF}>
          <Download size={16} /> Exportar todo
        </button>
      </header>

      <div className="estado-cuenta__resumen">
        <div className="tarjeta-resumen">
          <div className="tarjeta-resumen__icono tarjeta-resumen__icono--teal"><Wallet size={20} /></div>
          <span className="tarjeta-resumen__label">Línea de crédito</span>
          <strong className="tarjeta-resumen__monto">{formatearMonto(resumen.linea_credito)}</strong>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-resumen__icono tarjeta-resumen__icono--rojo"><TrendingDown size={20} /></div>
          <span className="tarjeta-resumen__label">Deuda actual</span>
          <strong className="tarjeta-resumen__monto tarjeta-resumen__monto--rojo">{formatearMonto(resumen.deuda_actual)}</strong>
        </div>

        <div className="tarjeta-resumen">
          <div className={`tarjeta-resumen__icono ${resumen.saldo >= 0 ? 'tarjeta-resumen__icono--teal' : 'tarjeta-resumen__icono--rojo'}`}>
            <CheckCircle2 size={20} />
          </div>
          <span className="tarjeta-resumen__label">Saldo disponible</span>
          <strong className={`tarjeta-resumen__monto ${resumen.saldo >= 0 ? '' : 'tarjeta-resumen__monto--rojo'}`}>
            {formatearMonto(resumen.saldo)}
          </strong>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-resumen__icono tarjeta-resumen__icono--neutro"><FileText size={20} /></div>
          <span className="tarjeta-resumen__label">Total facturado</span>
          <strong className="tarjeta-resumen__monto">{formatearMonto(resumen.total_facturado)}</strong>
          <span className="tarjeta-resumen__meta">{facturas.length} facturas</span>
        </div>

        <div className="tarjeta-resumen">
          <div className="tarjeta-resumen__icono tarjeta-resumen__icono--teal"><DollarSign size={20} /></div>
          <span className="tarjeta-resumen__label">Total pagado</span>
          <strong className="tarjeta-resumen__monto">{formatearMonto(resumen.total_pagado)}</strong>
          <span className="tarjeta-resumen__meta">{pagos.length} pagos</span>
        </div>
      </div>

      {resumen.linea_credito > 0 && (
        <div className="credito">
          <div className="credito__encabezado">
            <h3>Uso de crédito</h3>
            <button className="btn btn--primario" onClick={() => setModalPagoAbierto(true)}>
              <CreditCard size={16} /> Reportar pago
            </button>
          </div>
          <div className="credito__barra">
            <div
              className="credito__progreso"
              style={{
                width: `${porcentajeUsado}%`,
                background: porcentajeUsado > 80 ? 'var(--color-negative)' : porcentajeUsado > 50 ? 'var(--color-warning)' : 'var(--color-brand)'
              }}
            />
          </div>
          <div className="credito__leyenda">
            <span>$0</span>
            <span>{porcentajeUsado.toFixed(1)}% usado</span>
            <span>{formatearMonto(resumen.linea_credito)}</span>
          </div>
        </div>
      )}

      <section className="movimientos">
        <div className="movimientos__encabezado">
          <h2>Historial de movimientos</h2>
          <div className="filtros">
            {[
              { key: 'todos', label: 'Todos', total: historial.length },
              { key: 'facturas', label: 'Facturas', total: facturas.length },
              { key: 'pagos', label: 'Pagos', total: pagos.length },
            ].map(f => (
              <button
                key={f.key}
                className={`filtros__pill ${filtro === f.key ? 'filtros__pill--activo' : ''}`}
                onClick={() => setFiltro(f.key)}
              >
                {f.label} <span>{f.total}</span>
              </button>
            ))}
          </div>
        </div>

        {historialFiltrado.length === 0 ? (
          <p className="movimientos__vacio">No hay movimientos registrados</p>
        ) : (
          <ul className="movimientos__lista">
            {historialFiltrado.map(mov => (
              <li key={`${mov.tipo}-${mov.id}`} className="movimiento">
                <div className={`movimiento__icono ${mov.tipo === 'factura' ? 'movimiento__icono--factura' : 'movimiento__icono--pago'}`}>
                  {mov.tipo === 'factura' ? <FileText size={18} /> : <DollarSign size={18} />}
                </div>
                <div className="movimiento__info">
                  <span className="movimiento__titulo">
                    {mov.tipo === 'factura' ? `Factura #${mov.numero_factura}` : `Pago #${mov.id}`}
                  </span>
                  <span className="movimiento__fecha">{formatearFecha(mov.created_at)}</span>
                </div>
                <span className={`estado-badge estado-badge--${mov.tipo === 'factura' ? (mov.estado || 'pendiente') : 'registrado'}`}>
                  {mov.tipo === 'factura' ? (mov.estado || 'pendiente') : 'registrado'}
                </span>
                <strong className={`movimiento__monto ${mov.tipo === 'factura' ? 'movimiento__monto--rojo' : 'movimiento__monto--verde'}`}>
                  {mov.tipo === 'factura' ? '-' : '+'}{formatearMonto(mov.monto_facturado || mov.monto)}
                </strong>
                {mov.tipo === 'factura' && (
                  <div className="movimiento__acciones">
                    <button title="Ver orden" onClick={() => setOrdenSeleccionada(mov)}><Eye size={16} /></button>
                    <button title="Exportar PDF" onClick={() => exportarFacturaPDF(mov)}><Download size={16} /></button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {ordenSeleccionada && (
        <ModalOrden orden={ordenSeleccionada} onCerrar={() => setOrdenSeleccionada(null)} />
      )}

      {modalPagoAbierto && (
        <ModalReportarPago onCerrar={() => setModalPagoAbierto(false)} onEnviar={reportarPago} />
      )}
    </div>
  )
}

function ModalOrden({ orden, onCerrar }) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__encabezado">
          <h3>Factura #{orden.numero_factura}</h3>
          <button onClick={onCerrar}><X size={20} /></button>
        </div>
        <div className="modal__cuerpo">
          <p><strong>Fecha:</strong> {formatearFecha(orden.created_at)}</p>
          <p><strong>Estado:</strong> {orden.estado || 'pendiente'}</p>
          <p><strong>Monto:</strong> {formatearMonto(orden.monto_facturado)}</p>
          {/* Si tu API expone las líneas de la orden (orden.items), se listan aquí.
              Si aún no existe ese detalle en /estado-cuenta, habría que consultarlo
              por separado, por ejemplo GET /facturas/:id */}
          {orden.items?.length > 0 && (
            <>
              <h4>Productos</h4>
              <ul className="modal__items">
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
    <div className="modal-fondo" onClick={onCerrar}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={manejarEnvio}>
        <div className="modal__encabezado">
          <h3>Reportar pago</h3>
          <button type="button" onClick={onCerrar}><X size={20} /></button>
        </div>
        <div className="modal__cuerpo modal__cuerpo--form">
          <label>
            Monto pagado
            <input type="number" step="0.01" min="0" value={monto} onChange={e => setMonto(e.target.value)} required />
          </label>
          <label>
            Método de pago
            <select value={metodo} onChange={e => setMetodo(e.target.value)}>
              <option value="transferencia">Transferencia</option>
              <option value="pago_movil">Pago móvil</option>
              <option value="zelle">Zelle</option>
              <option value="efectivo">Efectivo</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label>
            Número de referencia
            <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)} required />
          </label>
          <label>
            Fecha del pago
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
          </label>
          <label>
            Comprobante (opcional)
            <div className="modal__upload">
              <Upload size={16} />
              <span>{comprobante ? comprobante.name : 'Subir imagen o PDF'}</span>
              <input type="file" accept="image/*,.pdf" onChange={e => setComprobante(e.target.files?.[0] || null)} />
            </div>
          </label>
          {error && <p className="modal__error"><AlertCircle size={14} /> {error}</p>}
        </div>
        <div className="modal__pie">
          <button type="button" className="btn btn--secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn--primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </div>
  )
}
