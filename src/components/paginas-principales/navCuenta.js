// ---------------------------------------------------------------
// Menú de "Páginas Principales" para Mi Cuenta.
//
// Antes Mi Cuenta usaba el nav por defecto de LayoutPaginaPrincipal
// (navPaginasPrincipales.js), que en realidad se armó pensando en Mis
// Órdenes — acá todas las páginas de cuenta lo compartían sin poder
// diferenciarse. Este archivo lo desacopla: mismo contenido completo
// de cuenta hoy, pero editable de forma independiente sin afectar a
// Mis Órdenes / Estado de Cuenta / Pagos, que se quedan con el nav
// por defecto.
//
// Mismas reglas que navPaginasPrincipales.js:
//   - soloCliente oculta el item en la vista admin.
//   - tipo: 'submenu' + verTodoTo abre la pantalla de submenú (Ayuda).
// ---------------------------------------------------------------
import { Package, Wallet, CreditCard, Settings, MapPin, Star, Bell, HelpCircle, MessageCircle, FileQuestion } from 'lucide-react'

export const NAV_CUENTA = [
  {
    titulo: 'Mi actividad',
    items: [
      { id: 'ordenes', to: '/orders', icono: Package, texto: 'Mis órdenes' },
      { id: 'estado-cuenta', to: '/estado-cuenta', icono: Wallet, texto: 'Estado de cuenta' },
      { id: 'pagos', to: '/pagos', icono: CreditCard, texto: 'Pagos' },
    ],
  },
  {
    titulo: 'Mi cuenta',
    // soloCliente: se ocultan para la vista admin (no tiene direcciones/items propios)
    items: [
      { id: 'cuenta', to: '/cuenta', icono: Settings, texto: 'Datos de la cuenta' },
      { id: 'direcciones', to: '/direcciones', icono: MapPin, texto: 'Direcciones', soloCliente: true },
      { id: 'mis-items', to: '/mis-items', icono: Star, texto: 'Mis items', soloCliente: true },
      { id: 'notificaciones', to: '/notificaciones', icono: Bell, texto: 'Notificaciones' },
    ],
  },
  {
    titulo: 'Ayuda',
    // TODO(Tito): mismo pendiente que en navPaginasPrincipales.js — cuando
    // esté lista la reestructuración de Ayuda, agregar las secciones reales acá.
    tipo: 'submenu',
    verTodoTo: '/ayuda',
    items: [
      { id: 'faq', to: '/faq', icono: FileQuestion, texto: 'Preguntas frecuentes' },
      { id: 'ayuda', to: '/ayuda', icono: HelpCircle, texto: 'Cómo usar la plataforma' },
      { id: 'contacto', to: '/contacto', icono: MessageCircle, texto: 'Contacto' },
    ],
  },
]
