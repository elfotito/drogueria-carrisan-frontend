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
import StaffFacturacion from './StaffFacturacion'
import StaffCuentasPorCobrar from './StaffCuentasPorCobrar'
import StaffOrdenesPorCancelar from './StaffOrdenesPorCancelar'
import StaffCotizaciones from './StaffCotizaciones'
import StaffRequerimientos from './StaffRequerimientos'
import StaffDocumentos from './StaffDocumentos'
import StaffPromociones from './StaffPromociones'
import StaffPrecios from './StaffPrecios'
import StaffDirecciones from './StaffDirecciones'
import StaffCredito from './StaffCredito'
import StaffTesoreria from './StaffTesoreria'

export const STAFF_PAGINAS = {
  almacen: StaffAlmacen,
  despacho: StaffDespacho,
  ordenes: StaffOrdenes,
  ventas: StaffFacturacion,
  'cuentas-por-cobrar': StaffCuentasPorCobrar,
  'ordenes-por-cancelar': StaffOrdenesPorCancelar,
  cotizaciones: StaffCotizaciones,
  requerimientos: StaffRequerimientos,
  documentos: StaffDocumentos,
  promociones: StaffPromociones,
  precios: StaffPrecios,
  direcciones: StaffDirecciones,
  credito: StaffCredito,
  tesoreria: StaffTesoreria,
}