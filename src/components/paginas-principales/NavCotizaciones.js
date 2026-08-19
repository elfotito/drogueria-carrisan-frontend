import { FileText, PackagePlus, FileCheck } from 'lucide-react'

export const NAV_COTIZACIONES = [
  {
    titulo: 'Mis Solicitudes',
    items: [
      { id: 'cotizaciones', to: '/mis-solicitudes/cotizaciones', icono: FileText, texto: 'Cotizaciones' },
      { id: 'requerimientos', to: '/mis-solicitudes/requerimientos', icono: PackagePlus, texto: 'Requerimientos' },
      { id: 'documentos', to: '/mis-solicitudes/documentos', icono: FileCheck, texto: 'Documentos' },
      // TODO: ampliación de crédito
    ],
  },
]