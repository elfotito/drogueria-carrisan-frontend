import { useEffect } from 'react'
import { ESTADOS_VENEZUELA, obtenerCiudades } from '../../data/estadosCiudades'

/**
 * Selector dependiente Estado → Ciudad.
 * Al cambiar el estado, resetea la ciudad seleccionada (si ya no
 * pertenece al nuevo estado) y repuebla las opciones de ciudad.
 *
 * Props:
 *  - estado, ciudad: valores controlados desde el formulario padre
 *  - onChangeEstado(valor), onChangeCiudad(valor): callbacks
 *  - errorEstado, errorCiudad: mensajes de error opcionales
 */
function SelectorEstadoCiudad({
  estado,
  ciudad,
  onChangeEstado,
  onChangeCiudad,
  errorEstado,
  errorCiudad
}) {
  const ciudadesDisponibles = obtenerCiudades(estado)

  // Si el estado cambia y la ciudad actual ya no pertenece a la lista
  // nueva, la limpiamos para no dejar una combinación inconsistente.
  useEffect(() => {
    if (ciudad && !ciudadesDisponibles.includes(ciudad)) {
      onChangeCiudad('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  return (
    <div className="registro-campo-doble">
      <div className="registro-campo">
        <label htmlFor="campo-estado">Estado</label>
        <select
          id="campo-estado"
          value={estado}
          onChange={(e) => onChangeEstado(e.target.value)}
          className={errorEstado ? 'registro-input--error' : ''}
        >
          <option value="">Selecciona un estado</option>
          {ESTADOS_VENEZUELA.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {errorEstado && <span className="registro-error-texto">{errorEstado}</span>}
      </div>

      <div className="registro-campo">
        <label htmlFor="campo-ciudad">Ciudad</label>
        <select
          id="campo-ciudad"
          value={ciudad}
          onChange={(e) => onChangeCiudad(e.target.value)}
          disabled={!estado}
          className={errorCiudad ? 'registro-input--error' : ''}
        >
          <option value="">{estado ? 'Selecciona una ciudad' : 'Primero elige el estado'}</option>
          {ciudadesDisponibles.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errorCiudad && <span className="registro-error-texto">{errorCiudad}</span>}
      </div>
    </div>
  )
}

export default SelectorEstadoCiudad