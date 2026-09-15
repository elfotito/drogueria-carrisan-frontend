// Guarda contra fallos de Web Storage en Safari navegación privada /
// cookies bloqueadas (getItem/setItem lanzan SecurityError o QuotaExceededError).
// Si falla, degrada sin romper la app.

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch { /* no hacer nada */ }
}