import { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios'; // 👈 AJUSTA esta ruta a donde esté tu instancia real
import DescuentoForm from './DescuentoForm';
import './DescuentosAdmin.css';

const ESTADO_LABELS = {
  vigente: { texto: 'Vigente', clase: 'badge--vigente' },
  programado: { texto: 'Programado', clase: 'badge--programado' },
  expirado: { texto: 'Expirado', clase: 'badge--expirado' },
  inactivo: { texto: 'Inactivo', clase: 'badge--inactivo' },
};

const ALCANCE_LABELS = {
  producto: 'Producto',
  marca: 'Marca',
  laboratorio: 'Laboratorio',
  molecula: 'Molécula',
  linea: 'Línea',
  forma: 'Forma',
};

export default function DescuentosPanel() {
  const [descuentos, setDescuentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [descuentoEditando, setDescuentoEditando] = useState(null);

  useEffect(() => {
    cargarDescuentos();
  }, []);

  async function cargarDescuentos() {
    setCargando(true);
    setError('');
    try {
      const res = await axios.get('/descuentos');
      setDescuentos(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar descuentos');
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este descuento? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/descuentos/${id}`);
      setDescuentos(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el descuento');
    }
  }

  function handleGuardado(descuentoGuardado) {
    setMostrarForm(false);
    setDescuentoEditando(null);
    cargarDescuentos(); // recarga completa para traer estado/joins actualizados
  }

  function abrirEdicion(descuento) {
    setDescuentoEditando(descuento);
    setMostrarForm(true);
  }

  function abrirNuevo() {
    setDescuentoEditando(null);
    setMostrarForm(true);
  }

  const descuentosFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') return descuentos;
    return descuentos.filter(d => d.estado === filtroEstado);
  }, [descuentos, filtroEstado]);

  function etiquetaAlcance(d) {
    if (d.alcance === 'producto') return d.productos?.nombre_comercial || `Producto #${d.producto_id}`;
    if (d.alcance === 'marca') return d.marcas?.nombre || `Marca #${d.marca_id}`;
    return d.alcance_valor;
  }

  function etiquetaValor(d) {
    return d.tipo === 'porcentaje' ? `${d.valor}%` : `$${Number(d.valor).toFixed(2)}`;
  }

  function formatearFecha(f) {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="descuentos-panel">
      <div className="descuentos-panel__header">
        <h2>Descuentos</h2>
        <button className="descuentos-panel__btn-nuevo" onClick={abrirNuevo}>
          + Nuevo descuento
        </button>
      </div>

      <div className="descuentos-panel__filtros">
        {['todos', 'vigente', 'programado', 'expirado', 'inactivo'].map(f => (
          <button
            key={f}
            className={`descuentos-panel__filtro ${filtroEstado === f ? 'activo' : ''}`}
            onClick={() => setFiltroEstado(f)}
          >
            {f === 'todos' ? 'Todos' : ESTADO_LABELS[f].texto}
          </button>
        ))}
      </div>

      {mostrarForm && (
        <div className="descuentos-panel__form-overlay">
          <DescuentoForm
            descuentoExistente={descuentoEditando}
            onGuardado={handleGuardado}
            onCancelar={() => {
              setMostrarForm(false);
              setDescuentoEditando(null);
            }}
          />
        </div>
      )}

      {cargando && <p className="descuentos-panel__estado">Cargando descuentos...</p>}
      {error && <p className="descuentos-panel__error">{error}</p>}

      {!cargando && !error && descuentosFiltrados.length === 0 && (
        <p className="descuentos-panel__estado">No hay descuentos en esta categoría.</p>
      )}

      {!cargando && descuentosFiltrados.length > 0 && (
        <table className="descuentos-panel__tabla">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Alcance</th>
              <th>Aplica a</th>
              <th>Descuento</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {descuentosFiltrados.map(d => (
              <tr key={d.id}>
                <td>
                  <span className={`descuentos-panel__badge ${ESTADO_LABELS[d.estado].clase}`}>
                    {ESTADO_LABELS[d.estado].texto}
                  </span>
                </td>
                <td>{ALCANCE_LABELS[d.alcance]}</td>
                <td>{etiquetaAlcance(d)}</td>
                <td>{etiquetaValor(d)}</td>
                <td>{formatearFecha(d.fecha_inicio)}</td>
                <td>{formatearFecha(d.fecha_fin)}</td>
                <td className="descuentos-panel__acciones">
                  <button onClick={() => abrirEdicion(d)}>Editar</button>
                  <button className="descuentos-panel__btn-eliminar" onClick={() => handleEliminar(d.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}