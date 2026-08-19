// ---------------------------------------------------------------
// Menú de "Mis Solicitudes" — usado por <LayoutPaginaPrincipal nav={NAV_COTIZACIONES}>
// en las páginas de esta sección. Mismo patrón que Navpaginasprincipales.js:
// cada pestaña nueva (ampliación de crédito, documentación) se agrega acá
// como un item más de este mismo grupo.
// ---------------------------------------------------------------
import { FileText } from 'lucide-react'

export const NAV_COTIZACIONES = [
  {
    titulo: 'Mis Solicitudes',
    items: [
      { id: 'cotizaciones', to: '/mis-solicitudes/cotizaciones', icono: FileText, texto: 'Cotizaciones' },
{ id: 'requerimientos', to: '/mis-solicitudes/requerimientos', icono: PackagePlus, texto: 'Requerimientos' },
{ id: 'documentos', to: '/mis-solicitudes/documentos', icono: FileCheck, texto: 'Documentos' }
      // TODO: agregar aquí cuando estén listas —
      // { id: 'ampliacion-credito', to: '/mis-solicitudes/ampliacion-credito', icono: TrendingUp, texto: 'Ampliación de crédito' },
      // { id: 'documentacion', to: '/mis-solicitudes/documentacion', icono: FileCheck, texto: 'Documentación' },
    ],
  },
]