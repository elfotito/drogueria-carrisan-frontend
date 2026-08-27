import { useState, useEffect, useMemo } from 'react'
import { Stat } from '@chakra-ui/react'
import { DollarSign, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import PagoClienteModal from '../components/PagoClienteModal'
import LayoutPaginaPrincipal from '../components/paginas-principales/Layoutpaginaprincipal'
import { NAV_UNIFICADO } from '../components/paginas-principales/NavUnificado'
import './EstadoCuenta.css'

// ---------------------------------------------------------------
// Historial de pagos — migrada de un header propio con back-button
// (patrón móvil viejo) a <LayoutPaginaPrincipal>, mismo dashboard
// bancario que EstadoCuenta.jsx. Reusa las clases .ec-* de ese
// archivo (kpis, buscador, timeline agrupado por fecha) para que se
// sienta como la misma app, no una subpágina aparte.
//
// Los KPIs usan Stat.Root/Label/ValueText de Chakra v3 en vez de
// markup a mano — mismo criterio que Progress en MiCuenta.jsx: es un
// componente aislado que no compite con el layout responsivo propio.
// ---------------------------------------------------------------

function formatUSD(valor) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor || 0)
}

function claveGrupoFecha(fecha) {
  const hoy = new Date()
  const d = new Date(fecha)
  const esMismoDia = (a, b) => a.toDateString() === b.toDateString()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  if (esMismoDia(d, hoy)) return 'Hoy'
  if (esMismoDia(d, ayer)) return 'Ayer'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function PagosEstadoCuenta() {
  const { user } = useAuth()
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api.get(`/clientes/${user.id}/estado-cuenta`)
      .then(({ data }) => setPagos(data.pagos || []))
      .finally(() => setCargando(false))
  }, [user.id])

  const pagosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return pagos
    const termino = busqueda.trim().toLowerCase()
    return pagos.filter((p) =>
      `${p.id}`.includes(termino) || `${p.monto}`.includes(termino)
    )
  }, [pagos, busqueda])

  const gruposPorFecha = useMemo(() => {
    const grupos = {}
    pagosFiltrados.forEach((p) => {
      const clave = claveGrupoFecha(p.created_at)
      if (!grupos[clave]) grupos[clave] = []
      grupos[clave].push(p)
    })
    return grupos
  }, [pagosFiltrados])

  const kpis = useMemo(() => {
    const total = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
    const cantidad = pagos.length
    const promedio = cantidad > 0 ? total / cantidad : 0
    return { total, cantidad, promedio }
  }, [pagos])

  return (
    <LayoutPaginaPrincipal
      activo="pagos"
      titulo="Historial de pagos"
      subtitulo="Todos los pagos que reportaste, en un solo lugar"
      nav={NAV_UNIFICADO}
    >
      <div className="ec-dashboard">
        {cargando ? (
          <div className="ec-estado-cargando">
            <p>Cargando pagos…</p>
          </div>
        ) : (
          <>
            <section className="ec-kpis">
              <Stat.Root className="ec-kpi">
                <Stat.Label className="ec-kpi__label">Total pagado</Stat.Label>
                <Stat.ValueText className="ec-kpi__valor">{formatUSD(kpis.total)}</Stat.ValueText>
              </Stat.Root>
              <Stat.Root className="ec-kpi">
                <Stat.Label className="ec-kpi__label">Pagos reportados</Stat.Label>
                <Stat.ValueText className="ec-kpi__valor">{kpis.cantidad}</Stat.ValueText>
              </Stat.Root>
              <Stat.Root className="ec-kpi">
                <Stat.Label className="ec-kpi__label">Promedio por pago</Stat.Label>
                <Stat.ValueText className="ec-kpi__valor">{formatUSD(kpis.promedio)}</Stat.ValueText>
              </Stat.Root>
            </section>

            <section className="ec-movimientos">
              <div className="ec-movimientos__toolbar">
                <div className="ec-buscador">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por # o monto"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>

              {Object.keys(gruposPorFecha).length === 0 ? (
                <p className="ec-movimientos__vacio">Aún no tienes pagos registrados</p>
              ) : (
                Object.entries(gruposPorFecha).map(([fechaLabel, items]) => (
                  <div key={fechaLabel} className="ec-grupo-fecha">
                    <p className="ec-grupo-fecha__titulo">{fechaLabel}</p>
                    <ul className="ec-movimientos__lista">
                      {items.map((pago) => (
                        <li key={pago.id} className="ec-movimiento" onClick={() => setPagoSeleccionado(pago)}>
                          <div className="ec-movimiento__icono ec-movimiento__icono--pago">
                            <DollarSign size={18} />
                          </div>
                          <div className="ec-movimiento__info">
                            <span className="ec-movimiento__titulo">Pago #{pago.id}</span>
                            <span className="ec-badge ec-badge--registrado">registrado</span>
                          </div>
                          <strong className="ec-movimiento__monto ec-movimiento__monto--verde">
                            +{formatUSD(pago.monto)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>

      {pagoSeleccionado && (
        <PagoClienteModal pago={pagoSeleccionado} onClose={() => setPagoSeleccionado(null)} />
      )}
    </LayoutPaginaPrincipal>
  )
}