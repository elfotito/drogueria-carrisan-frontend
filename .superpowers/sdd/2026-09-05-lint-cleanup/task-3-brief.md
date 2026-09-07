# Brief: task-3
## Global Constraints

- **No cambiar comportamiento visible, ni reglas de negocio, ni rutas, ni nombres de endpoints.** El objetivo es lint-clean, no refactorizar features.
- **NO tocar** `src/pages/staff/StaffCotizaciones.jsx`, `StaffRequerimientos.jsx`, `StaffDocumentos.jsx`, `StaffPromociones.jsx`, `StaffDirecciones.jsx` â€” ya estan limpios. Si el lint las reporta, avisar, no modificar.
- **Idioma:** logica en ingles, comentarios/UI en espanol (target Venezuela). NO agregar comentarios salvo los `// eslint-disable-next-line ...` justificados de la Receta R6.
- **Modulos ES** (`"type": "module"`). Sintaxis moderna: `catch { }` sin binding es valido.
- **Prohibido** eliminar de un destructuring un nombre que se use en otro sitio del archivo; verificar con grep antes de borrar.
- **Prohibido** relajar reglas globalmente en `eslint.config.js` salvo el `allowExportNames` exacto de la Task 1.
- **Verificacion por tarea:** `npx eslint <archivos-de-la-tarea>` debe devolver 0 problemas. **No** correr `npm run build` en paralelo entre agentes (compiten por CPU); el build completo corre solo en la Task 8.
- **Commits:** no commitear por tarea (los archivos no se solapan, pero los agentes trabajan en paralelo). Un solo commit al final (Task 8).
- Cada tarea trabaja UNICAMENTE los archivos listados en `Files:`; si el lint de ese archivo revela un problema no listado en lineas distintas, tambien corregirlo (mismo archivo, misma regla).

---

## Recetas compartidas (leelas enteras antes de ejecutar cualquier tarea)

### R1 â€” Efecto de carga inicial: fetch inline con guard `activo` (setState solo en callbacks async)

La regla `react-hooks/set-state-in-effect` prohibe llamar a `setState` de forma SINCRONA en el cuerpo del effect (incluso via una funcion que lo haga). El patron aprobado: setState dentro de `.then`/`.catch`/`.finally` (async) + guard `activo` para ignores tras desmontar.

ANTES (patron erroneo que dispara la regla):
```jsx
const [datos, setDatos] = useState([])
const [cargando, setCargando] = useState(true)

useEffect(() => {
  cargar()
}, [])
//     cargar() setea setCargando(true) sincronamente â†’ ERROR react-hooks/set-state-in-effect

async function cargar() {
  setCargando(true)               // â† sincrono
  try {
    const { data } = await staffApi.get('/staff/x')
    setDatos(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('Error al cargar x', err)
  } finally {
    setCargando(false)
  }
}
```

DESPUES (correcto):
```jsx
const [datos, setDatos] = useState([])
const [cargando, setCargando] = useState(true)   // arranca en true = el spinner del primer mount

useEffect(() => {
  let activo = true
  api.get('/x')
    .then(({ data }) => { if (activo) setDatos(Array.isArray(data) ? data : []) })
    .catch((err) => { if (activo) console.error('Error al cargar x', err) })
    .finally(() => { if (activo) setCargando(false) })
  return () => { activo = false }
}, [])
```

Reglas de aplicacion:
- Si la funcion `cargar`/`cargarX` **solo se llama desde el effect**, eliminala y usa el fetch inline (codigo de arriba).
- Si la funcion **tambien se llama desde handlers** (boton de refrescar, etc.), conservala tal cual (setear sincronamente desde un event handler SI esta permitido) y usa fetch inline SOLO para el effect. No llames `cargar()` desde ningun effect.
- Si el effect dependia de un parametro que cambia (ej. `[id]`, `[filtro]`), deja el parametro en deps y usalo dentro del fetch inline. Ej.:
```jsx
useEffect(() => {
  let activo = true
  api.get(`/lists/${id}/items`)
    .then(...)
    ...
}, [id])
```
- En componentes que tenian `cargar` **antes** del effect por la regla `immutability`, aplicar R1 elimina el problema (ya no hay funcion declarada despues).

### R2 â€” Efectos que sincronizan estado cuando cambia un prop/estado â†’ derivar en render, lazy init + key, o mover a handlers

La regla prohibe "adjusting state when a prop changes". Tres tecnicas segun caso:

1. **Estado derivado:** si el efecto existia solo para "poner al dia" un valor que se puede CALCULAR del estado que tiene a mano, calculalo durante el render (sin estado, sin effect).
2. **Formularios/modales que se resetear al cambiar de registro:** usa `useState` con inicializador lazy + `key` para remount:
```jsx
function ModalX({ registro, onCerrar }) {
  const [valores, setValores] = useState(() => {
    const iniciales = {}
    if (!registro) return iniciales
    for (const item of registro.items ?? []) iniciales[item.id] = { campo: item.campo }
    return iniciales
  })
  ...
}
// en el padre:
<ModalX key={seleccionado?.id ?? 'cerrado'} registro={seleccionado} ... />
```
3. **Resets que acompanan un cambio de estado desencadenado por el usuario:** mueve el reset AL handler que causa el cambio (ej. `onClick={() => { setMenuAbierto(false); setActivo(null) }}`) y borra el effect. Funciona cuando el reset solo se dispara por acciones del usuario.

### R3 â€” Debounce/intervals/manejos asincronos: el setState sincrono va dentro del callback async o a lazy init

- **Debounce de busqueda** cuyo effect hace `if (busqueda.length < 1) { setSugerencias([]); setMostrarSugerencias(false); return }`: mueve ESE bloque DENTRO del `setTimeout` (queda async â†’ permitido):
```jsx
useEffect(() => {
  const debounce = setTimeout(async () => {
    if (busqueda.length < 1) {
      setSugerencias([])
      setMostrarSugerencias(false)
      return
    }
    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(busqueda)}&limit=5`)
      setSugerencias(data.slice(0, 5))
      setMostrarSugerencias(true)
    } catch (err) {
      console.error('Error buscando sugerencias:', err)
    }
  }, 300)
  return () => clearTimeout(debounce)
}, [busqueda])
```
  Nota: aceptar el delay de 300 ms extra del branch de limpieza (imperceptible en UX).
- **Estados inicializados segun una condicion** (ej. `soportado`): usa lazy init en vez de `if` dentro del effect:
```jsx
const soportado = 'serviceWorker' in navigator && 'PushManager' in window && PUSH_ENABLED
const [suscrito, setSuscrito] = useState(() => (soportado ? null : false))
const [permiso, setPermiso] = useState(() => (soportado ? null : (Notification?.permission || 'default')))
```
  y luego el effect arranca `detectarEstado()` SIN el branch `if (!soportado)` (ya no hace falta; el initialState lo cubre).
- **`Date.now()`/`new Date()` en render (purity):** `useState(Date.now())` â†’ `useState(() => Date.now())`. Si `const ahora = Date.now()` aparece en el cuerpo del render y se usa para refrescar con setInterval, conviertelo en estado con lazy init y que el interval haga `setAhora(Date.now())`.

### R4 â€” `react-hooks/immutability` ("Cannot access variable before it is declared")

Causa: el effect llama una funcion declarada DESPUES del effect (`cargar()`, `handleX()`, etc.). Fix: aplicar R1 (elimina la funcion) O reordenar para declarar antes. Verificar con `npx eslint` el archivo tras el cambio.

### R5 â€” `no-unused-vars`/`no-undef`

- Imports sin uso â†’ borrar la linea.
- Variables de destructuring sin uso â†’ quitar el nombre del objeto, PERO antes `rg "<nombre>" <archivo>` para confirmar que no se usa en otra parte.
- `catch (err)` sin usar â†’ `catch {` (sintaxis valida ES2019). Si el cuerpo usa `err`, dejarlo.
- Valores asignados y nunca usados (`let x = fn(); x = fn2()` donde el ultimo nunca se lee) â†’ llamar sin asignar: `fn2()`.
- `process.env.REACT_APP_API_URL` â†’ `import.meta.env.VITE_API_URL` (el frontend NO define `process`; la url correcta es la misma del `baseURL` de `src/api/axios.js`).
- Variables definidas y no usadas por completo â†’ borrar definicion Y su uso en el valor del contexto si estaba solo para exponerse.

### R6 â€” `react-hooks/exhaustive-deps` (warnings)

- Si la dependencia que falta es una funcion definida EN EL MISMO archivo â†’ envolverla en `useCallback` (con las deps que usa) al declararla y agregarla al array de deps del effect. Si tras R1 la funcion ya no se llama desde el effect, la warning desaparece sola.
- Si la dependencia que falta es un callback del PADRE (ej. `onFiltrar`) y agregarla causa refetch en cada render â†’ buscar el padre, envolver el callback en `useCallback` y agregarlo a deps del effect. Si es inviable, usar:
```jsx
  // eslint-disable-next-line react-hooks/exhaustive-deps
```
  SOLO en la linea del array de deps, con el codigo previo `cargarDatos()` comentado igual que se hace hoy en `src/pages/ListaDetalle.jsx:129-131`.
- `useMemo` cuyo dep es una expresion logica que cambia cada render (ej. `itemsOrden || []`) â†’ envolver la inicializacion de esa variable en su propio `useMemo` primero.
- Arrays literales usados como dep de `useCallback`/`useMemo` que redefinen identidad cada render â†’ envolver el array en `useMemo` (con sus propias deps).

### R7 â€” Errores estructurales puntuales

- **`static-components`** ("Cannot create components during render"): el componente usado en el JSX esta definido DENTRO de la funcion del padre. Sacar la definicion a nivel de modulo (o a un archivo aparte), pasando todo lo que necesite por props. Los hooks que usen deben quedarse en el componente extraido.
- **`refs`** ("Cannot access refs during render"): algÃ¹n `ref.current` se lee dentro del render (estilos/condiciones). Convertir a estado: `const [arrastrando, setArrastrando] = useState(false)`; setearlo en los handlers (`setArrastrando(true)`/`setArrastrando(false)`) y leer el estado en el render.
- **`no-useless-catch`**: `try { ... } catch (error) { throw error }` que solo relanza â†’ eliminar el try/catch (dejar el cuerpo directo).
- **`preserve-manual-memoization`** ("Existing memoization could not be preserved"): el React Compiler no pudo preservar un `useMemo`/`useCallback` manual. Leer el componente; si el `useMemo` tiene un early-return o dependencias logicas, reestructurar: extraer el calculo puro a una funcion de modulo o a una const calculada en render (el compiler lo auto-memoiza). Verificar con `npx eslint` + build.
- **`react-refresh/only-export-components`**: NO tocar archivos ni mover exports. Se resuelve en Task 1 via config.

### R8 â€” Regla de productividad

Trabaja archivo por archivo: lee el bloque seÃ±alado, aplica la receta, corre `npx eslint <ruta>` y confirmalo en 0 ANTES de pasar al siguiente archivo. Si un caso no cuadra con ninguna receta, detente y evalua: el 99% cuadra con R1-R5. Si R6-clase no cuadra, usa el disable justificado.

---

## Task 1: Config â€” `react-refresh/only-export-components` con `allowExportNames`
## Task 3: Panel admin (`src/components/admin/`)

**Files:**
- Modify: `src/components/admin/AnalyticsProductos.jsx:11`, `:46`, `:59`
- Modify: `src/components/admin/AnalyticsVentas.jsx:68`, `:83`, `:142`, `:145`, `:173`
- Modify: `src/components/admin/DeliveryAdmin.jsx:40`, `:77`, `:89`, `:100`
- Modify: `src/components/admin/DescuentosAdmin.jsx:168`
- Modify: `src/components/admin/DescuentosForm.jsx:181`, `:196`
- Modify: `src/components/admin/EstadoCuentaDetalle.jsx:89`, `:91`
- Modify: `src/components/admin/FacturaForm.jsx:21`, `:23`, `:44`
- Modify: `src/components/admin/FichasProductoAdmin.jsx:13`, `:98`, `:124`, `:389`
- Modify: `src/components/admin/GestionCodigos.jsx:81`
- Modify: `src/components/admin/MoleculasAdmin.jsx:195`
- Modify: `src/components/admin/NuevaFacturaModal.jsx:38`, `:39`, `:44`
- Modify: `src/components/admin/NuevaOrdenModal.jsx:62`, `:73`, `:96`
- Modify: `src/components/admin/NuevaOrdenRapida.jsx:41`, `:60`
- Modify: `src/components/admin/NuevoPagoModal.jsx:37`
- Modify: `src/components/admin/OrdenesAdmin.jsx:189`
- Modify: `src/components/admin/ProductosAdmin.jsx:149`
- Modify: `src/components/admin/RequerimientosAdmin.jsx:107`, `:214`
- Modify: `src/components/admin/UsuariosAdmin.jsx:5`, `:11`, `:13`, `:220`
- Modify: `src/components/admin/TableroSwipeOrdenes.jsx:94`
- Modify: `src/components/admin/ClienteDetalle.jsx:18`
- Modify: `src/components/admin/PagosAdmin.jsx:31`
- Modify: `src/components/admin/TasaCambio.jsx:1`, `:25`, `:45`, `:139`
- Modify: `src/components/admin/CotizacionesAdmin.jsx:213`
- Modify: `src/components/admin/DocumentosAdmin.jsx:152`
- Modify: `src/components/admin/EstadoCuentaAdmin.jsx:20`
- Modify: `src/components/admin/EstadoCuentaClientes.jsx:33`
- Modify: `src/components/admin/DescuentoModal.jsx:10`
- Modify: `src/components/admin/ProductoForm.jsx:1`, `:56`

- [ ] **Step 1:** Leer este task + Recetas R1-R8.
- [ ] **Step 2 â€” BUGS REALES no-undef (R5) + Analytics:**
  - `AnalyticsProductos.jsx:46`, `AnalyticsVentas.jsx:68`, `EstadoCuentaClientes.jsx:33` â†’ reemplazar `${process.env.REACT_APP_API_URL}` por `${import.meta.env.VITE_API_URL}`.
  - `AnalyticsVentas.jsx`:
    - `:142`, `:145` usan `<Button>` sin importarlo â†’ agregar `Button` al import de `@chakra-ui/react` (linea 2-16).
    - `:173` usa `serieParaGrafico` sin definir â†’ agregar antes del `return`:
```jsx
  const serieParaGrafico = (datos?.serie || []).map((p) => ({ etiqueta: p.periodo, total: p.total }));
```
  - `AnalyticsProductos.jsx:11` `INDIGO` sin usar â†’ borrar la const (verificar que no se use; en este archivo no se usa).
- [ ] **Step 3 â€” Cargas de admin (R1):** `DeliveryAdmin.jsx:40`, `DescuentosAdmin.jsx:168`, `DescuentosForm.jsx:181`, `:196`, `EstadoCuentaDetalle.jsx:89`, `FacturaForm.jsx:44`, `FichasProductoAdmin.jsx:13`, `:389`, `GestionCodigos.jsx:81`, `MoleculasAdmin.jsx:195`, `NuevaFacturaModal.jsx:39`, `NuevaOrdenModal.jsx:62`, `:96`, `NuevaOrdenRapida.jsx:60`, `NuevoPagoModal.jsx:37`, `OrdenesAdmin.jsx:189`, `ProductosAdmin.jsx:149`, `RequerimientosAdmin.jsx:107`, `UsuariosAdmin.jsx:220` â†’ si son `cargarX()` en `useEffect`, R1. Si `cargarX` se reutiliza en handlers (refresh), duplicar solo el fetch inline del effect y conservar la funcion para handlers.
- [ ] **Step 4 â€” immutability (R4):** `CotizacionesAdmin.jsx:213`, `DocumentosAdmin.jsx:152`, `FacturaForm.jsx:21`, `FichasProductoAdmin.jsx:124`, `NuevaFacturaModal.jsx:38`, `NuevaOrdenModal.jsx:73`, `NuevaOrdenRapida.jsx:41`, `RequerimientosAdmin.jsx:214` â†’ aplicar R1 (si es el `cargar` de antes) o reordenar la declaracion antes del effect; verificar con eslint.
- [ ] **Step 5 â€” exhaustive-deps (R6):** `ClienteDetalle.jsx:18`, `EstadoCuentaDetalle.jsx:91`, `FacturaForm.jsx:23`, `NuevaFacturaModal.jsx:44`, `PagosAdmin.jsx:31`, `TasaCambio.jsx:25` â†’ las funciones `cargarDetalle`/`cargarOrdenesSinFacturar`/`cargarReportes`/`verificarActualizacionAutomatica` estan en el mismo archivo â†’ envolverlas en `useCallback` estable (con sus deps) y agregarlas al array de deps; `esEdicion` (una prop) agregarla si no produce loop; si produce loop, disable comentado justificado.
- [ ] **Step 6 â€” `TableroSwipeOrdenes.jsx:94` (R7 refs):** leer los handlers `handlePointerDown/Move/Up`; reemplazar `const arrastrando = useRef(false)` (o similar) por `const [arrastrando, setArrastrando] = useState(false)`; en `handlePointerDown` setear `setArrastrando(true)`; en `handlePointerUp`/`handlePointerCancel` `setArrastrando(false)`; el estilo `transition: arrastrando ? 'none' : 'transform 0.2s ease'` ahora lee estado.
- [ ] **Step 7 â€” unused (R5):** `DeliveryAdmin.jsx:77/:89/:100` (`catch (err)` â†’ `catch {` si no usan err), `TasaCambio.jsx:1` (borrar import `useCallback` sin uso), `TasaCambio.jsx:45` (`minutos` asignado y no usado â†’ usar la variable en el texto o quitar la asignacion muerta; leer contexto), `TasaCambio.jsx:139` (err â†’ catch {), `FichasProductoAdmin.jsx:98` (`detalles` no usado â†’ borrar), `UsuariosAdmin.jsx:5/:11/:13` (imports `Grid`, `Stack`, `VStack` â†’ borrar), `EstadoCuentaAdmin.jsx:20` (`createListCollection` â†’ borrar del import), `DescuentoModal.jsx:10` (`Stack` â†’ borrar), `ProductoForm.jsx:1` (`useEffect` â†’ borrar del import), `ProductoForm.jsx:56` (`_` no usado â†’ eliminar o renombrar).
- [ ] **Step 8 â€” Verificacion completa del task:**
  Run: `npx eslint src/components/admin/AnalyticsProductos.jsx src/components/admin/AnalyticsVentas.jsx src/components/admin/DeliveryAdmin.jsx src/components/admin/DescuentosAdmin.jsx src/components/admin/DescuentosForm.jsx src/components/admin/EstadoCuentaDetalle.jsx src/components/admin/FacturaForm.jsx src/components/admin/FichasProductoAdmin.jsx src/components/admin/GestionCodigos.jsx src/components/admin/MoleculasAdmin.jsx src/components/admin/NuevaFacturaModal.jsx src/components/admin/NuevaOrdenModal.jsx src/components/admin/NuevaOrdenRapida.jsx src/components/admin/NuevoPagoModal.jsx src/components/admin/OrdenesAdmin.jsx src/components/admin/ProductosAdmin.jsx src/components/admin/RequerimientosAdmin.jsx src/components/admin/UsuariosAdmin.jsx src/components/admin/TableroSwipeOrdenes.jsx src/components/admin/ClienteDetalle.jsx src/components/admin/PagosAdmin.jsx src/components/admin/TasaCambio.jsx src/components/admin/CotizacionesAdmin.jsx src/components/admin/DocumentosAdmin.jsx src/components/admin/EstadoCuentaAdmin.jsx src/components/admin/EstadoCuentaClientes.jsx src/components/admin/DescuentoModal.jsx src/components/admin/ProductoForm.jsx`
  Expected: 0 problemas.

---


