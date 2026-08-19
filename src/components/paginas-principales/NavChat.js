// ---------------------------------------------------------------
// Nav para ChatCentro.jsx (Centro de Comunicaciones).
//
// Mismo patrón que Navpaginasprincipales.js: se le pasa a
// <LayoutPaginaPrincipal nav={NAV_CHAT}>. Es una copia del menú de
// cuenta con el link 'chat' agregado en "Mi actividad" — así la
// página de Chat no depende de tocar el nav compartido, pero el
// usuario sigue viendo el resto de sus links de cuenta.
//
// Si más adelante quieres que "Centro de Comunicaciones" aparezca
// también en el menú del resto de páginas (Mis Órdenes, Pagos, etc.),
// basta con agregar ese mismo item a NAV_PAGINAS_PRINCIPALES y borrar
// este archivo — quedaría redundante.
// ---------------------------------------------------------------

import { Package, Wallet, CreditCard, Settings, MapPin, Star, Bell, HelpCircle, MessageCircle, FileQuestion } from 'lucide-react'

export const NAV_CHAT = [
  {
    titulo: 'Mi actividad',
    items: [
      { id: 'ordenes', to: '/orders', icono: Package, texto: 'Mis órdenes' },
      { id: 'estado-cuenta', to: '/estado-cuenta', icono: Wallet, texto: 'Estado de cuenta' },
      { id: 'pagos', to: '/pagos', icono: CreditCard, texto: 'Pagos' },
      { id: 'chat', to: '/chat', icono: MessageCircle, texto: 'Centro de Comunicaciones' },
    ],
  },
  {
    titulo: 'Mi cuenta',
    items: [
      { id: 'cuenta', to: '/cuenta', icono: Settings, texto: 'Datos de la cuenta' },
      { id: 'direcciones', to: '/direcciones', icono: MapPin, texto: 'Direcciones', soloCliente: true },
      { id: 'mis-items', to: '/mis-items', icono: Star, texto: 'Mis items', soloCliente: true },
      { id: 'notificaciones', to: '/notificaciones', icono: Bell, texto: 'Notificaciones' },
    ],
  },
  {
    titulo: 'Ayuda',
    tipo: 'submenu',
    verTodoTo: '/ayuda',
    items: [
      { id: 'faq', to: '/faq', icono: FileQuestion, texto: 'Preguntas frecuentes' },
      { id: 'ayuda', to: '/ayuda', icono: HelpCircle, texto: 'Cómo usar la plataforma' },
      { id: 'contacto', to: '/contacto', icono: MessageCircle, texto: 'Contacto' },
    ],
  },
]
