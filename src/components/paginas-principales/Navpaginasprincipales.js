// ---------------------------------------------------------------
// Configuración central del menú de "Páginas Principales".
//
// Cada página que use <LayoutPaginaPrincipal /> comparte este mismo
// menú (igual que la columna de "Account" de Walmart aparece en
// Track your order, My items, Privacy, etc.). Para agregar una
// página nueva al sistema, solo hay que:
//   1) Agregar su entrada acá (o reusar una existente)
//   2) Envolver la página con <LayoutPaginaPrincipal activo="id">
//
// El id de cada link debe ser único y es lo que compara
// LayoutPaginaPrincipal para resaltar el ítem activo.
//
// Un grupo normal muestra sus items directo en la lista. Un grupo con
// tipo: 'submenu' se muestra como una sola fila (ej. "Ayuda >") que al
// tocarla abre una pantalla de submenú dentro del mismo drawer/sidebar,
// con botón de volver y un link "Ver todo" (verTodoTo) que manda a la
// página principal de esa sección — igual al "Browse Departments /
// See all" de Walmart.
// ---------------------------------------------------------------
import { Package, Wallet, CreditCard, Settings, MapPin, Star, Bell, HelpCircle, MessageCircle, FileQuestion, ClipboardList } from 'lucide-react'

export const NAV_PAGINAS_PRINCIPALES = [
  {
    titulo: 'Mi actividad',
    items: [
      { id: 'ordenes', to: '/orders', icono: Package, texto: 'Mis órdenes' },
      { id: 'presupuesto', to: '/presupuesto', icono: ClipboardList, texto: 'Presupuesto' },
      { id: 'estado-cuenta', to: '/estado-cuenta', icono: Wallet, texto: 'Estado de cuenta' },
      { id: 'pagos', to: '/pagos', icono: CreditCard, texto: 'Pagos' },
    ],
  },
  {
    titulo: 'Mi cuenta',
    // soloCliente: se ocultan para la vista admin (que usa esta misma
    // pantalla de "Todas las Órdenes" pero no tiene direcciones/items propios)
    items: [
      { id: 'cuenta', to: '/cuenta', icono: Settings, texto: 'Datos de la cuenta' },
      { id: 'direcciones', to: '/direcciones', icono: MapPin, texto: 'Direcciones', soloCliente: true },
      { id: 'mis-items', to: '/mis-items', icono: Star, texto: 'Mis items', soloCliente: true },
      { id: 'notificaciones', to: '/notificaciones', icono: Bell, texto: 'Notificaciones' },
    ],
  },
  {
    titulo: 'Ayuda',
    // TODO(Tito): cuando esté lista la reestructuración de Ayuda, este es
    // el lugar para agregar las secciones reales (cada una con su propio
    // "to") y ajustar verTodoTo si la landing de Ayuda cambia de ruta.
    tipo: 'submenu',
    verTodoTo: '/ayuda',
    items: [
      { id: 'faq', to: '/faq', icono: FileQuestion, texto: 'Preguntas frecuentes' },
      { id: 'ayuda', to: '/ayuda', icono: HelpCircle, texto: 'Cómo usar la plataforma' },
      { id: 'contacto', to: '/contacto', icono: MessageCircle, texto: 'Contacto' },
    ],
  },
]