// Logos de laboratorios para el carrusel "Explorá por laboratorio" (Home).
//
// La BD guarda `productos.laboratorio` con el fabricante real del registro INHRR,
// que suele tener variantes por marca (ej. "BAYER A.G.", "BAYER DE VENEZUELA, S.A.",
// "PFIZER VENEZUELA, S.A."). Cada clave de este mapa es un TOKEN que se busca DENTRO
// del nombre del laboratorio (insensible a mayúsculas) para decidir qué logo mostrar
// y qué etiqueta corta usar. Si un laboratorio no coincide con ninguna clave, la
// tarjeta cae en el ícono de fallback (FlaskConical) y muestra el nombre tal cual.
//
// Imágenes: bucket `crsnimages` de Supabase Storage, carpeta /logos/.
// Nombre de archivo = la clave del mapa + .png (ej. bayer.png, roche.png).

const BASE_IMG = 'https://fqeshthtycmzgyibiurq.supabase.co/storage/v1/object/public/crsnimages'

export const LOGOS_LABORATORIOS = {
  bayer: { logo: `${BASE_IMG}/logos/bayer.png`, nombre: 'Bayer' },
  roche: { logo: `${BASE_IMG}/logos/roche.png`, nombre: 'Roche' },
  pfizer: { logo: `${BASE_IMG}/logos/pfizer.png`, nombre: 'Pfizer' },
  gsk: { logo: `${BASE_IMG}/logos/gsk.png`, nombre: 'GSK' },
  sanofi: { logo: `${BASE_IMG}/logos/sanofi.png`, nombre: 'Sanofi' },
  astrazeneca: { logo: `${BASE_IMG}/logos/astrazeneca.png`, nombre: 'AstraZeneca' },
  merck: { logo: `${BASE_IMG}/logos/merck.png`, nombre: 'Merck' },
  novartis: { logo: `${BASE_IMG}/logos/novartis.png`, nombre: 'Novartis' },
}

// Normaliza un nombre para la búsqueda de tokens (minúsculas + sin acentos).
export function normalizarLab(nombre) {
  return (nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Devuelve { logo, nombre } si el laboratorio coincide con alguna clave,
// o null si no tiene logo (se usa el fallback en la tarjeta).
export function logoParaLaboratorio(laboratorio) {
  const norm = normalizarLab(laboratorio)
  const clave = Object.keys(LOGOS_LABORATORIOS).find((k) => norm.includes(k))
  return clave ? LOGOS_LABORATORIOS[clave] : null
}