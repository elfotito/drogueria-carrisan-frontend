// Frontend helper para el horario de recepción de pedidos.
//
// El horario se guarda en perfiles_institucional.horario_recepcion como
// JSONB con la misma forma que produce SelectorHorarioSemanal:
//   { lunes: { abierto, apertura, cierre }, ..., domingo: {...} }
// Las horas van en formato 24h ("08:00") y se muestran en 12h.

export const DIAS_HORARIO = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

export function hora12(hora24) {
  const [h, m] = String(hora24 || '').split(':').map(Number)
  if (!Number.isFinite(h) || !m) return hora24
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('es-VE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Devuelve una lista de líneas legibles, agrupando días consecutivos que
// comparten la misma config. Ej. con todo Lun–Vie uniforme:
//   ["Lunes a Viernes · 8:00 a. m. a 5:00 p. m.", "Sábado y Domingo · Cerrado"]
// Si no hay horario, devuelve [].
export function resumirHorario(horario) {
  if (!horario || typeof horario !== 'object') return []

  const dias = DIAS_HORARIO.map((d) => ({
    label: d.label,
    abierto: !!horario[d.key]?.abierto,
    apertura: horario[d.key]?.apertura || '08:00',
    cierre: horario[d.key]?.cierre || '17:00',
  }))

  const grupos = []
  dias.forEach((d, i) => {
    const ultimo = grupos[grupos.length - 1]
    if (
      ultimo &&
      ultimo.abierto === d.abierto &&
      ultimo.apertura === d.apertura &&
      ultimo.cierre === d.cierre
    ) {
      ultimo.hasta = i
    } else {
      grupos.push({ desde: i, hasta: i, ...d })
    }
  })

  return grupos.map((g) => {
    const textoDias = g.desde === g.hasta
      ? dias[g.desde].label
      : g.hasta === g.desde + 1
        ? `${dias[g.desde].label} y ${dias[g.hasta].label}`
        : `${dias[g.desde].label} a ${dias[g.hasta].label}`
    const textoHorario = g.abierto
      ? `${hora12(g.apertura)} a ${hora12(g.cierre)}`
      : 'Cerrado'
    return `${textoDias} · ${textoHorario}`
  })
}