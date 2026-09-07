# Limpieza de Lint (151 problemas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar `npm run lint` en 0 problemas (hoy 138 errores + 13 warnings) y `npm run build` en OK, sin cambiar comportamiento visible ni reglas de negocio.

**Architecture:** Limpieza mecanica por categorias sobre codigo existente. Un solo cambio de config (Task 1, `react-refresh/only-export-components` con `allowExportNames`) y el resto son refactors de efectos React con 5 recetas compartidas. Los archivos se reparten en tareas DISJUNTAS para ejecutarse en paralelo sin conflictos; la tarea final verifica el repo completo y commitea.

**Tech Stack:** React 19, Vite 8, ESLint flat config (`eslint.config.js`) con `eslint-plugin-react-hooks` (reglas React Compiler: `set-state-in-effect`, `immutability`, `exhaustive-deps`, `purity`, `refs`, `static-components`, `preserve-manual-memoization`) y `eslint-plugin-react-refresh` (`only-export-components`).

**Spec:** Diseno aprobado en sesion (brainstorming, 2026-09-05): alcance = los 151 problemas (errores + warnings); `react-refresh` se resuelve con `allowExportNames` en el config; plan en `docs/superpowers/plans/`.

## Global Constraints

- **No cambiar comportamiento visible, ni reglas de negocio, ni rutas, ni nombres de endpoints.** El objetivo es lint-clean, no refactorizar features.
- **NO tocar** `src/pages/staff/StaffCotizaciones.jsx`, `StaffRequerimientos.jsx`, `StaffDocumentos.jsx`, `StaffPromociones.jsx`, `StaffDirecciones.jsx` — ya estan limpios. Si el lint las reporta, avisar, no modificar.
- **Idioma:** logica en ingles, comentarios/UI en espanol (target Venezuela). NO agregar comentarios salvo los `// eslint-disable-next-line ...` justificados de la Receta R6.
- **Modulos ES** (`"type": "module"`). Sintaxis moderna: `catch { }` sin binding es valido.
- **Prohibido** eliminar de un destructuring un nombre que se use en otro sitio del archivo; verificar con grep antes de borrar.
- **Prohibido** relajar reglas globalmente en `eslint.config.js` salvo el `allowExportNames` exacto de la Task 1.
- **Verificacion por tarea:** `npx eslint <archivos-de-la-tarea>` debe devolver 0 problemas. **No** correr `npm run build` en paralelo entre agentes (compiten por CPU); el build completo corre solo en la Task 8.
- **Commits:** no commitear por tarea (los archivos no se solapan, pero los agentes trabajan en paralelo). Un solo commit al final (Task 8).
- Cada tarea trabaja UNICAMENTE los archivos listados en `Files:`; si el lint de ese archivo revela un problema no listado en lineas distintas, tambien corregirlo (mismo archivo, misma regla).

---

## Recetas compartidas (leelas enteras antes de ejecutar cualquier tarea)

### R1 — Efecto de carga inicial: fetch inline con guard `activo` (setState solo en callbacks async)

La regla `react-hooks/set-state-in-effect` prohibe llamar a `setState` de forma SINCRONA en el cuerpo del effect (incluso via una funcion que lo haga). El patron aprobado: setState dentro de `.then`/`.catch`/`.finally` (async) + guard `activo` para ignores tras desmontar.

ANTES (patron erroneo que dispara la regla):
```jsx
const [datos, setDatos] = useState([])
const [cargando, setCargando] = useState(true)

useEffect(() => {
  cargar()
}, [])
//     cargar() setea setCargando(true) sincronamente → ERROR react-hooks/set-state-in-effect

async function cargar() {
  setCargando(true)               // ← sincrono
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

### R2 — Efectos que sincronizan estado cuando cambia un prop/estado → derivar en render, lazy init + key, o mover a handlers

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

### R3 — Debounce/intervals/manejos asincronos: el setState sincrono va dentro del callback async o a lazy init

- **Debounce de busqueda** cuyo effect hace `if (busqueda.length < 1) { setSugerencias([]); setMostrarSugerencias(false); return }`: mueve ESE bloque DENTRO del `setTimeout` (queda async → permitido):
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
- **`Date.now()`/`new Date()` en render (purity):** `useState(Date.now())` → `useState(() => Date.now())`. Si `const ahora = Date.now()` aparece en el cuerpo del render y se usa para refrescar con setInterval, conviertelo en estado con lazy init y que el interval haga `setAhora(Date.now())`.

### R4 — `react-hooks/immutability` ("Cannot access variable before it is declared")

Causa: el effect llama una funcion declarada DESPUES del effect (`cargar()`, `handleX()`, etc.). Fix: aplicar R1 (elimina la funcion) O reordenar para declarar antes. Verificar con `npx eslint` el archivo tras el cambio.

### R5 — `no-unused-vars`/`no-undef`

- Imports sin uso → borrar la linea.
- Variables de destructuring sin uso → quitar el nombre del objeto, PERO antes `rg "<nombre>" <archivo>` para confirmar que no se usa en otra parte.
- `catch (err)` sin usar → `catch {` (sintaxis valida ES2019). Si el cuerpo usa `err`, dejarlo.
- Valores asignados y nunca usados (`let x = fn(); x = fn2()` donde el ultimo nunca se lee) → llamar sin asignar: `fn2()`.
- `process.env.REACT_APP_API_URL` → `import.meta.env.VITE_API_URL` (el frontend NO define `process`; la url correcta es la misma del `baseURL` de `src/api/axios.js`).
- Variables definidas y no usadas por completo → borrar definicion Y su uso en el valor del contexto si estaba solo para exponerse.

### R6 — `react-hooks/exhaustive-deps` (warnings)

- Si la dependencia que falta es una funcion definida EN EL MISMO archivo → envolverla en `useCallback` (con las deps que usa) al declararla y agregarla al array de deps del effect. Si tras R1 la funcion ya no se llama desde el effect, la warning desaparece sola.
- Si la dependencia que falta es un callback del PADRE (ej. `onFiltrar`) y agregarla causa refetch en cada render → buscar el padre, envolver el callback en `useCallback` y agregarlo a deps del effect. Si es inviable, usar:
```jsx
  // eslint-disable-next-line react-hooks/exhaustive-deps
```
  SOLO en la linea del array de deps, con el codigo previo `cargarDatos()` comentado igual que se hace hoy en `src/pages/ListaDetalle.jsx:129-131`.
- `useMemo` cuyo dep es una expresion logica que cambia cada render (ej. `itemsOrden || []`) → envolver la inicializacion de esa variable en su propio `useMemo` primero.
- Arrays literales usados como dep de `useCallback`/`useMemo` que redefinen identidad cada render → envolver el array en `useMemo` (con sus propias deps).

### R7 — Errores estructurales puntuales

- **`static-components`** ("Cannot create components during render"): el componente usado en el JSX esta definido DENTRO de la funcion del padre. Sacar la definicion a nivel de modulo (o a un archivo aparte), pasando todo lo que necesite por props. Los hooks que usen deben quedarse en el componente extraido.
- **`refs`** ("Cannot access refs during render"): algùn `ref.current` se lee dentro del render (estilos/condiciones). Convertir a estado: `const [arrastrando, setArrastrando] = useState(false)`; setearlo en los handlers (`setArrastrando(true)`/`setArrastrando(false)`) y leer el estado en el render.
- **`no-useless-catch`**: `try { ... } catch (error) { throw error }` que solo relanza → eliminar el try/catch (dejar el cuerpo directo).
- **`preserve-manual-memoization`** ("Existing memoization could not be preserved"): el React Compiler no pudo preservar un `useMemo`/`useCallback` manual. Leer el componente; si el `useMemo` tiene un early-return o dependencias logicas, reestructurar: extraer el calculo puro a una funcion de modulo o a una const calculada en render (el compiler lo auto-memoiza). Verificar con `npx eslint` + build.
- **`react-refresh/only-export-components`**: NO tocar archivos ni mover exports. Se resuelve en Task 1 via config.

### R8 — Regla de productividad

Trabaja archivo por archivo: lee el bloque señalado, aplica la receta, corre `npx eslint <ruta>` y confirmalo en 0 ANTES de pasar al siguiente archivo. Si un caso no cuadra con ninguna receta, detente y evalua: el 99% cuadra con R1-R5. Si R6-clase no cuadra, usa el disable justificado.

---

## Task 1: Config — `react-refresh/only-export-components` con `allowExportNames`

**Files:**
- Modify: `eslint.config.js`

Resuelve 9 errores de `react-refresh/only-export-components`. Los nombres permitidos (verificados en los archivos) son las funciones/constantes hook e infraestructurales que conviven con componentes en archivos compartidos:

- [x] **Step 1:** Leer `eslint.config.js`.
- [x] **Step 2:** Agregar la configuracion de la regla:
```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: [
            'useColorMode',
            'useColorModeValue',
            'toaster',
            'useLoadingBar',
            'useCart',
            'useAuth',
            'useEnvio',
            'useFavoritos',
            'useStaffAuth',
          ],
        },
      ],
    },
  },
])
```
- [x] **Step 3:** Verificar: `npx eslint .` → los 9 errores de `only-export-components` deben desaparecer y no salir otros nuevos.
- [ ] **Step 4:** `npm run build` → OK (guardahielo de que el config no rompe nada).
- [ ] **Step 5:** Commit parcial NO (se hace en Task 8).

---

## Task 2: Componentes generales (`src/components/`)

**Files:**
- Modify: `src/components/BannerOnboarding.jsx:28`
- Modify: `src/components/BottomNav.jsx:113`
- Modify: `src/components/BuscadorMovil.jsx:70`
- Modify: `src/components/ConfirmarPedidoModal.jsx:34`
- Modify: `src/components/InstalarAppBtn.jsx:21`, `:44`
- Modify: `src/components/Navbar.jsx:113`, `:192`, `:202`, `:228`, `:223`
- Modify: `src/components/OrdenDetalleModal.jsx:28`, `:24` (x2)
- Modify: `src/components/PinCheckout.jsx:31`, `:120`
- Modify: `src/components/PrivateRouteSensible.jsx:25`
- Modify: `src/components/BuscadorFiltro.jsx:16`
- Modify: `src/components/MapaPicker.jsx:94`
- Modify: `src/components/GestionDirecciones.jsx:28`
- Modify: `src/components/AgregarAItemsModal.jsx:22`, `:66`
- Modify: `src/components/AgregarDireccionModal.jsx:41`
- Modify: `src/components/LeafletMap.jsx:1`
- Modify: `src/components/TopLoadingBar.jsx:1`

- [ ] **Step 1:** Leer este task entero + Recetas R1-R8.
- [ ] **Step 2 — Los 8 componentes de carga (R1):** `BannerOnboarding.jsx`, `BottomNav.jsx`, `BuscadorMovil.jsx`, `ConfirmarPedidoModal.jsx`, `InstalarAppBtn.jsx:44`, `OrdenDetalleModal.jsx:28`, `PinCheckout.jsx:31`. Cada uno: leer el effect señalado; si es `cargar()`/fetch en mount → R1 (inline fetch + guard activo). `PinCheckout.jsx` probablemente es un fetch de PIN al mount → R1.
- [ ] **Step 3 — `PrivateRouteSensible.jsx:25` (R3):** el effect hace `if (loading || !user) { setVerificando(false); return }` sincrono. Fix: `useState(() => true)` para `verificando` y reestructurar para que el `setVerificando(false)` inicial NO dependa de sincronia:
  - `verificando` arranca en `true (default)`; mover el `setVerificando(false)` del branch `!loading && !user` dentro del `.finally` del fetch es incorrecto (el fetch no corre si no hay user).
  - Patron correcto: condicionar la RAMA con un early `if (loading) return <p>...` antes, o mejor: derivar en render. Solucion concreta:
```jsx
function PrivateRouteSensible({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const [valido, setValido] = useState(null)   // null = aun sin verificar

  useEffect(() => {
    if (loading || !user) return
    let cancelado = false
    api.get('/auth/verify')
      .then(() => { if (!cancelado) setValido(true) })
      .catch(() => { if (!cancelado) setValido(false) })
    return () => { cancelado = true }
  }, [loading, user])

  if (loading || (user && valido === null)) {
    return <p>Verificando sesión...</p>
  }
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !user.es_admin) return <Navigate to="/" replace />
  if (user && valido === false) return <Navigate to="/login?expirado=1" replace />
  return children
}
```
  Verificar que los navegadores de `!user` y de `adminOnly` sigan funcionando igual (renders intermedios identicos en pantalla).
- [ ] **Step 4 — `Navbar.jsx` (casos especiales):**
  - `:113` `opcionesEnvio` no usada → quitarla del destructuring de `useEnvio()` (verificar con `rg "opcionesEnvio" src/components/Navbar.jsx` que no se use en otro sitio).
  - `:192` `setDeptoActivo(null)` cuando `!showDeptosMenu` y `:194` `setServicioActivo(null)` → R2: buscar todos los `setShowDeptosMenu(false)`/`setShowServiciosMenu(false)` y `setShowDeptosMenu(true)` en el archivo y mover los resets a esos handlers; borrar el effect 190-197.
  - `:202` branch de busqueda vacia → R3 (mover el `if (busqueda.length < 1) {...}` dentro del `setTimeout` del debounce).
  - `:228` `if (!user) { setNotificacionesNoLeidas(0); return }` → mantener el effect, pero hacer el fetch siempre en cadena async y el reset solo via `finally` NO es equivalente (no corre sin user). Solucion: dejar `notificacionesNoLeidas` en 0 de init, y en el effect hacer:
```jsx
useEffect(() => {
  if (!user) return // valor inicial 0 ya cubre el estado "sin sesion"; se mantiene al hacer logout porque el usuario sale de la app
  api
    .get('/notifications/unread-count')
    .then(({ data }) => setNotificacionesNoLeidas(data.count || 0))
    .catch((err) => console.error('Error al contar notificaciones:', err))
}, [user])
```
  Si el resto del componente espera que el badge baje a 0 tras logout con el Navbar montado (solo ocurre si el logout no redirige), usar en su lugar un disable comentado sobre la linea `setNotificacionesNoLeidas(0)`:
```jsx
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset intencional al cerrar sesion; no hay derivacion limpia
      setNotificacionesNoLeidas(0)
      return
    }
```
  (elegir una u otra; la primera prioriza el lint, la segunda prioriza el badge exacto — NO ambas).
  - `:223` warning exhaustive-deps `cargarDirecciones` → agregar `cargarDirecciones` al array de deps (ya es `useCallback` estable en `EnvioContext`).
- [ ] **Step 5 — `Navbar.jsx` (resto) y efectos debounce:** deja el `useEffect` de click-outside (147-187) como esta; el effect de notificaciones conforme Step 4; verificar con `npx eslint` que las 4 lineas (113,192,202,223,228) quedan en cero.
- [ ] **Step 6 — `OrdenDetalleModal.jsx:24` (R6):** `itemsOrden` es una expresion logica usada como dep de 2 useMemo → envolver su inicializacion en su propio `useMemo`. Leer el archivo, localizar `const itemsOrden = ... || []` y:
```jsx
const itemsOrden = useMemo(() => (orden?.items ?? []), [orden?.items])
```
- [ ] **Step 7 — `BuscadorFiltro.jsx:16` y `MapaPicker.jsx:94` (R6):** `BuscadorFiltro` — `onFiltrar` viene del padre; leer el efecto; si es un "llamar al filtrar al montar/cambiar", mover la logica para que el effect solo dependa de value estable o usar disable justificado. `MapaPicker` — `reverseGeocodeNominatim` es funcion del mismo archivo → envolverla en `useCallback` (con sus deps) y agregarla a la lista de deps del useCallback señalado.
- [ ] **Step 8 — `InstalarAppBtn.jsx:21`:** eliminar `const esIOS = ...` si no se usa (verificar). `:44` — efecto de install/promo → R1 o R3 segun si setea sync en el body.
- [ ] **Step 9 — `GestionDirecciones.jsx:28` (R4):** reordenar para que la funcion usada en el effect se declare antes, o R1 si es un fetch de load.
- [ ] **Step 10 — unused (R5):** `AgregarAItemsModal.jsx:22,:66`, `AgregarDireccionModal.jsx:41`, `PinCheckout.jsx:120` (`catch (err)` → `catch {` si no se usa; si se usa, dejar). `LeafletMap.jsx:1` y `TopLoadingBar.jsx:1` → borrar imports `React` y `useRef` sin uso.
- [ ] **Step 11 — Verificacion completa del task:**
  Run: `npx eslint src/components/BannerOnboarding.jsx src/components/BottomNav.jsx src/components/BuscadorMovil.jsx src/components/ConfirmarPedidoModal.jsx src/components/InstalarAppBtn.jsx src/components/Navbar.jsx src/components/OrdenDetalleModal.jsx src/components/PinCheckout.jsx src/components/PrivateRouteSensible.jsx src/components/BuscadorFiltro.jsx src/components/MapaPicker.jsx src/components/GestionDirecciones.jsx src/components/AgregarAItemsModal.jsx src/components/AgregarDireccionModal.jsx src/components/LeafletMap.jsx src/components/TopLoadingBar.jsx`
  Expected: 0 problemas.

---

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
- [ ] **Step 2 — BUGS REALES no-undef (R5) + Analytics:**
  - `AnalyticsProductos.jsx:46`, `AnalyticsVentas.jsx:68`, `EstadoCuentaClientes.jsx:33` → reemplazar `${process.env.REACT_APP_API_URL}` por `${import.meta.env.VITE_API_URL}`.
  - `AnalyticsVentas.jsx`:
    - `:142`, `:145` usan `<Button>` sin importarlo → agregar `Button` al import de `@chakra-ui/react` (linea 2-16).
    - `:173` usa `serieParaGrafico` sin definir → agregar antes del `return`:
```jsx
  const serieParaGrafico = (datos?.serie || []).map((p) => ({ etiqueta: p.periodo, total: p.total }));
```
  - `AnalyticsProductos.jsx:11` `INDIGO` sin usar → borrar la const (verificar que no se use; en este archivo no se usa).
- [ ] **Step 3 — Cargas de admin (R1):** `DeliveryAdmin.jsx:40`, `DescuentosAdmin.jsx:168`, `DescuentosForm.jsx:181`, `:196`, `EstadoCuentaDetalle.jsx:89`, `FacturaForm.jsx:44`, `FichasProductoAdmin.jsx:13`, `:389`, `GestionCodigos.jsx:81`, `MoleculasAdmin.jsx:195`, `NuevaFacturaModal.jsx:39`, `NuevaOrdenModal.jsx:62`, `:96`, `NuevaOrdenRapida.jsx:60`, `NuevoPagoModal.jsx:37`, `OrdenesAdmin.jsx:189`, `ProductosAdmin.jsx:149`, `RequerimientosAdmin.jsx:107`, `UsuariosAdmin.jsx:220` → si son `cargarX()` en `useEffect`, R1. Si `cargarX` se reutiliza en handlers (refresh), duplicar solo el fetch inline del effect y conservar la funcion para handlers.
- [ ] **Step 4 — immutability (R4):** `CotizacionesAdmin.jsx:213`, `DocumentosAdmin.jsx:152`, `FacturaForm.jsx:21`, `FichasProductoAdmin.jsx:124`, `NuevaFacturaModal.jsx:38`, `NuevaOrdenModal.jsx:73`, `NuevaOrdenRapida.jsx:41`, `RequerimientosAdmin.jsx:214` → aplicar R1 (si es el `cargar` de antes) o reordenar la declaracion antes del effect; verificar con eslint.
- [ ] **Step 5 — exhaustive-deps (R6):** `ClienteDetalle.jsx:18`, `EstadoCuentaDetalle.jsx:91`, `FacturaForm.jsx:23`, `NuevaFacturaModal.jsx:44`, `PagosAdmin.jsx:31`, `TasaCambio.jsx:25` → las funciones `cargarDetalle`/`cargarOrdenesSinFacturar`/`cargarReportes`/`verificarActualizacionAutomatica` estan en el mismo archivo → envolverlas en `useCallback` estable (con sus deps) y agregarlas al array de deps; `esEdicion` (una prop) agregarla si no produce loop; si produce loop, disable comentado justificado.
- [ ] **Step 6 — `TableroSwipeOrdenes.jsx:94` (R7 refs):** leer los handlers `handlePointerDown/Move/Up`; reemplazar `const arrastrando = useRef(false)` (o similar) por `const [arrastrando, setArrastrando] = useState(false)`; en `handlePointerDown` setear `setArrastrando(true)`; en `handlePointerUp`/`handlePointerCancel` `setArrastrando(false)`; el estilo `transition: arrastrando ? 'none' : 'transform 0.2s ease'` ahora lee estado.
- [ ] **Step 7 — unused (R5):** `DeliveryAdmin.jsx:77/:89/:100` (`catch (err)` → `catch {` si no usan err), `TasaCambio.jsx:1` (borrar import `useCallback` sin uso), `TasaCambio.jsx:45` (`minutos` asignado y no usado → usar la variable en el texto o quitar la asignacion muerta; leer contexto), `TasaCambio.jsx:139` (err → catch {), `FichasProductoAdmin.jsx:98` (`detalles` no usado → borrar), `UsuariosAdmin.jsx:5/:11/:13` (imports `Grid`, `Stack`, `VStack` → borrar), `EstadoCuentaAdmin.jsx:20` (`createListCollection` → borrar del import), `DescuentoModal.jsx:10` (`Stack` → borrar), `ProductoForm.jsx:1` (`useEffect` → borrar del import), `ProductoForm.jsx:56` (`_` no usado → eliminar o renombrar).
- [ ] **Step 8 — Verificacion completa del task:**
  Run: `npx eslint src/components/admin/AnalyticsProductos.jsx src/components/admin/AnalyticsVentas.jsx src/components/admin/DeliveryAdmin.jsx src/components/admin/DescuentosAdmin.jsx src/components/admin/DescuentosForm.jsx src/components/admin/EstadoCuentaDetalle.jsx src/components/admin/FacturaForm.jsx src/components/admin/FichasProductoAdmin.jsx src/components/admin/GestionCodigos.jsx src/components/admin/MoleculasAdmin.jsx src/components/admin/NuevaFacturaModal.jsx src/components/admin/NuevaOrdenModal.jsx src/components/admin/NuevaOrdenRapida.jsx src/components/admin/NuevoPagoModal.jsx src/components/admin/OrdenesAdmin.jsx src/components/admin/ProductosAdmin.jsx src/components/admin/RequerimientosAdmin.jsx src/components/admin/UsuariosAdmin.jsx src/components/admin/TableroSwipeOrdenes.jsx src/components/admin/ClienteDetalle.jsx src/components/admin/PagosAdmin.jsx src/components/admin/TasaCambio.jsx src/components/admin/CotizacionesAdmin.jsx src/components/admin/DocumentosAdmin.jsx src/components/admin/EstadoCuentaAdmin.jsx src/components/admin/EstadoCuentaClientes.jsx src/components/admin/DescuentoModal.jsx src/components/admin/ProductoForm.jsx`
  Expected: 0 problemas.

---

## Task 4: Contexts + hook (`src/context/`, `src/hooks/`)

**Files:**
- Modify: `src/context/AuthContext.jsx:13`, `:31`, `:85` (y reestructurar efecto)
- Modify: `src/context/FavoritosContext.jsx:33`
- Modify: `src/context/StaffAuthContext.jsx:12`, `:27`, `:28`
- Modify: `src/context/CartContext.jsx` (solo si el lint lo pide)
- Modify: `src/context/EnvioContext.jsx:39`, `:121`, `:144`
- Modify: `src/context/LoadingBarContext.jsx` (solo verificar; el export `useLoadingBar` lo cubre Task 1)
- Modify: `src/hooks/usePush.js:41`

- [ ] **Step 1:** Leer este task + Recetas R1-R8.
- [ ] **Step 2 — `AuthContext.jsx` (R2/R3 — restore de sesion por lazy init):** el effect 24-53 restaura `user` desde localStorage cuando `token` existe, y el effect 84-86 valida expiracion. Como TODO es sincrono (no hay async), convertir a lazy init y ELIMINAR ambos effects:
```jsx
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) return null;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { return JSON.parse(savedUser); } catch { return decoded; }
      }
      return decoded;
    } catch {
      return null;
    }
  });
  const [tokenExpirado, setTokenExpirado] = useState(() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  });
  const [loading] = useState(false);
```
  Conservar `login`, `logout`, `refreshTokenIfNeeded` y `value` IGUALES (la sesion ya no pasa por una fase de carga porque todo se resuelve en el primer render — comportamiento equivalente porque el restore era sincrono). Borrar los 2 `useEffect`. Verificar que `loading` siga en el value y que ningun consumer dependa de `loading=true` inicial (PrivateRoute muestra contenido tras el primer render correcto).
  La linea `:13` `catch (e)` sin uso en `isTokenValid` → `catch {`.
- [ ] **Step 3 — `StaffAuthContext.jsx` (R2/R3):** mismo patron que AuthContext sobre `staff_token`/`staff_user`:
```jsx
export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('staff_token'));
  const [staff, setStaff] = useState(() => {
    if (!token) return null;
    try {
      if (!isTokenValid(token)) return null;
      const guardado = localStorage.getItem('staff_user');
      if (guardado) {
        try { return JSON.parse(guardado); } catch { return jwtDecode(token); }
      }
      return jwtDecode(token);
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);
```
  IMPORTANTE: el efecto original ademas LIMPIABA `staff_token`/`staff_user` de localStorage si el token era invalido (lineas 35-38). Conserva esa limpieza: hacerla en el lazy initializer del `token` y en `useEffect` NO (sync de primera vez). Como el efecto se elimina, haz la limpieza dentro del initializer de `staff`: si `token` existe pero `!isTokenValid(token)`, borrar ambos items de localStorage (efecto colateral en init — aceptable una vez por carga). Borrar el effect 22-42. `:12` y `:28` `catch (e)` sin uso → `catch {`.
- [ ] **Step 4 — `FavoritosContext.jsx:33` (R1/R2):** reemplazar el effect que llama `cargarFavoritos()` por fetch inline + derivar la exposicion cuando no hay sesion:
```jsx
  // Cargar al iniciar sesión o cambiar usuario
  useEffect(() => {
    if (!user || !token) return
    let activo = true
    api.get('/favoritos')
      .then(({ data }) => { if (activo) setFavoritos(data.favoritos || []) })
      .catch((error) => { if (activo) console.error('Error al cargar favoritos:', error) })
      .finally(() => { if (activo) setLoading(false) })
    return () => { activo = false }
  }, [user, token])
```
  Y la exposicion deriva el vacio sin sesion: en `value`, `favoritos: user && token ? favoritos : []` (los consumidores sin login ven lista vacia, igual que antes). Conservar `cargarFavoritos` y `recargarFavoritos` tal cual (se usan en handlers).
- [ ] **Step 5 — `EnvioContext.jsx`:**
  - `:39` array `opcionesEnvio` literal → envolver en `useMemo` con deps `[costoEnvioActual]` (es lo unico variable que usa el array). Importar `useMemo`.
  - `:121` `guardarDireccion` y `:144` `eliminarDireccion` (R7 no-useless-catch): eliminar el `try { ... } catch (error) { throw error }` envolvente en ambos (dejar el cuerpo directo). CUIDADO: si dentro del try habia `return data`, mantenerlo fuera del try (el cuerpo queda como `const opcion=...; const dataConTipo=...; const {data}=await api.post(...); if(...) await cargarDirecciones(...); setDireccionSeleccionada(data); return data;`).
- [ ] **Step 6 — `usePush.js:41` (R3):** lazy init de `suscrito`/`permiso` segun `soportado` (ya detallado en R3) y borrar el branch `if (!soportado) { setSuscrito(false); setPermiso(...); return }` del effect; el resto del effect queda con setState solo tras awaits.
- [ ] **Step 7 — Verificacion completa del task:**
  Run: `npx eslint src/context/AuthContext.jsx src/context/FavoritosContext.jsx src/context/StaffAuthContext.jsx src/context/CartContext.jsx src/context/EnvioContext.jsx src/context/LoadingBarContext.jsx src/hooks/usePush.js`
  Expected: 0 problemas (los `only-export-components` ya resueltos por Task 1 no deben reaparecer).

---

## Task 5: Paginas clientes (`src/pages/` raiz)

**Files:**
- Modify: `src/pages/Carrito.jsx:122`, `:299`, `:300`, `:301`, `:346`, `:438`, `:686`
- Modify: `src/pages/ListaDetalle.jsx:129`, `:185`
- Modify: `src/pages/MisItems.jsx:264`, `:360`, `:688`
- Modify: `src/pages/OrdenDetalle.jsx:84`
- Modify: `src/pages/Presupuesto.jsx:53`, `:318`
- Modify: `src/pages/ProductoDetalle.jsx:96`, `:98`
- Modify: `src/pages/RegistroProfesional.jsx:95`
- Modify: `src/pages/Notificaciones.jsx:120`
- Modify: `src/pages/Cotizaciones.jsx:88`
- Modify: `src/pages/Documentos.jsx:43`, `:73`, `:290`, `:343`
- Modify: `src/pages/Requerimientos.jsx:162`
- Modify: `src/pages/EstadoCuenta.jsx:57`, `:229`
- Modify: `src/pages/Landing.jsx:46`
- Modify: `src/pages/Login.jsx:58`
- Modify: `src/pages/Pagos.jsx:40`
- Modify: `src/pages/ReportesEstadoCuenta.jsx:22`

- [ ] **Step 1:** Leer este task + Recetas R1-R8.
- [ ] **Step 2 — `Carrito.jsx`:**
  - `:122` `error` definido y nunca usado → leer el bloque; si es `const [error, setError] = useState('')` que nunca se lee, borrar el estado y su setter si solo se setea; verificar con `rg "error" src/pages/Carrito.jsx`.
  - `:299`, `:300`, `:301` del destructuring de `useEnvio()` → quitar `setAgenciaSeleccionada`, `agencias`, `loading` (verificar que no se usen en el archivo).
  - `:346` `setEnvioExpandido(true)` cuando delivery sin direccion → R2: mover a donde se invoca `cambiarTipoEnvio`/se cambia `tipoEnvio` en este archivo (los handlers de los tabs de envio); si hay varios puntos, el effect que queda debe NO seter sincronamente: opcion A (preferida) fold en handlers + borrar el effect; opcion B disable comentado justificado si la foldup es inviable.
  - `:438` → leer el effect; segun patron, R1/R2/R3.
  - `:686` `<ResumenPedido />` (static-components) → localizar `ResumenPedido`; si esta definido como const/funcion DENTRO de `Carrito`, extraerlo a nivel de modulo (fuera) pasando por props lo que necesite y conservando sus hooks internos.
- [ ] **Step 3 — `ListaDetalle.jsx`:**
  - `:129` `useEffect(() => { cargarDatos() }, [id])` con disable de exhaustive-deps existente → convertir a R1 (fetch inline con `id` en deps) y BORRAR el comentario `eslint-disable-next-line` (ya no hace falta). `cargarDatos` de paso deja de usarse del effect (si se usa en handlers, conservarla).
  - `:185` `preserve-manual-memoization` en `itemsFiltrados` useMemo → leer el componente (busca el early-return o la posicion tremenda del memo). Fix tipico: reordenar para que `useMemo` este antes de las funciones que lo usan y sin dependencias logicas; si el compiler sigue sin preservar, convertir a const calculada en render:
```jsx
  const itemsFiltrados = !busqueda.trim()
    ? items
    : items.filter((item) => item.productos?.nombre_comercial?.toLowerCase().includes(busqueda.trim().toLowerCase()))
```
  (el React Compiler lo auto-memoiza; verificar con eslint + Task 8 build).
- [ ] **Step 4 — `MisItems.jsx:264/:360/:688`, `OrdenDetalle.jsx:84`, `Presupuesto.jsx:318`, `ProductoDetalle.jsx:98`, `RegistroProfesional.jsx:95`:** leer cada effect señalado y aplicar R1 (fetch de load) o R2/R3 segun sea. La mayoria son `cargarX()` en mount con refresh en handlers → R1.
- [ ] **Step 5 — immutability (R4):** `Presupuesto.jsx:53`, `ProductoDetalle.jsx:96`, `Notificaciones.jsx:120`, `Cotizaciones.jsx:88`, `Documentos.jsx:290`, `Requerimientos.jsx:162` → R1 o reordenar la declaracion antes del effect.
- [ ] **Step 6 — `Documentos.jsx` purity (R3/R7):** `:43` `useState(Date.now())` → `useState(() => Date.now())`. `:73` `const ahora = Date.now()` dentro de `useEstadoRif` → convertirlo a estado con lazy init y que el interval existente haga `setAhora(Date.now())`:
```jsx
function useEstadoRif(solicitudes, solicitarRif) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])
  ...
  // usar `ahora` en vez de `const ahora = Date.now()` en el cuerpo
```
  `:343` → leer; si es otra llamada impura (`new Date()`, `Date.now()`, etc.) en render, envolver en lazy init o moverla a estado. `:290` immutability → R4.
- [ ] **Step 7 — unused (R5):** `EstadoCuenta.jsx:57` (`navigate` no usado → borrar del `useNavigate()` o de su destructuring), `EstadoCuenta.jsx:229` (`file` no usado → leer; si es un `for...of`/event, borrar la referencia), `Landing.jsx:46` (`img` no usado → borrar), `Login.jsx:58` (`catch (err)` → `catch {` si no se usa; si se usa, dejar), `Pagos.jsx:40` (`navigate` → borrar), `ReportesEstadoCuenta.jsx:22` (`formatUSD` no usado → borrar definicion o import).
- [ ] **Step 8 — Verificacion completa del task:**
  Run: `npx eslint src/pages/Carrito.jsx src/pages/ListaDetalle.jsx src/pages/MisItems.jsx src/pages/OrdenDetalle.jsx src/pages/Presupuesto.jsx src/pages/ProductoDetalle.jsx src/pages/RegistroProfesional.jsx src/pages/Notificaciones.jsx src/pages/Cotizaciones.jsx src/pages/Documentos.jsx src/pages/Requerimientos.jsx src/pages/EstadoCuenta.jsx src/pages/Landing.jsx src/pages/Login.jsx src/pages/Pagos.jsx src/pages/ReportesEstadoCuenta.jsx`
  Expected: 0 problemas.

---

## Task 6: Paginas staff existentes (`src/pages/staff/`)

**Files:**
- Modify: `src/pages/staff/StaffAlmacen.jsx:40`
- Modify: `src/pages/staff/StaffCuentasPorCobrar.jsx:51`
- Modify: `src/pages/staff/StaffDespacho.jsx:26`
- Modify: `src/pages/staff/StaffOrdenes.jsx:46`, `:71`, `:98`
- Modify: `src/pages/staff/StaffOrdenesPorCancelar.jsx:40`
- Modify: `src/pages/staff/StaffPagos.jsx:64`, `:171`
- Modify: `src/pages/staff/StaffVentas.jsx:85`, `:253`

- [ ] **Step 1:** Leer este task + Recetas R1-R8.
- [ ] **Step 2:** aplicar R1 a cada `useEffect` señalado (cargas iniciales). Recordar que estas páginas usan **staffApi** (`src/api/staffAxios.js`), conservar la ruta del endpoint como este hoy. Si la funcion `cargarX` se reutiliza en handlers (refrescar, tabs), conservarla y duplicar el fetch inline SOLO en el effect.
- [ ] **Step 3 — Verificacion completa del task:**
  Run: `npx eslint src/pages/staff/StaffAlmacen.jsx src/pages/staff/StaffCuentasPorCobrar.jsx src/pages/staff/StaffDespacho.jsx src/pages/staff/StaffOrdenes.jsx src/pages/staff/StaffOrdenesPorCancelar.jsx src/pages/staff/StaffPagos.jsx src/pages/staff/StaffVentas.jsx`
  Expected: 0 problemas.

---

## Task 7: Utils PDF (`src/utils/`)

**Files:**
- Modify: `src/utils/generarComprobantePagoPDF.js:58`
- Modify: `src/utils/generarFacturaPDF.js:76`
- Modify: `src/utils/generarReporteEstadoCuentaPDF.js:79`

- [ ] **Step 1:** Leer los 3 archivos en las lineas señaladas.
- [ ] **Step 2 — no-useless-assignment + no-unused-vars (R5):** el patron es `let y = ...; y = dibujarX(doc, ...); ... y = dibujarUltimo(doc, ..., y)` donde la ASIGNACION final nunca se lee (tras ella no hay mas uso de `y`). Fix: convertir esa ultima asignacion en llamada simple:
```js
// antes
y = dibujarUltimo(doc, pago, y)
// despues
dibujarUltimo(doc, pago, y)
```
  Solo la ULTIMA asignacion que no se re-lee; las anteriores que alimentan la siguiente se MANTIENEN como `y = ...`. Verificar en cada archivo que tras el cambio `y` no se use en ningun punto posterior.
- [ ] **Step 3 — Verificacion completa del task:**
  Run: `npx eslint src/utils/generarComprobantePagoPDF.js src/utils/generarFacturaPDF.js src/utils/generarReporteEstadoCuentaPDF.js`
  Expected: 0 problemas.

---

## Task 8: Verificacion final + commit

**Files:**
- Modify: nada (verificacion)

- [ ] **Step 1:** (Ya aplicada la Task 1) ejecutar el lint de TODO el repo:
  Run: `npm run lint`
  Expected: `✖ 0 problems` y salida vacia. Si quedan problemas, comparar contra el baseline y corregir (deben ser NUEVOS; reportarlos).
- [ ] **Step 2:** Build completo:
  Run: `npm run build`
  Expected: `✓ built` (vite). El PWA service worker tambien debe construir.
- [ ] **Step 3:** Sanity check de los TO-DOs: revisar que ninguna de las paginas staff recien creadas (StaffCotizaciones/Requerimientos/Documentos/Promociones/Direcciones) figuren en el lint ni hayan sido tocadas.
- [ ] **Step 4:** Commit (estilo del repo, mensajes en espanol o neutro):
```bash
git add -A
git commit -m "chore: limpieza de lint (0 problemas)"
```

---

## Self-Review (verificado antes de guardar)

- **Cobertura del spec:** alcance = 151 problemas (58 set-state-in-effect, 39 no-unused-vars, 15 immutability, 13 exhaustive-deps, 9 only-export-components, 6 no-undef, 3 purity, 3 no-useless-assignment, 2 no-useless-catch, 1 refs, 1 preserve-manual-memoization, 1 static-components). Task 1 → 9 (config); Task 2 → 16 archivos; Task 3 → 28; Task 4 → 6; Task 5 → 16; Task 6 → 7; Task 7 → 3. Total archivos con problemas asignados: 79 (coincide con el reporte). Sin solape de archivos entre tasks (paralelismo seguro).
- **Placeholders:** ninguna tarea usa "TBD"; los casos abiertos (Navbar:228, BuscadorFiltro:16, Carrito:346) tienen criterio explicito de decision (fold vs disable justificado) y veredicto preferido.
- **Consistencia de nombres:** recetas R1-R8 usadas consistentemente; `useMemo`/`useCallback`/`staffApi`/`import.meta.env.VITE_API_URL` referenciados con los mismos nombres en todas las tareas.