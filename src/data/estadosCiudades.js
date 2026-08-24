/**
 * Estados y ciudades/municipios principales de Venezuela.
 * Usado por el selector dependiente Estado → Ciudad en los formularios
 * de registro (Institucional, Profesional, Honorífico).
 *
 * "Ciudades" acá incluye tanto capitales como municipios/poblaciones
 * relevantes para logística de entrega — no es un listado exhaustivo
 * de cada parroquia, sino de las localidades donde razonablemente
 * puede estar una clínica, farmacia o profesional cliente.
 */

export const ESTADOS_VENEZUELA = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
]

export const CIUDADES_POR_ESTADO = {
  'Amazonas': ['Puerto Ayacucho'],
  'Anzoátegui': ['Barcelona', 'Puerto La Cruz', 'Lechería', 'El Tigre', 'Anaco', 'Guanta'],
  'Apure': ['San Fernando de Apure', 'Guasdualito', 'Achaguas'],
  'Aragua': ['Maracay', 'Turmero', 'La Victoria', 'Cagua', 'El Limón', 'Palo Negro'],
  'Barinas': ['Barinas', 'Barinitas', 'Socopó'],
  'Bolívar': ['Ciudad Bolívar', 'Puerto Ordaz', 'Upata', 'Ciudad Guayana', 'Santa Elena de Uairén'],
  'Carabobo': ['Valencia', 'Puerto Cabello', 'Guacara', 'Naguanagua', 'San Diego', 'Los Guayos'],
  'Cojedes': ['San Carlos', 'Tinaco', 'Tinaquillo'],
  'Delta Amacuro': ['Tucupita'],
  'Distrito Capital': ['Caracas'],
  'Falcón': ['Coro', 'Punto Fijo', 'Santa Ana de Coro', 'Tucacas', 'Chichiriviche'],
  'Guárico': ['San Juan de los Morros', 'Valle de la Pascua', 'Calabozo', 'Zaraza'],
  'Lara': ['Barquisimeto', 'Cabudare', 'Carora', 'El Tocuyo', 'Quíbor'],
  'Mérida': ['Mérida', 'El Vigía', 'Ejido', 'Tovar'],
  'Miranda': ['Los Teques', 'Guarenas', 'Guatire', 'Petare', 'Charallave', 'Ocumare del Tuy', 'Cúa', 'Higuerote'],
  'Monagas': ['Maturín', 'Punta de Mata', 'Caripito'],
  'Nueva Esparta': ['Porlamar', 'La Asunción', 'Pampatar', 'Juan Griego'],
  'Portuguesa': ['Guanare', 'Acarigua', 'Araure', 'Turén'],
  'Sucre': ['Cumaná', 'Carúpano', 'Güiria'],
  'Táchira': ['San Cristóbal', 'Táriba', 'La Grita', 'Rubio', 'San Antonio del Táchira'],
  'Trujillo': ['Trujillo', 'Valera', 'Boconó'],
  'Vargas': ['La Guaira', 'Catia La Mar', 'Macuto', 'Maiquetía'],
  'Yaracuy': ['San Felipe', 'Yaritagua', 'Chivacoa'],
  'Zulia': ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Santa Bárbara del Zulia', 'Machiques', 'San Francisco']
}

export function obtenerCiudades(estado) {
  return CIUDADES_POR_ESTADO[estado] || []
}