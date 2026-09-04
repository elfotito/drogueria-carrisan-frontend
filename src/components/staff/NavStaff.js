// ---------------------------------------------------------------
// Menú de navegación para el módulo staff (/staff/*).
//
// Cada item navega a una ruta real bajo /staff/* (React Router).
// A diferencia de NAV_ADMIN (que usa sesión de cliente), este menú
// se filtra por staff.rol: cada item declara a qué roles es visible
// (campo "roles").
//
// Rol 'director' tiene acceso a TODOS los módulos staff.
// ---------------------------------------------------------------
import {
  LayoutDashboard, PackageCheck, ClipboardList, ShoppingCart,
  Wallet, CreditCard, FileText, ReceiptText, ShieldCheck,
} from 'lucide-react'

const ROLES_TODOS = ['vendedor', 'despachador', 'almacenista', 'contabilidad', 'administrador', 'director', 'admin']
const ROLES_DIRECTIVOS = ['administrador', 'director', 'admin']

export const NAV_STAFF = [
  {
    titulo: 'General',
    items: [
      { id: 'dashboard', to: '/staff/dashboard', icono: LayoutDashboard, texto: 'Dashboard', roles: ROLES_TODOS },
    ],
  },
  {
    titulo: 'Operación',
    items: [
      {
        id: 'almacen',
        to: '/staff/almacen',
        icono: PackageCheck,
        texto: 'Preparación de pedidos',
        roles: ['almacenista', 'administrador', 'director', 'admin'],
      },
      {
        id: 'despacho',
        to: '/staff/despacho',
        icono: ClipboardList,
        texto: 'Envíos por despachar',
        roles: ['despachador', 'administrador', 'director', 'admin'],
      },
      {
        id: 'ordenes',
        to: '/staff/ordenes',
        icono: ShoppingCart,
        texto: 'Crear orden a cliente',
        roles: ['vendedor', 'administrador', 'director', 'admin'],
      },
    ],
  },
  {
    titulo: 'Contabilidad',
    items: [
      {
        id: 'contabilidad',
        to: '/staff/contabilidad',
        icono: Wallet,
        texto: 'Estado de cuenta, pagos y facturas',
        roles: ['contabilidad', 'administrador', 'director', 'admin'],
      },
    ],
  },
]

// Roles que pueden usar el bridge al panel administrativo del dueño.
export const ROLES_BRIDGE_ADMIN = ['administrador', 'director', 'admin']
