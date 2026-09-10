import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import BottomNav from '../components/BottomNav'
import SECCIONES_FICHA from '../config/seccionesFicha'
import './Catalogo.css'
import './RegistroInhrr.css'
import './Vademecum.css'

const POR_PAGINA = 25

const COLOR_CATEGORIA = {
  ME: '#0052DC',
  HO: '#0D9373',
  MM: '#D97706',
  MI: '#6B7280',
}

function nombreCategoria(id) {
  return { ME: 'Medicamentos', HO: 'Hospitalarios', MM: 'Material médico', MI: 'Misceláneos' }[id] || id || '—'
}

function Vademecum() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [termino, setTermino] = useState('')
  const [terminoActivo, setTerminoActivo] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)

  const [molecula, setMolecula] = useState(null)
  const [cargandoFicha, setCargandoFicha] = useState(false)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({})
  const [productosPagina, setProductosPagina] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setTerminoActivo(termino.trim()), 350)
    return () => clearTimeout(t)
  }, [termino])

  // Carga la ficha de la molécula por su id (incluida desde /vademecum/:id)
  const cargarFicha = useCallback(async (molId) => {
    setCargandoFicha(true)
    setMolecula(null)
    setProductosPagina(1)
    setSeccionesAbiertas({})
    try {
      const { data } = await api.get(`/moleculas/moleculas/${molId}`)
      setMolecula(data)
    } catch (err) {
      console.error('Error al cargar la molécula:', err)
      setMolecula({ error: true })
    } finally {
      setCargandoFicha(false)
    }
  }, [])

  // Sincroniza con la ruta /vademecum/:id
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) cargarFicha(id)
  }, [id, cargarFicha])

  // Búsqueda por nombre de molécula
  useEffect(() => {
    if (!terminoActivo || id) return
    let activo = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBuscando(true)
    api
      .get('/moleculas/moleculas', { params: { search: terminoActivo } })
      .then((res) => {
        if (!activo) return
        setResultados(Array.isArray(res.data) ? res.data : [])
        setBusquedaAbierta(true)
      })
      .catch((err) => {
        console.error('Error al buscar moléculas:', err)
        if (activo) {
          setResultados([])
          setBusquedaAbierta(true)
        }
      })
      .finally(() => activo && setBuscando(false))
    return () => {
      activo = false
    }
  }, [terminoActivo, id])

  // Cambio de página de productos dentro de la ficha
  const cambiarPaginaProductos = useCallback(
    async (page) => {
      if (!molecula || molecula.error) return
      const totalPaginas = Math.max(1, (molecula.paginacion || {}).total_paginas || 1)
      if (page < 1 || page > totalPaginas || page === productosPagina) return
      setProductosPagina(page)
      try {
        const { data } = await api.get(`/moleculas/moleculas/${molecula.id}`, {
          params: { pagina: page, por_pagina: POR_PAGINA },
        })
        setMolecula(data)
      } catch (err) {
        console.error('Error al cambiar de página:', err)
      }
    },
    [molecula, productosPagina]
  )

  const abrirMolecula = (m) => {
    setResultados([])
    setBusquedaAbierta(false)
    navigate(`/vademecum/${m.id}`)
  }

  const toggleSeccion = (clave) =>
    setSeccionesAbiertas((prev) => ({ ...prev, [clave]: !prev[clave] }))

  // ---- Render ficha ----
  if (id || (molecula && !busquedaAbierta)) {
    if (cargandoFicha || !molecula) {
      return (
        <div className="vad-hero">
          <div className="vad-hero__inner">
            <p className="inhrr-hero__tag">Vademécum clínico</p>
            <h1 className="inhrr-hero__title">Consultando ficha…</h1>
          </div>
        </div>
      )
    }

    if (molecula.error) {
      return (
        <div className="vad-hero">
          <div className="vad-hero__inner">
            <p className="inhrr-hero__tag">Vademécum clínico</p>
            <h1 className="inhrr-hero__title">Molécula no encontrada</h1>
            <button type="button" className="btn-limpiar-filtros" onClick={() => navigate('/vademecum')}>
              Volver a buscar
            </button>
          </div>
        </div>
      )
    }

    const atcArbol = molecula.atc_arbol || []
    const sinonimos = Array.isArray(molecula.sinonimos) ? molecula.sinonimos : []
    const ficha = molecula.ficha_tecnica
    const productos = molecula.productos || []
    const pag = molecula.paginacion || { total: 0, pagina: 1, total_paginas: 1 }
    const totalPaginas = Math.max(1, pag.total_paginas || 1)
    const enCatalogo = () => navigate(`/catalogo?molecula=${encodeURIComponent(molecula.nombre)}`)

    return (
      <div className="catalogo-layout vad-page">
        <section className="vad-hero">
          <div className="vad-hero__inner">
            <p className="inhrr-hero__tag">Vademécum clínico</p>
            <h1 className="inhrr-hero__title">{molecula.nombre}</h1>
            {molecula.nombre_generico_en && (
              <p className="vad-hero__en">{molecula.nombre_generico_en}</p>
            )}
            {sinonimos.length > 0 && (
              <p className="vad-hero__sinonimos">
                <strong>Sinónimos:</strong> {sinonimos.join(', ')}
              </p>
            )}
            <button
              type="button"
              className="vad-hero__buscar"
              onClick={() => navigate('/vademecum')}
            >
              ← Buscar otra molécula
            </button>
          </div>
        </section>

        {/* Árbol ATC */}
        {atcArbol.length > 0 && (
          <nav className="vad-atc" aria-label="Clasificación ATC">
            {atcArbol.map((n, i) => (
              <span key={n.id || i} className="vad-atc__item">
                {i > 0 && <span className="vad-atc__sep">›</span>}
                <span className="vad-atc__codigo">{n.codigo}</span>
                <span className="vad-atc__nombre">{n.nombre}</span>
              </span>
            ))}
          </nav>
        )}

        <main className="vad-body">
          {/* Botón buscar en catálogo por molécula */}
          <div className="vad-toolbar">
            <button type="button" className="vad-btn-catalogo" onClick={enCatalogo}>
              Buscar en Catálogo
            </button>
          </div>

          {/* Ficha clínica */}
          <section className="vad-seccion">
            <h2 className="vad-seccion__titulo">Ficha clínica</h2>
            {!ficha ? (
              <p className="vad-vacio">Ficha en revisión — aún no disponible para esta molécula.</p>
            ) : (
              <div className="vad-acordeon">
                {SECCIONES_FICHA.map(({ clave, etiqueta, icono }) => {
                  const texto = ficha[clave]
                  if (!texto) return null
                  const abierta = !!seccionesAbiertas[clave]
                  return (
                    <div key={clave} className={`vad-acordeon__item ${abierta ? 'abierta' : ''}`}>
                      <button
                        type="button"
                        className="vad-acordeon__head"
                        onClick={() => toggleSeccion(clave)}
                      >
                        <span className="vad-acordeon__icono">{icono}</span>
                        <span className="vad-acordeon__etiqueta">{etiqueta}</span>
                        <span
                          className="filtro-chevron"
                          style={{ transform: abierta ? 'rotate(180deg)' : 'none' }}
                        >
                          ⌄
                        </span>
                      </button>
                      {abierta && <div className="vad-acordeon__body">{texto}</div>}
                    </div>
                  )
                })}
                {ficha.cima_nregistro && (
                  <p className="vad-fuente">
                    Fuente: {ficha.fuente || 'AEMPS - CIMA (España)'} (nº registro {ficha.cima_nregistro}).
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Productos que contienen la molécula (registro INHRR) */}
          <section className="vad-seccion">
            <h2 className="vad-seccion__titulo">
              Productos que la contienen <span>({pag.total.toLocaleString('es-VE')})</span>
            </h2>
            {productos.length === 0 ? (
              <p className="vad-vacio">Sin productos con registro relacionado.</p>
            ) : (
              <>
                <div className="vad-productos">
                  {productos.map((p) => (
                    <div key={p.sku} className="vad-producto">
                      <div className="vad-producto__info">
                        <span className="vad-producto__nombre">{p.nombre}</span>
                        <span className="vad-producto__meta">{p.laboratorio || 'Lab. no informado'}</span>
                      </div>
                      <span
                        className="vad-producto__categoria"
                        style={{ background: COLOR_CATEGORIA[p.categoria] }}
                      >
                        {nombreCategoria(p.categoria)}
                      </span>
                    </div>
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="inhrr-paginacion">
                    <button
                      type="button"
                      disabled={productosPagina <= 1}
                      onClick={() => cambiarPaginaProductos(productosPagina - 1)}
                    >
                      ←
                    </button>
                    <span>
                      {productosPagina} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      disabled={productosPagina >= totalPaginas}
                      onClick={() => cambiarPaginaProductos(productosPagina + 1)}
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
            <p className="vad-fuente vad-productos__nota">
              Listado informativo del registro sanitario INHRR. Para precios y compra usa “Buscar en Catálogo”.
            </p>
          </section>
        </main>

        <BottomNav />
      </div>
    )
  }

  // ---- Render búsqueda ----
  return (
    <div className="catalogo-layout vad-page">
      <section className="vad-hero">
        <div className="vad-hero__inner">
          <p className="inhrr-hero__tag">Vademécum clínico</p>
          <h1 className="inhrr-hero__title">Vademécum clínico</h1>
          <p className="inhrr-hero__desc">
            Consulta la ficha clínica de los principios activos: indicaciones, posología,
            contraindicaciones y más. Información farmacológica de referencia — no sustituye
            la consulta con un profesional de la salud.
          </p>
          <div className="inhrr-search">
            <span className="inhrr-search__icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por principio activo o molécula (ej. Paracetamol, Amoxicilina…)"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
            />
            {termino !== '' && (
              <button
                type="button"
                className="inhrr-search__clear"
                aria-label="Limpiar búsqueda"
                onClick={() => setTermino('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="vad-body">
        {busquedaAbierta && (
          <section className="vad-seccion">
            <h2 className="vad-seccion__titulo">
              {terminoActivo ? `Resultados para "${terminoActivo}"` : 'Escribe para buscar una molécula'}
            </h2>
            {buscando ? (
              <p className="vad-vacio">Buscando…</p>
            ) : resultados.length === 0 ? (
              <p className="vad-vacio">Sin resultados. Prueba con otro nombre o revisa la ortografía.</p>
            ) : (
              <div className="vad-resultados">
                {resultados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="vad-resultado"
                    onClick={() => abrirMolecula(m)}
                  >
                    <span className="vad-resultado__nombre">{m.nombre}</span>
                    {m.nombre_generico_en && (
                      <span className="vad-resultado__en">{m.nombre_generico_en}</span>
                    )}
                    {m.atc_clasificaciones?.codigo && (
                      <span className="vad-resultado__atc">{m.atc_clasificaciones.codigo}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Vademecum