/**
 * Validadores para autenticación
 * Uso: import { validarEmail, validarPassword, etc } from './validadores'
 */

export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

export function validarPassword(password) {
  // Mínimo 8 caracteres, al menos 1 letra y 1 número
  if (password.length < 8) return { valido: false, error: 'Mínimo 8 caracteres' }
  if (!/[a-zA-Z]/.test(password)) return { valido: false, error: 'Debe contener al menos una letra' }
  if (!/[0-9]/.test(password)) return { valido: false, error: 'Debe contener al menos un número' }
  return { valido: true, error: '' }
}

/**
 * RIF Médico: V-1234567 o E-1234567
 * 7-9 dígitos después del prefijo
 */
export function validarRifMedico(prefijo, numeros) {
  if (!prefijo || !['V', 'E'].includes(prefijo)) {
    return { valido: false, error: 'Selecciona V o E' }
  }
  const cantDigitos = numeros.length
  if (cantDigitos < 7 || cantDigitos > 9) {
    return { valido: false, error: `${cantDigitos} dígitos. Debe ser entre 7 y 9` }
  }
  return { valido: true, error: '', rifFormateado: `${prefijo}${numeros}` }
}

/**
 * RIF Institución: J-123456789-2 (siempre 9 dígitos + 1 dígito verificador)
 */
export function validarRifInstitucion(numeros) {
  const cantDigitos = numeros.length
  if (cantDigitos !== 9) {
    return { valido: false, error: `${cantDigitos} dígitos. Debe ser exactamente 9` }
  }
  // El último dígito es el verificador (usuario lo ingresa como parte de los 9)
  const rifFormateado = `J-${numeros.slice(0, 8)}-${numeros.slice(8)}`
  return { valido: true, error: '', rifFormateado }
}

/**
 * Teléfono Venezuela
 * Código (414, 424, 412, 422, 416, 426) + 7 dígitos
 */
export function validarTelefonoVenezuela(codigo, digitos) {
  const codigosValidos = ['414', '424', '412', '422', '416', '426']
  
  if (!codigo || !codigosValidos.includes(codigo)) {
    return { valido: false, error: 'Selecciona un código válido' }
  }
  
  if (digitos.length !== 7) {
    return { valido: false, error: `${digitos.length} dígitos. Debe ser exactamente 7` }
  }
  
  return { valido: true, error: '', telefonoFormateado: `${codigo}${digitos}` }
}

/**
 * Nombre completo (médico)
 * Retorna: "Dr Mario Balotelli"
 */
export function validarNombreMedico(titulo, nombre, apellido) {
  if (!titulo || !nombre || !apellido) {
    return { valido: false, error: 'Completa todos los campos del nombre' }
  }
  const nombreCompleto = `${titulo} ${nombre} ${apellido}`
  return { valido: true, error: '', nombreFormateado: nombreCompleto }
}

/**
 * Dirección fiscal (texto, máximo 500 caracteres)
 */
export function validarDireccion(direccion) {
  const trimmed = direccion.trim()
  if (trimmed.length < 10) {
    return { valido: false, error: 'Ingresa una dirección más completa' }
  }
  if (trimmed.length > 500) {
    return { valido: false, error: 'La dirección no puede exceder 500 caracteres' }
  }
  return { valido: true, error: '', direccionFormateada: trimmed }
}

/**
 * Nombre institución (exactamente como en RIF)
 */
export function validarNombreInstitucion(nombre) {
  const trimmed = nombre.trim()
  if (trimmed.length < 5) {
    return { valido: false, error: 'Ingresa el nombre completo de la institución' }
  }
  if (trimmed.length > 150) {
    return { valido: false, error: 'El nombre es muy largo' }
  }
  return { valido: true, error: '', nombreFormateado: trimmed }
}
