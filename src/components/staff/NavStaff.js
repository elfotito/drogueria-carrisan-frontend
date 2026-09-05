// ---------------------------------------------------------------
// Menú de navegación para el módulo staff (/staff/*).
//
// Reorganizado en 3 departamentos con metadata propia (color,
// icono, descripción). El dashboard usa DEPARTAMENTOS para
// renderizar tarjetas; las páginas usan MODULOS[] para el sidebar.
//
// Cada item declara a qué roles es visible (campo "roles").
// Rol 'director' tiene acceso a TODOS los módulos staff.
// ---------------------------------------------------------------
import {
  LayoutDashboard, PackageCheck, ClipboardList, ShoppingCart,
  Wallet, Landmark, TrendingUp, Truck, Receipt, Banknote, CalendarX2,
} from 'lucide-react'

const ROLES_TODOS = ['vendedor', 'despachador', 'almacenista', 'contabilidad', 'administrador', 'director', 'admin']

// -----------------------------------------------------------------
// Departamentos — definición visual para el dashboard
// -----------------------------------------------------------------
export const DEPARTAMENTOS = [
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    descripcion: 'Contabilidad, crédito, cobranza y estados financieros',
    color: '#0D9373',
    colorStrong: '#0B7A5F',
    colorLight: '#E8F5F1',
    icono: Landmark,
  },
  {
    id: 'comercial',
    nombre: 'Comercial',
    descripcion: 'Ventas, pedidos, marketing y relación con clientes',
    color: '#2563EB',
    colorStrong: '#1D4ED8',
    colorLight: '#EFF6FF',
    icono: TrendingUp,
  },
  {
    id: 'logistica',
    nombre: 'Logística',
    descripcion: 'Almacén, preparación, despacho y operaciones',
    color: '#D97706',
    colorStrong: '#B45309',
    colorLight: '#FFFBEB',
    icono: Truck,
  },
]

// -----------------------------------------------------------------
// Módulos — items de navegación agrupados por departamento
// (usados por el sidebar del LayoutDepartamento)
// -----------------------------------------------------------------
export const MODULOS = {
  finanzas: [
    {
      titulo: 'Finanzas',
      items: [
        {
          id: 'ventas',
          to: '/staff/ventas',
          icono: Receipt,
          texto: 'Ventas y facturación',
          desc: 'Emite y anula facturas, notas de crédito y débito',
          roles: ['contabilidad', 'administrador', 'director', 'admin'],
        },
        {
          id: 'cuentas-por-cobrar',
          to: '/staff/cuentas-por-cobrar',
          icono: Banknote,
          texto: 'Cuentas por cobrar',
          desc: 'Clientes con línea de crédito y su estado de cuenta',
          roles: ['contabilidad', 'administrador', 'director', 'admin'],
        },
        {
          id: 'pagos',
          to: '/staff/pagos',
          icono: Wallet,
          texto: 'Pagos',
          desc: 'Registra abonos y verifica reportes de pago',
          roles: ['contabilidad', 'administrador', 'director', 'admin'],
        },
        {
          id: 'ordenes-por-cancelar',
          to: '/staff/ordenes-por-cancelar',
          icono: CalendarX2,
          texto: 'Órdenes por cancelar',
          desc: 'Órdenes contado sin pagar que hay que cancelar',
          roles: ['contabilidad', 'administrador', 'director', 'admin'],
        },
      ],
    },
  ],
  comercial: [
    {
      titulo: 'Comercial',
      items: [
        {
          id: 'ordenes',
          to: '/staff/ordenes',
          icono: ShoppingCart,
          texto: 'Crear orden a cliente',
          desc: 'Arma pedidos a nombre de un cliente y confirma el envío',
          roles: ['vendedor', 'administrador', 'director', 'admin'],
        },
      ],
    },
  ],
  logistica: [
    {
      titulo: 'Logística',
      items: [
        {
          id: 'almacen',
          to: '/staff/almacen',
          icono: PackageCheck,
          texto: 'Preparación de pedidos',
          desc: 'Revisa, aprueba y prepara las órdenes entrantes',
          roles: ['almacenista', 'administrador', 'director', 'admin'],
        },
        {
          id: 'despacho',
          to: '/staff/despacho',
          icono: ClipboardList,
          texto: 'Envíos por despachar',
          desc: 'Cola de envíos en ruta y entregas confirmadas',
          roles: ['despachador', 'administrador', 'director', 'admin'],
        },
      ],
    },
  ],
}

// -----------------------------------------------------------------
// NAV_STAFF legacy — se mantiene para compatibilidad con
// LayoutStaff (sidebar genérico que aún podría usarse)
// -----------------------------------------------------------------
export const NAV_STAFF = [
  {
    titulo: 'General',
    items: [
      { id: 'dashboard', to: '/staff/dashboard', icono: LayoutDashboard, texto: 'Dashboard', roles: ROLES_TODOS },
    ],
  },
  ...MODULOS.logistica,
  ...MODULOS.comercial,
  ...MODULOS.finanzas,
]

// Roles que pueden usar el bridge al panel administrativo del dueño.
export const ROLES_BRIDGE_ADMIN = ['administrador', 'director', 'admin']
