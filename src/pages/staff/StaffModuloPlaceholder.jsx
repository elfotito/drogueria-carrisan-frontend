import { Hammer } from 'lucide-react'
import LayoutDepartamento from '../../components/staff/LayoutDepartamento'
import './StaffModuloPlaceholder.css'

// ---------------------------------------------------------------
// <StaffModuloPlaceholder departamento="logistica" activo="inventario" titulo="Inventario" descripcion="..." />
//
// Página genérica "en construcción" para un módulo del staff que
// aún no tiene implementación. Permite registrar el módulo en
// MODULOS + NAV desde el día 1: la tarjeta del hub, el sidebar y
// la ruta funcionan aunque la página real aún no exista.
// ---------------------------------------------------------------
export default function StaffModuloPlaceholder({ departamento, activo, titulo, descripcion }) {
  return (
    <LayoutDepartamento departamento={departamento} activo={activo} titulo={titulo || 'Módulo'}>
      <div className="smp-card">
        <span className="smp-card__icono"><Hammer size={30} /></span>
        <h2 className="smp-card__titulo">{titulo || 'Módulo en construcción'}</h2>
        <p className="smp-card__desc">
          {descripcion || 'Este módulo se está preparando y estará disponible próximamente.'}
        </p>
      </div>
    </LayoutDepartamento>
  )
}