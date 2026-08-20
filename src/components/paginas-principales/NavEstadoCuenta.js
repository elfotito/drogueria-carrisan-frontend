// ---------------------------------------------------------------
// Menú de "Páginas Principales" para Estado de Cuenta.
//
// Mismo patrón que NavItems.js / NavCotizaciones.js: un menú propio
// para esta página en vez del NAV_CUENTA genérico, con los accesos
// que tienen sentido estando ya adentro del estado de cuenta
// (historial de pagos, facturas, reportes, ampliación) más un grupo
// "pie" de soporte.
// ---------------------------------------------------------------
import { DollarSign, FileText, FileBarChart, TrendingUp, Wallet, MessageCircle } from 'lucide-react'

export const NAV_ESTADO_CUENTA = [
  {
    titulo: 'Estado de cuenta',
    items: [
      { id: 'estado-cuenta', to: '/estado-cuenta', icono: Wallet, texto: 'Resumen' },
      { id: 'pagos', to: '/estado-cuenta/pagos', icono: DollarSign, texto: 'Historial de pagos' },
      { id: 'facturas', to: '/estado-cuenta/facturas', icono: FileText, texto: 'Historial de facturas' },
      { id: 'reportes', to: '/estado-cuenta/reportes', icono: FileBarChart, texto: 'Reportes' },
      { id: 'ampliacion', to: '/estado-cuenta/ampliacion', icono: TrendingUp, texto: 'Solicitar ampliación' },
    ],
  },
  {
    titulo: 'Ayuda',
    pie: true,
    items: [
      { id: 'contacto', to: '/contacto', icono: MessageCircle, texto: 'Contacto directo' },
    ],
  },
]
