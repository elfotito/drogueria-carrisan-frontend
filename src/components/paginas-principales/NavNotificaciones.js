// ---------------------------------------------------------------
// Menú de "Páginas Principales" para Notificaciones.
//
// Mismo patrón que NavEstadoCuenta.js: menú propio para esta
// página con los accesos que tienen sentido estando ya adentro
// (ir a órdenes, al chat, a la cuenta) más un grupo "pie" de ayuda.
// ---------------------------------------------------------------

import { Bell, Package, MessageCircle, Settings, MessageCircleQuestion } from 'lucide-react'

export const NAV_NOTIFICACIONES = [
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
    titulo: 'Ayuda',
    pie: true,
    items: [
      { id: 'contacto', to: '/contacto', icono: MessageCircleQuestion, texto: 'Contacto directo' },
    ],
  },
]
