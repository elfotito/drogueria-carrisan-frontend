import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Phone } from 'lucide-react'
import staffApi from '../../api/staffAxios'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import './StaffDirecciones.css'

const TIPOS = [
  { id: 'todas', label: 'Todas' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'envio_nacional', label: 'Envío nacional' },
]

function formatFecha(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

async function obtenerDirecciones(tipo, query) {
  const params = {}
  if (tipo !== 'todas') params.tipo = tipo
  if (query && query.trim().length >= 2) params.buscar = query.trim()
  const { data } = await staffApi.get('/staff/direcciones', { params })
  return Array.isArray(data) ? data : []
}

function StaffDirecciones({ departamento = 'logistica', activo = 'direcciones', titulo = 'Direcciones de clientes' }) {
  const [direcciones, setDirecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tipo, setTipo] = useState('todas')
  const [buscar, setBuscar] = useState('')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ telefono_contacto: '', nota_entrega: '' })
  const timer = useRef(null)

  useEffect(() => {
    let activo = true
    obtenerDirecciones(tipo, '')
      .then(
        (data) => { if (activo) setDirecciones(data) },
        (err) => { console.error('Error al cargar direcciones', err); if (activo) setDirecciones([]) },
      )
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [tipo])

  useEffect(() => () => clearTimeout(timer.current), [])

  function handleBuscar(value) {
    setBuscar(value)
    setCargando(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      obtenerDirecciones(tipo, value)
        .then(
          (data) => setDirecciones(data),
          (err) => { console.error('Error al cargar direcciones', err); setDirecciones([]) },
        )
        .finally(() => setCargando(false))
    }, 120)
  }

  async function togglePreferida(d) {
    try {
      await staffApi.patch(`/staff/direcciones/${d.id}`, { es_preferida: !d.es_preferida })
      setDirecciones((prev) => prev.map((x) => x.id === d.id ? { ...x, es_preferida: !d.es_preferida } : x))
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar la preferida')
    }
  }

  function abrirEdicion(d) {
    setEditando(d)
    setForm({ telefono_contacto: d.telefono_contacto || '', nota_entrega: d.nota_entrega || '' })
  }

  async function guardarEdicion() {
    if (!editando) return
    try {
      await staffApi.patch(`/staff/direcciones/${editando.id}`, {
        telefono_contacto: form.telefono_contacto,
        nota_entrega: form.nota_entrega,
      })
      setDirecciones((prev) => prev.map((x) => x.id === editando.id
        ? { ...x, telefono_contacto: form.telefono_contacto, nota_entrega: form.nota_entrega }
        : x))
      setEditando(null)
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo guardar la dirección')
    }
  }

  return (
    <LayoutDepartamento departamento={departamento} activo={activo} titulo={titulo}>
      <div className="sd-page">
        <div className="sd-toolbar">
          <div className="sd-buscador">
            <Search size={17} />
            <input
              type="text"
              placeholder="Buscar por cliente, email, dirección o ciudad..."
              value={buscar}
              onChange={(e) => handleBuscar(e.target.value)}
            />
          </div>
          <div className="sd-tabs">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`sd-tab ${tipo === t.id ? 'sd-tab--activo' : ''}`}
                onClick={() => { setTipo(t.id); setCargando(true) }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando direcciones...</p>
          </div>
        ) : direcciones.length === 0 ? (
          <p className="sd-vacio">No hay direcciones para mostrar.</p>
        ) : (
          <div className="sd-grid">
            {direcciones.map((d) => (
              <div className="sd-card" key={d.id}>
                <div className="sd-card__head">
                  <div className="sd-card__avatar">{(d.users?.nombre || d.users?.email || '?').trim().charAt(0).toUpperCase()}</div>
                  <div className="sd-card__cliente">
                    <strong>{d.users?.nombre || 'Sin nombre'}{d.es_preferida && <span className="sd-badge-pref"> Preferida</span>}</strong>
                    <span>{d.users?.email}{d.users?.rif_cedula ? ` · ${d.users.rif_cedula}` : ''}</span>
                  </div>
                </div>

                <span className={`sd-card__badge sd-card__badge--${d.tipo_direccion || 'delivery'}`}>
                  {d.tipo_direccion === 'envio_nacional' ? 'Envío nacional' : 'Delivery'}
                </span>

                <div className="sd-card__direccion">
                  <MapPin size={15} />
                  <div>
                    <p className="sd-card__nombre">{d.nombre || 'Dirección'}</p>
                    <p>{d.direccion}</p>
                    {(d.ciudad || d.estado) && <p className="sd-card__ciudad">{[d.ciudad, d.estado].filter(Boolean).join(', ')}</p>}
                    {d.referencia && <p className="sd-card__ref">{d.referencia}</p>}
                    {d.nota_entrega && <p className="sd-card__nota">Nota: {d.nota_entrega}</p>}
                  </div>
                </div>

                <div className="sd-card__meta">
                  {d.telefono_contacto && <span className="sd-card__meta-item"><Phone size={12} /> {d.telefono_contacto}</span>}
                  {d.agencia_preferida && <span className="sd-card__meta-agencia">Agencia: {d.agencia_preferida}</span>}
                  <span className="sd-card__fecha">Registrada {formatFecha(d.created_at)}</span>
                </div>

                <div className="sd-card__acciones">
                  <button type="button" className="sd-card__btn" onClick={() => togglePreferida(d)}>
                    {d.es_preferida ? 'Quitar preferida' : 'Marcar preferida'}
                  </button>
                  <button type="button" className="sd-card__btn" onClick={() => abrirEdicion(d)}>Editar contacto/nota</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editando && (
          <div className="sd-modal" onClick={() => setEditando(null)}>
            <div className="sd-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Dirección de {editando.users?.nombre}</h3>
              <label>
                Teléfono de contacto
                <input value={form.telefono_contacto} onChange={(e) => setForm({ ...form, telefono_contacto: e.target.value })} />
              </label>
              <label>
                Nota de entrega
                <input value={form.nota_entrega} onChange={(e) => setForm({ ...form, nota_entrega: e.target.value })} placeholder="Ej. preguntar por María, edificio verde" />
              </label>
              <div className="sd-modal__acciones">
                <button type="button" className="sd-card__btn" onClick={() => setEditando(null)}>Cancelar</button>
                <button type="button" className="sd-card__btn sd-card__btn--primario" onClick={guardarEdicion}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutDepartamento>
  )
}

export default StaffDirecciones
