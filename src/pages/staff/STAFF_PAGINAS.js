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
import StaffPedidos from './StaffPedidos'
import StaffEnvios from './StaffEnvios'
import StaffOrdenes from './StaffOrdenes'
import StaffSolicitudes from './StaffSolicitudes'
import StaffPresupuestos from './StaffPresupuestos'
import StaffFacturacion from './StaffFacturacion'
import StaffCuentasPorCobrar from './StaffCuentasPorCobrar'
import StaffOrdenesPorCancelar from './StaffOrdenesPorCancelar'
import StaffPromociones from './StaffPromociones'
import StaffPrecios from './StaffPrecios'
import StaffDirecciones from './StaffDirecciones'
import StaffCredito from './StaffCredito'
import StaffTesoreria from './StaffTesoreria'
import StaffReportesFinancieros from './StaffReportesFinancieros'
import StaffClientes from './StaffClientes'

export const STAFF_PAGINAS = {
  pedidos: StaffPedidos,
  envios: StaffEnvios,
  ordenes: StaffOrdenes,
  ventas: StaffFacturacion,
  'cuentas-por-cobrar': StaffCuentasPorCobrar,
  'ordenes-por-cancelar': StaffOrdenesPorCancelar,
  solicitudes: StaffSolicitudes,
  presupuestos: StaffPresupuestos,
  promociones: StaffPromociones,
  precios: StaffPrecios,
  direcciones: StaffDirecciones,
  credito: StaffCredito,
  tesoreria: StaffTesoreria,
  'reportes-financieros': StaffReportesFinancieros,
  clientes: StaffClientes,
}
