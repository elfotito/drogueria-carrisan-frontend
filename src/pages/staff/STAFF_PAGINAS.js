// ---------------------------------------------------------------
// Mapa id-de-módulo → componente de página para las páginas de
// trabajo del staff. Las rutas se generan desde MODULOS (NavStaff.js)
// y consultan ESTE mapa; si un módulo no está aquí, su ruta cae en
// StaffModuloPlaceholder ("en construcción") automáticamente.
//
// Agregar un módulo nuevo:
//   1. item en MODULOS (NavStaff.js) con su `to`, `icono`, `roles`
//   2. si ya tiene página real → registrala aquí
//   3. (la tarjeta del hub, el sidebar y la ruta aparecen solos)
// ---------------------------------------------------------------
import StaffAlmacen from './StaffAlmacen'
import StaffDespacho from './StaffDespacho'
import StaffOrdenes from './StaffOrdenes'
import StaffVentas from './StaffVentas'
import StaffCuentasPorCobrar from './StaffCuentasPorCobrar'
import StaffPagos from './StaffPagos'
import StaffOrdenesPorCancelar from './StaffOrdenesPorCancelar'

export const STAFF_PAGINAS = {
  almacen: StaffAlmacen,
  despacho: StaffDespacho,
  ordenes: StaffOrdenes,
  ventas: StaffVentas,
  'cuentas-por-cobrar': StaffCuentasPorCobrar,
  pagos: StaffPagos,
  'ordenes-por-cancelar': StaffOrdenesPorCancelar,
}