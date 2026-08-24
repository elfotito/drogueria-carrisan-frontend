// Reemplaza la sección de items filtrados con esto:
{itemsFiltrados.length > 0 && (
  <div className="ayuda-busqueda-bloque">
    <h3>Artículos e Guías</h3>
    <div className="ayuda-lista">
      {itemsFiltrados.map((item) => (
        <button
          key={item.slug}
          type="button"
          className="ayuda-fila"
          onClick={() => setModalKey(`item/${item.slug}`)}
        >
          <span className="ayuda-fila__icono-circulo">{ICONOS.pedido}</span>
          <span className="ayuda-fila__texto">
            <span className="ayuda-fila__titulo">{item.label}</span>
            <span className="ayuda-fila__desc">{item.desc}</span>
          </span>
          <span className="ayuda-fila__chevron">{ICONOS.chevron}</span>
        </button>
      ))}
    </div>
  </div>
)}

// Reemplaza la sección de categoría activa con esto:
{categoria.esFaq ? (
  <FaqAcordeon />
) : (
  <div className="ayuda-lista">
    {categoria.items.map((item) => (
      <button
        key={item.slug}
        type="button"
        className="ayuda-fila"
        onClick={() => setModalKey(`${categoria.id}/${item.slug}`)}
      >
        <span className="ayuda-fila__icono-circulo">{ICONOS[categoria.icono]}</span>
        <span className="ayuda-fila__texto">
          <span className="ayuda-fila__titulo">{item.label}</span>
          <span className="ayuda-fila__desc">{item.desc}</span>
        </span>
        <span className="ayuda-fila__chevron">{ICONOS.chevron}</span>
      </button>
    ))}
  </div>
)}