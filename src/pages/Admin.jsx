import { useState } from 'react'
import TasaCambio from '../components/admin/TasaCambio'
import OrdenesAdmin from '../components/admin/OrdenesAdmin'
import ProductosAdmin from '../components/admin/ProductosAdmin'
import UsuariosAdmin from '../components/admin/UsuariosAdmin'
import EstadoCuentaAdmin from '../components/admin/EstadoCuentaAdmin'
import DescuentosPanel from './DescuentosAdmin'

function Admin() {
  const [seccionActiva, setSeccionActiva] = useState('tasa')

  return (
    <div>
      <h1>Panel de Administración</h1>

      <nav className="admin-tabs">
        <button onClick={() => setSeccionActiva('productos')}>Productos</button>
        <button onClick={() => setSeccionActiva('tasa')}>Tasa de Cambio</button>
        <button onClick={() => setSeccionActiva('ordenes')}>Órdenes</button>
        <button onClick={() => setSeccionActiva('usuarios')}>Usuarios</button>
        <button onClick={() => setSeccionActiva('estadoCuenta')}>Estado de Cuenta</button>
        <button onClick={() => setSeccionActiva('descuentos')}>Descuentos</button>
      </nav>

      <div className="admin-content">
        {seccionActiva === 'tasa' && <TasaCambio />}
        {seccionActiva === 'productos' && <ProductosAdmin />}
        {seccionActiva === 'ordenes' && <OrdenesAdmin />}
        {seccionActiva === 'usuarios' && <UsuariosAdmin />}
        {seccionActiva === 'estadoCuenta' && <EstadoCuentaAdmin />}
        {seccionActiva === 'descuentos' && <DescuentosPanel />}
      </div>
    </div>
  )
}

export default Admin