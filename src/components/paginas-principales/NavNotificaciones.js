// ---------------------------------------------------------------
// Menú de "Páginas Principales" para Notificaciones.
//
// Mismo patrón que NavEstadoCuenta.js: menú propio para esta
// página con los accesos que tienen sentido estando ya adentro
// (ir a órdenes, al chat, a la cuenta) más un grupo "pie" de ayuda.
// ---------------------------------------------------------------

import { Bell, Package, MessageCircle, Settings, MessageCircleQuestion, SlidersHorizontal, FileQuestion } from 'lucide-react'
import {
  CATEGORIAS,
  ORDEN_CATEGORIAS,
} from '../../utils/notificacionesCatalogo'

export function NAV_NOTIFICACIONES({ silenciadas = [], onToggleSilenciar }) {
  return [
    {
      titulo: 'Notificaciones',
      items: [
        { id: 'notificaciones', to: '/notificaciones', icono: Bell, texto: 'Todas' },
        { id: 'ordenes', to: '/orders', icono: Package, texto: 'Mis órdenes' },
        { id: 'chat', to: '/chat', icono: MessageCircle, texto: 'Centro de Comunicaciones' },
        { id: 'cuenta', to: '/cuenta', icono: Settings, texto: 'Datos de la cuenta' },
      ],
    },
    {
      titulo: 'Preferencias',
      tipo: 'submenu',
      icono: SlidersHorizontal,
      items: ORDEN_CATEGORIAS.map((catId) => {
        const cat = CATEGORIAS[catId]
        return {
          id: `pref-${catId}`,
          accion: `toggle-preferencia-${catId}`,
          icono: cat.icono,
          texto: cat.nombre,
          silenciada: silenciadas.includes(catId),
          color: cat.color,
          onToggle: () => onToggleSilenciar?.(catId, !silenciadas.includes(catId)),
        }
      }),
    },
    {
      titulo: 'Ayuda',
      pie: true,
      items: [
        { id: 'faq-noti', to: '/ayuda', icono: FileQuestion, texto: 'Preguntas frecuentes' },
        { id: 'contacto', to: '/contacto', icono: MessageCircleQuestion, texto: 'Contacto directo' },
      ],
    },
  ]
}
