import { Link } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, ShieldCheck, ArrowRight, Landmark } from 'lucide-react'
import { useStaffAuth } from '../../context/StaffAuthContext'
import staffApi from '../../api/staffAxios'
import { DEPARTAMENTOS, MODULOS, ROLES_BRIDGE_ADMIN } from '../../components/staff/NavStaff'
import './StaffDashboard.css'

const ICONOS_MAPA = {}
for (const depto of DEPARTAMENTOS) {
  for (const grupo of MODULOS[depto.id] || []) {
    for (const item of grupo.items) {
      ICONOS_MAPA[item.id] = item.icono
    }
  }
}

function StaffDashboard() {
  const { staff, logoutStaff } = useStaffAuth()
  const [entrandoAAdmin, setEntrandoAAdmin] = useState(false)
  const [errorBridge, setErrorBridge] = useState('')
  const rol = staff?.rol

  const puedeBridge = ROLES_BRIDGE_ADMIN.includes(rol)

  // Departamentos con módulos visibles para el rol (para filtrar tarjetas).
  const departamentos = DEPARTAMENTOS
    .map((depto) => {
      const modulos = (MODULOS[depto.id] || [])
        .flatMap((grupo) => grupo.items)
        .filter((item) => item.roles.includes(rol))
      return { ...depto, modulos }
    })
    .filter((depto) => depto.modulos.length > 0)

  const iniciales = (staff?.nombre || staff?.email || '?').trim().charAt(0).toUpperCase()

  async function entrarAAdmin() {
    setErrorBridge('')
    setEntrandoAAdmin(true)
    try {
      const { data } = await staffApi.post('/staff/admin-bridge')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/admin'
    } catch (err) {
      setErrorBridge(err.response?.data?.error || 'No se pudo entrar al panel administrativo')
      setEntrandoAAdmin(false)
    }
  }

  return (
    <div className="sd-wrap">
      <header className="sd-topbar">
        <div className="sd-brand">
          <span className="sd-brand__logo"><Landmark size={20} /></span>
          <span className="sd-brand__nombre">Drogueria Carrisan</span>
        </div>
        <div className="sd-usuario">
          <span className="sd-usuario__avatar">{iniciales}</span>
          <div className="sd-usuario__texto">
            <p className="sd-usuario__nombre">{staff?.nombre || 'Staff'}</p>
            <p className="sd-usuario__rol">{rol}</p>
          </div>
          <button className="sd-logout" onClick={logoutStaff} aria-label="Cerrar sesión">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="sd-hero">
        <div className="sd-hero__glow" aria-hidden="true" />
        <div className="sd-hero__content">
          <p className="sd-hero__eyebrow">Panel interno</p>
          <h1 className="sd-hero__titulo">
            Hola, <span>{staff?.nombre?.split(' ')[0] || 'Staff'}</span>
          </h1>
          <p className="sd-hero__sub">Elige un departamento para comenzar tu jornada.</p>
        </div>
      </div>

      {errorBridge && <p className="sd-error">{errorBridge}</p>}

      <main className="sd-main">
        <div className="sd-grid">
          {departamentos.map((depto) => {
            const Icono = depto.icono
            return (
              <Link
                key={depto.id}
                to={`/staff/${depto.id}`}
                className="sd-card"
                style={{
                  '--sd-card-color': depto.color,
                  '--sd-card-color-soft': depto.colorLight,
                }}
              >
                <div className="sd-card__fondo" aria-hidden="true" />
                <div className="sd-card__cab">
                  <span className="sd-card__icono"><Icono size={26} /></span>
                  <ArrowRight size={18} className="sd-card__flecha" />
                </div>
                <h2 className="sd-card__nombre">{depto.nombre}</h2>
                <p className="sd-card__desc">{depto.descripcion}</p>
                <div className="sd-card__menu">
                  {depto.modulos.map((m) => {
                    const IconoModulo = ICONOS_MAPA[m.id]
                    return (
                      <span key={m.id} className="sd-card__chip">
                        {IconoModulo && <IconoModulo size={13} />}
                        {m.texto}
                      </span>
                    )
                  })}
                </div>
              </Link>
            )
          })}
        </div>

        {puedeBridge && (
          <div className="sd-admin">
            <div className="sd-admin__info">
              <span className="sd-admin__icono"><ShieldCheck size={20} /></span>
              <div>
                <p className="sd-admin__titulo">Panel administrativo</p>
                <p className="sd-admin__sub">Gestión global de la plataforma</p>
              </div>
            </div>
            <button
              type="button"
              className="sd-admin__btn"
              onClick={entrarAAdmin}
              disabled={entrandoAAdmin}
            >
              {entrandoAAdmin ? 'Entrando...' : 'Entrar'}
              {!entrandoAAdmin && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default StaffDashboard