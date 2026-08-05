import { useState, useEffect } from 'react';
import axios from '../api/axios'; // 👈 AJUSTA esta ruta a donde esté tu instancia real
import './DescuentoForm.css';

const ALCANCES = [
  { valor: 'producto', label: 'Producto específico' },
  { valor: 'marca', label: 'Marca' },
  { valor: 'laboratorio', label: 'Laboratorio' },
  { valor: 'molecula', label: 'Molécula' },
  { valor: 'linea', label: 'Línea' },
  { valor: 'forma', label: 'Forma' },
];

const CAMPOS_TEXTO = ['laboratorio', 'molecula', 'linea', 'forma'];

/**
 * Formulario reusable para crear/editar un descuento.
 *
 * Props:
 * - productoFijo: { id, nombre_comercial } | null
 *     Si viene seteado, el form se embebe dentro de ProductoForm:
 *     bloquea el alcance en "producto" y no muestra el selector de alcance.
 * - descuentoExistente: objeto del descuento a editar | null (null = modo crear)
 * - onGuardado: callback(descuentoGuardado) — se llama tras crear/editar con éxito
 * - onCancelar: callback() — cierra el form sin guardar
 */
export default function DescuentoForm({
  productoFijo = null,
  descuentoExistente = null,
  onGuardado,
  onCancelar,
}) {
  const esEdicion = !!descuentoExistente;
  const alcanceBloqueado = !!productoFijo;

  const [alcance, setAlcance] = useState(
    descuentoExistente?.alcance || (alcanceBloqueado ? 'producto' : 'producto')
  );
  const [productoId, setProductoId] = useState(
    descuentoExistente?.producto_id || productoFijo?.id || null
  );
  const [productoLabel, setProductoLabel] = useState(
    descuentoExistente?.productos?.nombre_comercial || productoFijo?.nombre_comercial || ''
  );
  const [marcaId, setMarcaId] = useState(descuentoExistente?.marca_id || '');
  const [alcanceValor, setAlcanceValor] = useState(descuentoExistente?.alcance_valor || '');
  const [tipo, setTipo] = useState(descuentoExistente?.tipo || 'porcentaje');
  const [valor, setValor] = useState(descuentoExistente?.valor || '');
  const [fechaInicio, setFechaInicio] = useState(
    descuentoExistente?.fecha_inicio?.slice(0, 16) || ''
  );
  const [fechaFin, setFechaFin] = useState(descuentoExistente?.fecha_fin?.slice(0, 16) || '');
  const [activo, setActivo] = useState(descuentoExistente?.activo ?? true);

  const [marcas, setMarcas] = useState([]);
  const [valoresTexto, setValoresTexto] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [resultadosProducto, setResultadosProducto] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Cargar marcas una sola vez (solo si el alcance puede ser "marca")
  useEffect(() => {
    if (alcanceBloqueado) return;
    axios
      .get('/marcas')
      .then(res => setMarcas(res.data))
      .catch(() => setMarcas([])); // si no existe el endpoint todavía, no rompe el form
  }, [alcanceBloqueado]);

  // Cargar valores distintos cuando el alcance es laboratorio/molecula/linea/forma
  useEffect(() => {
    if (!CAMPOS_TEXTO.includes(alcance)) return;
    axios
      .get(`/products/valores-distintos?campo=${alcance}`)
      .then(res => setValoresTexto(res.data))
      .catch(() => setValoresTexto([]));
  }, [alcance]);

  // Buscador de producto (solo cuando alcance === 'producto' y no viene fijo)
  useEffect(() => {
    if (alcanceBloqueado || alcance !== 'producto' || !busquedaProducto.trim()) {
      setResultadosProducto([]);
      return;
    }
    const timeout = setTimeout(() => {
      axios
        .get(`/products?search=${encodeURIComponent(busquedaProducto)}`)
        .then(res => setResultadosProducto(res.data.slice(0, 8)))
        .catch(() => setResultadosProducto([]));
    }, 300); // debounce simple
    return () => clearTimeout(timeout);
  }, [busquedaProducto, alcance, alcanceBloqueado]);

  function seleccionarProducto(p) {
    setProductoId(p.id);
    setProductoLabel(p.nombre_comercial);
    setResultadosProducto([]);
    setBusquedaProducto('');
  }

  function cambiarAlcance(nuevoAlcance) {
    setAlcance(nuevoAlcance);
    // limpiar campos que ya no aplican
    setProductoId(null);
    setProductoLabel('');
    setMarcaId('');
    setAlcanceValor('');
  }

  function validar() {
    if (alcance === 'producto' && !productoId) return 'Selecciona un producto';
    if (alcance === 'marca' && !marcaId) return 'Selecciona una marca';
    if (CAMPOS_TEXTO.includes(alcance) && !alcanceValor) return 'Selecciona un valor';
    if (!valor || Number(valor) <= 0) return 'El valor del descuento debe ser mayor a 0';
    if (tipo === 'porcentaje' && Number(valor) > 100) return 'El porcentaje no puede ser mayor a 100';
    if (!fechaInicio) return 'La fecha de inicio es requerida';
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
      return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError('');
    setGuardando(true);

    const payload = {
      alcance,
      producto_id: alcance === 'producto' ? productoId : null,
      marca_id: alcance === 'marca' ? Number(marcaId) : null,
      alcance_valor: CAMPOS_TEXTO.includes(alcance) ? alcanceValor : null,
      tipo,
      valor: Number(valor),
      fecha_inicio: new Date(fechaInicio).toISOString(),
      fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
      activo,
    };

    try {
      const res = esEdicion
        ? await axios.put(`/descuentos/${descuentoExistente.id}`, payload)
        : await axios.post('/descuentos', payload);
      onGuardado?.(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el descuento');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="descuento-form" onSubmit={handleSubmit}>
      <h3>{esEdicion ? 'Editar descuento' : 'Nuevo descuento'}</h3>

      {!alcanceBloqueado && (
        <div className="descuento-form__grupo">
          <label>Aplicar a</label>
          <div className="descuento-form__alcance-radios">
            {ALCANCES.map(a => (
              <label key={a.valor} className="descuento-form__radio">
                <input
                  type="radio"
                  name="alcance"
                  value={a.valor}
                  checked={alcance === a.valor}
                  onChange={() => cambiarAlcance(a.valor)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Campo dinámico según el alcance */}
      {alcance === 'producto' && (
        <div className="descuento-form__grupo">
          <label>Producto</label>
          {alcanceBloqueado ? (
            <div className="descuento-form__producto-fijo">{productoLabel}</div>
          ) : (
            <>
              {productoId ? (
                <div className="descuento-form__producto-seleccionado">
                  {productoLabel}
                  <button
                    type="button"
                    onClick={() => {
                      setProductoId(null);
                      setProductoLabel('');
                    }}
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre comercial..."
                    value={busquedaProducto}
                    onChange={e => setBusquedaProducto(e.target.value)}
                  />
                  {resultadosProducto.length > 0 && (
                    <ul className="descuento-form__resultados">
                      {resultadosProducto.map(p => (
                        <li key={p.id} onClick={() => seleccionarProducto(p)}>
                          {p.nombre_comercial}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {alcance === 'marca' && (
        <div className="descuento-form__grupo">
          <label>Marca</label>
          <select value={marcaId} onChange={e => setMarcaId(e.target.value)}>
            <option value="">Selecciona una marca</option>
            {marcas.map(m => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {CAMPOS_TEXTO.includes(alcance) && (
        <div className="descuento-form__grupo">
          <label>{ALCANCES.find(a => a.valor === alcance)?.label}</label>
          <select value={alcanceValor} onChange={e => setAlcanceValor(e.target.value)}>
            <option value="">Selecciona un valor</option>
            {valoresTexto.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tipo y valor */}
      <div className="descuento-form__fila">
        <div className="descuento-form__grupo">
          <label>Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto">Monto fijo (USD)</option>
          </select>
        </div>
        <div className="descuento-form__grupo">
          <label>Valor</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={tipo === 'porcentaje' ? 100 : undefined}
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder={tipo === 'porcentaje' ? 'ej: 15' : 'ej: 5.00'}
          />
        </div>
      </div>

      {/* Fechas */}
      <div className="descuento-form__fila">
        <div className="descuento-form__grupo">
          <label>Fecha de inicio</label>
          <input
            type="datetime-local"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
          />
        </div>
        <div className="descuento-form__grupo">
          <label>Fecha de fin (opcional)</label>
          <input
            type="datetime-local"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      <label className="descuento-form__toggle">
        <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
        Descuento activo
      </label>

      {error && <p className="descuento-form__error">{error}</p>}

      <div className="descuento-form__acciones">
        <button type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear descuento'}
        </button>
      </div>
    </form>
  );
}