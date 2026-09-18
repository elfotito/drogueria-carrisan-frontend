// Imágenes conceptuales de las categorías de la tienda para el carrusel
// "Explorá por categoría" (Home) y los chips del catálogo.
//
// Las 16 categorías de la BD (`categorias_tienda.id`) mapean a un archivo
// `categorias/<id>.png` en el bucket `crsnimages` de Supabase Storage.
// Si la categoría NO tiene imagen, el carrusel vuelve al ícono Lucide (fallback).
//
// Para agregar: subir la imagen a `categorias/<id>.png` y añadir el id a la
// lista CATEGORIAS_CON_IMAGEN. Orden/counts no importan acá: la posición de la
// tarjeta la define `categorias_tienda.orden` del backend.

const BASE_IMG = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'

export const CATEGORIAS_CON_IMAGEN = [
  'analgesicos',
  'cardiovascular',
  'antidiabeticos',
  'digestivo',
  'vitaminas',
  'nervioso',
  'alergia',
  'respiratorio',
  'tos-resfriado',
  'piel',
  'ojos-oidos',
  'antiinfecciosos',
  'antiparasitarios',
  'salud-femenina',
  'salud-masculina',
  'hospitalario',
]

// Devuelve la URL de la imagen conceptual de una categoría, o null si no tiene.
export function imagenParaCategoria(categoriaId) {
  if (!CATEGORIAS_CON_IMAGEN.includes(categoriaId)) return null
  return `${BASE_IMG}/categorias/${categoriaId}.png`
}