import {
  Pill, HeartPulse, Activity, Utensils, Citrus, Brain, Flower2, Wind,
  Thermometer, HandHeart, Eye, ShieldPlus, Bug, Venus, Mars, Cross, LayoutGrid,
} from 'lucide-react'

// Mapeo icono (nombre Lucide guardado en categorias_tienda.icono) → componente.
// Los nombres vienen del seed de la migración 032: agregar acá cualquier icono nuevo
// que se use en categorias_tienda. Fallback genérico: LayoutGrid.
export const ICONOS_CATEGORIAS = {
  Pill, HeartPulse, Activity, Utensils, Citrus, Brain, Flower2, Wind,
  Thermometer, HandHeart, Eye, ShieldPlus, Bug, Venus, Mars, Cross, LayoutGrid,
}

export const ICONO_CATEGORIA_FALLBACK = LayoutGrid