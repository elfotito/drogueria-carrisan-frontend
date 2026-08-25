import { useState, useEffect } from 'react'
import { Plus, Send, Trash2, Edit3, Percent, Tag, Clock, CheckCircle, X } from 'lucide-react'
import api from '../../api/axios'
import './PromocionesAdmin.css'

const PLANTILLAS_PRECARGADAS = [
  { titulo: '¡20% en toda la farmacia!', mensaje: 'Aprovechá un 20% de descuento en todos los productos de línea farmacéutica. Solo por tiempo limitado.', descuento_pct: 20 },
  { titulo: 'Envío gratis en tu próximo pedido', mensaje: 'Hoy no pagás envío. Combiná lo que necesités y recibilo en tu puerta sin costo.', descuento_pct: null },
  { titulo: '3x2 en productos seleccionados', mensaje: 'Comprá 2 y llevá 3 en productos seleccionados del catálogo. ¡No te lo pierdas!', descuento_pct: null, codigo_cupon: '3X2' },
  { titulo: 'Descuento exclusivo para clientes de crédito', mensaje: 'Si tenés línea de crédito activa, disfrutá un 15% extra en tu próxima compra.', descuento_pct: 15 },
  { titulo: 'Semana de la salud — hasta 30% OFF', mensaje: 'Semana especial con descuentos de hasta 30% en medicamentos y suplementos.', descuento_pct: 30 },
  { titulo: 'Nuevo producto disponible', mensaje: 'Llegó un producto nuevo al catálogo. ¡Sé de los primeros en pedirlo!', descuento_pct: null },
]

export default function PromocionesAdmin() {
  const [plantillas, setPlantillas] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalCustom, setModalCustom] = useState(false)
  const [editando, setEditando] = useState(null)
  const [enviando, setEnviando] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [tab, setTab] = useState('plantillas')

  const [form, setForm] = useState({ titulo: '', mensaje: '', descuento_pct: '', codigo_cupon: '' })

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    try {
      const [plantillasRes, historialRes] = await Promise.all([
        api.get('/promotions/templates').catch(() => ({ data: [] })),
        api.get('/promotions/history').catch(() => ({ data: [] })),
      ])
      setPlantillas(plantillasRes.data)
      setHistorial(historialRes.data)
    } finally {
      setCargando(false)
    }
  }

  function abrirCrear() {
    setForm({ titulo: '', mensaje: '', descuento_pct: '', codigo_cupon: '' })
    setEditando(null)
    setModalCrear(true)
  }

  function abrirEditar(p) {
    setForm({
      titulo: p.titulo,
      mensaje: p.mensaje,
      descuento_pct: p.descuento_pct || '',
      codigo_cupon: p.codigo_cupon || '',
    })
    setEditando(p.id)
    setModalCrear(true)
  }

  async function guardarPlantilla() {
    if (!form.titulo || !form.mensaje) return
    const payload = {
      titulo: form.titulo,
      mensaje: form.mensaje,
      descuento_pct: form.descuento_pct ? Number(form.descuento_pct) : null,
      codigo_cupon: form.codigo_cupon || null,
    }
    try {
      if (editando) {
        await api.put(`/promotions/templates/${editando}`, payload)
      } else {
        await api.post('/promotions/templates', payload)
      }
      setModalCrear(false)
      cargarDatos()
    } catch (err) {
      console.error(err)
    }
  }

  async function eliminarPlantilla(id) {
    if (!confirm('¿Eliminar esta plantilla?')) return
    await api.delete(`/promotions/templates/${id}`)
    cargarDatos()
  }

  async function enviarPromocion(id) {
    setEnviando(id)
    setResultado(null)
    try {
      const { data } = await api.post(`/promotions/send/${id}`)
      setResultado(data)
      cargarDatos()
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(null)
    }
  }

  async function enviarCustom() {
    if (!form.titulo || !form.mensaje) return
    setEnviando('custom')
    setResultado(null)
    try {
      const { data } = await api.post('/promotions/send-custom', {
        titulo: form.titulo,
        mensaje: form.mensaje,
        descuento_pct: form.descuento_pct ? Number(form.descuento_pct) : null,
        codigo_cupon: form.codigo_cupon || null,
      })
      setResultado(data)
      setModalCustom(false)
      setForm({ titulo: '', mensaje: '', descuento_pct: '', codigo_cupon: '' })
      cargarDatos()
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(null)
    }
  }

  function cargarPlantillaPrecargada(p) {
    setForm({ titulo: p.titulo, mensaje: p.mensaje, descuento_pct: p.descuento_pct || '', codigo_cupon: p.codigo_cupon || '' })
    setEditando(null)
    setModalCrear(true)
  }

  return (
    <div className="promo-admin">
      {resultado && (
        <div className="promo-admin__resultado">
          <CheckCircle size={16} />
          <span>Enviado a <strong>{resultado.usuarios_total}</strong> usuarios. Exitosos: {resultado.enviadas}. Fallos: {resultado.fallos}</span>
          <button onClick={() => setResultado(null)}><X size={14} /></button>
        </div>
      )}

      <div className="promo-admin__header">
        <div className="promo-admin__tabs">
          <button className={`promo-admin__tab ${tab === 'plantillas' ? 'promo-admin__tab--activo' : ''}`} onClick={() => setTab('plantillas')}>Plantillas</button>
          <button className={`promo-admin__tab ${tab === 'precargadas' ? 'promo-admin__tab--activo' : ''}`} onClick={() => setTab('precargadas')}>Precargadas</button>
          <button className={`promo-admin__tab ${tab === 'historial' ? 'promo-admin__tab--activo' : ''}`} onClick={() => setTab('historial')}>Historial</button>
        </div>
        <div className="promo-admin__acciones">
          <button className="promo-admin__btn promo-admin__btn--custom" onClick={() => { setForm({ titulo: '', mensaje: '', descuento_pct: '', codigo_cupon: '' }); setModalCustom(true) }}>
            <Send size={15} /> Enviar personalizada
          </button>
          <button className="promo-admin__btn promo-admin__btn--nueva" onClick={abrirCrear}>
            <Plus size={15} /> Nueva plantilla
          </button>
        </div>
      </div>

      {tab === 'plantillas' && (
        <div className="promo-admin__grid">
          {plantillas.length === 0 && !cargando && (
            <p className="promo-admin__vacio">No hay plantillas creadas. Creá una o usá las precargadas.</p>
          )}
          {plantillas.map(p => (
            <div className={`promo-admin__card ${!p.activa ? 'promo-admin__card--inactiva' : ''}`} key={p.id}>
              <div className="promo-admin__card-header">
                {p.descuento_pct && (
                  <span className="promo-admin__badge-descuento"><Percent size={12} /> {p.descuento_pct}%</span>
                )}
                {p.codigo_cupon && (
                  <span className="promo-admin__badge-cupon"><Tag size={12} /> {p.codigo_cupon}</span>
                )}
              </div>
              <h4 className="promo-admin__card-titulo">{p.titulo}</h4>
              <p className="promo-admin__card-mensaje">{p.mensaje}</p>
              <div className="promo-admin__card-footer">
                <button className="promo-admin__card-btn" onClick={() => enviarPromocion(p.id)} disabled={enviando === p.id}>
                  <Send size={14} /> {enviando === p.id ? 'Enviando…' : 'Enviar'}
                </button>
                <button className="promo-admin__card-btn promo-admin__card-btn--editar" onClick={() => abrirEditar(p)}>
                  <Edit3 size={14} />
                </button>
                <button className="promo-admin__card-btn promo-admin__card-btn--eliminar" onClick={() => eliminarPlantilla(p.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'precargadas' && (
        <div className="promo-admin__grid">
          {PLANTILLAS_PRECARGADAS.map((p, i) => (
            <div className="promo-admin__card promo-admin__card--precargada" key={i}>
              <div className="promo-admin__card-header">
                {p.descuento_pct && (
                  <span className="promo-admin__badge-descuento"><Percent size={12} /> {p.descuento_pct}%</span>
                )}
                {p.codigo_cupon && (
                  <span className="promo-admin__badge-cupon"><Tag size={12} /> {p.codigo_cupon}</span>
                )}
              </div>
              <h4 className="promo-admin__card-titulo">{p.titulo}</h4>
              <p className="promo-admin__card-mensaje">{p.mensaje}</p>
              <div className="promo-admin__card-footer">
                <button className="promo-admin__card-btn promo-admin__card-btn--usar" onClick={() => cargarPlantillaPrecargada(p)}>
                  <Plus size={14} /> Usar como plantilla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'historial' && (
        <div className="promo-admin__historial">
          {historial.length === 0 && <p className="promo-admin__vacio">No hay envíos registrados.</p>}
          {historial.map(h => (
            <div className="promo-admin__historial-item" key={h.id}>
              <div className="promo-admin__historial-icono">
                <Send size={16} />
              </div>
              <div className="promo-admin__historial-info">
                <span className="promo-admin__historial-titulo">{h.titulo}</span>
                <span className="promo-admin__historial-fecha">
                  <Clock size={12} /> {new Date(h.created_at).toLocaleString('es-VE')}
                </span>
              </div>
              <div className="promo-admin__historial-stats">
                <span>{h.enviadas} enviadas</span>
                {h.fallos > 0 && <span className="promo-admin__historial-fallos">{h.fallos} fallos</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {(modalCrear || modalCustom) && (
        <div className="promo-admin__modal-overlay" onClick={() => { setModalCrear(false); setModalCustom(false) }}>
          <div className="promo-admin__modal" onClick={e => e.stopPropagation()}>
            <div className="promo-admin__modal-header">
              <h3>{modalCustom ? 'Enviar promoción personalizada' : editando ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
              <button onClick={() => { setModalCrear(false); setModalCustom(false) }}><X size={18} /></button>
            </div>
            <div className="promo-admin__modal-body">
              <label>
                <span>Título</span>
                <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: ¡20% en farmacia!" />
              </label>
              <label>
                <span>Mensaje</span>
                <textarea rows={3} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} placeholder="Descripción de la promoción…" />
              </label>
              <div className="promo-admin__modal-row">
                <label>
                  <span>Descuento %</span>
                  <input type="number" min={0} max={100} value={form.descuento_pct} onChange={e => setForm({ ...form, descuento_pct: e.target.value })} placeholder="Opcional" />
                </label>
                <label>
                  <span>Código cupón</span>
                  <input type="text" value={form.codigo_cupon} onChange={e => setForm({ ...form, codigo_cupon: e.target.value })} placeholder="Opcional" />
                </label>
              </div>
            </div>
            <div className="promo-admin__modal-footer">
              <button className="promo-admin__btn promo-admin__btn--cancelar" onClick={() => { setModalCrear(false); setModalCustom(false) }}>Cancelar</button>
              <button
                className="promo-admin__btn promo-admin__btn--enviar"
                disabled={!form.titulo || !form.mensaje || !!enviando}
                onClick={modalCustom ? enviarCustom : guardarPlantilla}
              >
                {enviando ? 'Enviando…' : modalCustom ? 'Enviar a todos' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
