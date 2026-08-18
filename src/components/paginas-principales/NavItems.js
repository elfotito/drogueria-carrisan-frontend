// ---------------------------------------------------------------
// Menú de "Páginas Principales" para Mis Items.
//
// A diferencia de navPaginasPrincipales.js (menú de cuenta, usado por
// Mis Órdenes/Estado de Cuenta/Pagos), este es un ejemplo de menú
// "intercambiable" — se le pasa a <LayoutPaginaPrincipal nav={NAV_ITEMS}>
// en vez del default, mostrando enlaces relevantes para lo que se está
// haciendo en ESTA página, no los de cuenta.
//
// Dos tipos de item, además del link normal (to):
//   - accion: dispara un callback en vez de navegar (ver onAccion en
//     MisItems.jsx). Se usa acá para "Crear lista nueva", que abre el
//     modal en vez de ir a otra ruta.
//   - pie: true en un grupo lo muestra visualmente como footer del
//     menú (separado, más discreto) — para cosas de soporte que no son
//     el foco de la página, como Ayuda/Contacto acá.
// ---------------------------------------------------------------
import { Heart, RotateCcw, ListPlus, ShoppingCart, HelpCircle, MessageCircle } from 'lucide-react'

export const NAV_ITEMS = [
  {
    titulo: 'Mis items',
    items: [
      { id: 'items', to: '/mis-items', icono: Heart, texto: 'Mis favoritos y listas' },
      { id: 'recomprar', to: '/mis-items?tab=recomprar', icono: RotateCcw, texto: 'Comprar de nuevo' },
      { id: 'crear-lista', accion: 'crear-lista', icono: ListPlus, texto: 'Crear lista nueva' },
      { id: 'carrito', to: '/carrito', icono: ShoppingCart, texto: 'Carrito' },
    ],
  },
  {
    titulo: 'Ayuda',
    pie: true,
    items: [
      { id: 'ayuda', to: '/ayuda', icono: HelpCircle, texto: 'Centro de ayuda' },
      { id: 'contacto', to: '/contacto', icono: MessageCircle, texto: 'Contacto' },
    ],
  },
]
