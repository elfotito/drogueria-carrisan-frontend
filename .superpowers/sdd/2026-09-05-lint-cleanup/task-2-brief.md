# Brief: task-2
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
- [ ] **Step 2 â€” Los 8 componentes de carga (R1):** `BannerOnboarding.jsx`, `BottomNav.jsx`, `BuscadorMovil.jsx`, `ConfirmarPedidoModal.jsx`, `InstalarAppBtn.jsx:44`, `OrdenDetalleModal.jsx:28`, `PinCheckout.jsx:31`. Cada uno: leer el effect seÃ±alado; si es `cargar()`/fetch en mount â†’ R1 (inline fetch + guard activo). `PinCheckout.jsx` probablemente es un fetch de PIN al mount â†’ R1.
- [ ] **Step 3 â€” `PrivateRouteSensible.jsx:25` (R3):** el effect hace `if (loading || !user) { setVerificando(false); return }` sincrono. Fix: `useState(() => true)` para `verificando` y reestructurar para que el `setVerificando(false)` inicial NO dependa de sincronia:
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
    return <p>Verificando sesiÃ³n...</p>
  }
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !user.es_admin) return <Navigate to="/" replace />
  if (user && valido === false) return <Navigate to="/login?expirado=1" replace />
  return children
}
```
  Verificar que los navegadores de `!user` y de `adminOnly` sigan funcionando igual (renders intermedios identicos en pantalla).
- [ ] **Step 4 â€” `Navbar.jsx` (casos especiales):**
  - `:113` `opcionesEnvio` no usada â†’ quitarla del destructuring de `useEnvio()` (verificar con `rg "opcionesEnvio" src/components/Navbar.jsx` que no se use en otro sitio).
  - `:192` `setDeptoActivo(null)` cuando `!showDeptosMenu` y `:194` `setServicioActivo(null)` â†’ R2: buscar todos los `setShowDeptosMenu(false)`/`setShowServiciosMenu(false)` y `setShowDeptosMenu(true)` en el archivo y mover los resets a esos handlers; borrar el effect 190-197.
  - `:202` branch de busqueda vacia â†’ R3 (mover el `if (busqueda.length < 1) {...}` dentro del `setTimeout` del debounce).
  - `:228` `if (!user) { setNotificacionesNoLeidas(0); return }` â†’ mantener el effect, pero hacer el fetch siempre en cadena async y el reset solo via `finally` NO es equivalente (no corre sin user). Solucion: dejar `notificacionesNoLeidas` en 0 de init, y en el effect hacer:
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
  (elegir una u otra; la primera prioriza el lint, la segunda prioriza el badge exacto â€” NO ambas).
  - `:223` warning exhaustive-deps `cargarDirecciones` â†’ agregar `cargarDirecciones` al array de deps (ya es `useCallback` estable en `EnvioContext`).
- [ ] **Step 5 â€” `Navbar.jsx` (resto) y efectos debounce:** deja el `useEffect` de click-outside (147-187) como esta; el effect de notificaciones conforme Step 4; verificar con `npx eslint` que las 4 lineas (113,192,202,223,228) quedan en cero.
- [ ] **Step 6 â€” `OrdenDetalleModal.jsx:24` (R6):** `itemsOrden` es una expresion logica usada como dep de 2 useMemo â†’ envolver su inicializacion en su propio `useMemo`. Leer el archivo, localizar `const itemsOrden = ... || []` y:
```jsx
const itemsOrden = useMemo(() => (orden?.items ?? []), [orden?.items])
```
- [ ] **Step 7 â€” `BuscadorFiltro.jsx:16` y `MapaPicker.jsx:94` (R6):** `BuscadorFiltro` â€” `onFiltrar` viene del padre; leer el efecto; si es un "llamar al filtrar al montar/cambiar", mover la logica para que el effect solo dependa de value estable o usar disable justificado. `MapaPicker` â€” `reverseGeocodeNominatim` es funcion del mismo archivo â†’ envolverla en `useCallback` (con sus deps) y agregarla a la lista de deps del useCallback seÃ±alado.
- [ ] **Step 8 â€” `InstalarAppBtn.jsx:21`:** eliminar `const esIOS = ...` si no se usa (verificar). `:44` â€” efecto de install/promo â†’ R1 o R3 segun si setea sync en el body.
- [ ] **Step 9 â€” `GestionDirecciones.jsx:28` (R4):** reordenar para que la funcion usada en el effect se declare antes, o R1 si es un fetch de load.
- [ ] **Step 10 â€” unused (R5):** `AgregarAItemsModal.jsx:22,:66`, `AgregarDireccionModal.jsx:41`, `PinCheckout.jsx:120` (`catch (err)` â†’ `catch {` si no se usa; si se usa, dejar). `LeafletMap.jsx:1` y `TopLoadingBar.jsx:1` â†’ borrar imports `React` y `useRef` sin uso.
- [ ] **Step 11 â€” Verificacion completa del task:**
  Run: `npx eslint src/components/BannerOnboarding.jsx src/components/BottomNav.jsx src/components/BuscadorMovil.jsx src/components/ConfirmarPedidoModal.jsx src/components/InstalarAppBtn.jsx src/components/Navbar.jsx src/components/OrdenDetalleModal.jsx src/components/PinCheckout.jsx src/components/PrivateRouteSensible.jsx src/components/BuscadorFiltro.jsx src/components/MapaPicker.jsx src/components/GestionDirecciones.jsx src/components/AgregarAItemsModal.jsx src/components/AgregarDireccionModal.jsx src/components/LeafletMap.jsx src/components/TopLoadingBar.jsx`
  Expected: 0 problemas.

---


