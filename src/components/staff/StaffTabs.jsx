import './StaffTabs.css'

// ---------------------------------------------------------------
// <StaffTabs tabs=[{id, texto, contador?}] activo="..." onChange={...} />
//
// Tabs reutilizables para las páginas de trabajo del staff. El
// color de los tabs activos se toma de --ldep-color (inyectado por
// LayoutDepartamento), por lo que cada departamento se pinta con
// su propio color automáticamente.
// ---------------------------------------------------------------
export default function StaffTabs({ tabs, activo, onChange }) {
  return (
    <div className="staff-tabs" role="tablist">
      {tabs.map((tab) => {
        const esActivo = tab.id === activo
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={esActivo}
            className={`staff-tab ${esActivo ? 'staff-tab--activo' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.texto}
            {typeof tab.contador === 'number' && tab.contador > 0 && (
              <span className="staff-tab__contador">{tab.contador}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}