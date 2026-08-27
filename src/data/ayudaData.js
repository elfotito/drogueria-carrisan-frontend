import rastrear from './ayuda/rastrear'
import editarCancelar from './ayuda/editarCancelar'
import sustituciones from './ayuda/sustituciones'
import cancelados from './ayuda/cancelados'
import retrasados from './ayuda/retrasados'
import faltantes from './ayuda/faltantes'
import noRecibido from './ayuda/noRecibido'
import volverAPedir from './ayuda/volverAPedir'
import crearEditarCuenta from './ayuda/crearEditarCuenta'
import recuperarContrasena from './ayuda/recuperarContrasena'
import estadoDeCuenta from './ayuda/estadoDeCuenta'
import metodosPago from './ayuda/metodosPago'
import facturas from './ayuda/facturas'
import problemasPago from './ayuda/problemasPago'

const ayudaData = {
  'pedido/rastrear': rastrear,
  'pedido/editar-cancelar': editarCancelar,
  'pedido/sustituciones': sustituciones,
  'pedido/cancelados': cancelados,
  'pedido/retrasados': retrasados,
  'pedido/faltantes': faltantes,
  'pedido/no-recibido': noRecibido,
  'pedido/volver-a-pedir': volverAPedir,
  'cuenta/crear-editar': crearEditarCuenta,
  'cuenta/recuperar-contrasena': recuperarContrasena,
  'cuenta/estado-de-cuenta': estadoDeCuenta,
  'pagos/metodos': metodosPago,
  'pagos/facturas': facturas,
  'pagos/problemas': problemasPago,
}

export default ayudaData
