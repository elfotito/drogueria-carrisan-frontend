import { useState } from 'react'

const DIAS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
]

// Opciones de hora en intervalos de 30 min, formato 12h para mostrar
// al usuario pero guardamos en 24h internamente (más fácil de comparar
// y ordenar en el backend/reportes).
function generarOpcionesHora() {
  const opciones = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hora24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const hora12 = new Date(2000, 0, 1, h, m).toLocaleTimeString('es-VE', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      opciones.push({ value: hora24, label: hora12 })
    }
  }
  return opciones
}

const OPCIONES_HORA = generarOpcionesHora()

const HORARIO_POR_DEFECTO = { abierto: true, apertura: '08:00', cierre: '17:00' }

function crearHorarioInicial() {
  const horario = {}
  DIAS.forEach((d) => {
    horario[d.key] = { ...HORARIO_POR_DEFECTO }
  })
  return horario
}

/**
 * Selector de horario semanal de recepción de pedidos.
 * Por cada día: switch abierto/cerrado + hora de apertura/cierre.
 * Botón "Copiar a todos los días" para no repetir la config 7 veces.
 *
 * Props:
 *  - value: objeto { lunes: {abierto, apertura, cierre}, ... } o undefined
 *  - onChange(nuevoValor): callback con el objeto completo actualizado
 */
function SelectorHorarioSemanal({ value, onChange }) {
  const [horario, setHorario] = useState(value || crearHorarioInicial())

  function actualizar(nuevoHorario) {
    setHorario(nuevoHorario)
    onChange(nuevoHorario)
  }

  function toggleDia(diaKey) {
    actualizar({
      ...horario,
      [diaKey]: { ...horario[diaKey], abierto: !horario[diaKey].abierto }
    })
  }

  function cambiarHora(diaKey, campo, valorHora) {
    actualizar({
      ...horario,
      [diaKey]: { ...horario[diaKey], [campo]: valorHora }
    })
  }

  function copiarATodos(diaKey) {
    const plantilla = horario[diaKey]
    const nuevoHorario = {}
    DIAS.forEach((d) => {
      nuevoHorario[d.key] = { ...plantilla }
    })
    actualizar(nuevoHorario)
  }

  return (
    <div className="horario-semanal">
      {DIAS.map((dia) => {
        const config = horario[dia.key]
        return (
          <div key={dia.key} className="horario-semanal-fila">
            <div className="horario-semanal-dia">
              <label className="horario-semanal-switch">
                <input
                  type="checkbox"
                  checked={config.abierto}
                  onChange={() => toggleDia(dia.key)}
                />
                <span className="horario-semanal-switch-track" />
              </label>
              <span className={config.abierto ? '' : 'horario-semanal-dia--cerrado'}>
                {dia.label}
              </span>
            </div>

            {config.abierto ? (
              <div className="horario-semanal-horas">
                <select
                  value={config.apertura}
                  onChange={(e) => cambiarHora(dia.key, 'apertura', e.target.value)}
                  aria-label={`Hora de apertura ${dia.label}`}
                >
                  {OPCIONES_HORA.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
                <span className="horario-semanal-separador">a</span>
                <select
                  value={config.cierre}
                  onChange={(e) => cambiarHora(dia.key, 'cierre', e.target.value)}
                  aria-label={`Hora de cierre ${dia.label}`}
                >
                  {OPCIONES_HORA.map((h) => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="horario-semanal-copiar"
                  onClick={() => copiarATodos(dia.key)}
                  title="Copiar este horario a todos los días"
                >
                  Copiar a todos
                </button>
              </div>
            ) : (
              <span className="horario-semanal-cerrado-texto">Cerrado</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SelectorHorarioSemanal