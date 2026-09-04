# AGENTS.md — Frontend (drogueria-carrisan-frontend)

## Comandos

```bash
npm run dev      # Desarrollo (Vite en localhost:5173)
npm run build    # Build de produccion
npm run lint     # ESLint
npm run preview  # Preview del build
```

## Stack

- React 19 + React Router 7 (BrowserRouter)
- Vite 8 + vite-plugin-pwa (service worker con injectManifest)
- Chakra UI v3 (parcial, no todo el proyecto lo usa)
- Axios para HTTP (configurado en src/api/axios.js)
- JWT auth via localStorage
- Leaflet para mapas
- Recharts para graficos/analytics
- jsPDF + jspdf-autotable para PDFs de facturas/reportes
- xlsx para exportar Excel
- @dnd-kit para drag-and-drop (orden de prioridades, etc.)

## Estructura src/

```
src/
├── api/
│   ├── axios.js              # Instancia de Axios del CLIENTE (token localStorage 'token')
│   └── staffAxios.js         # Instancia de Axios del STAFF (token localStorage 'staff_token') — sesion separada
├── assets/                   # Imagenes, logos, favicon
├── components/               # Componentes reutilizables
│   ├── admin/                # Componentes del panel admin (~33 archivos)
│   ├── icons/                # Iconos custom
│   ├── paginas-principales/  # Layouts de navegacion
│   ├── registro/             # Stepper, Selectores de estado/ciudad, Turnstile, SubidaArchivos
│   ├── ui/                   # Wrappers de Chakra UI (provider, toaster, tooltip)
│   └── PrivateRouteStaff.jsx # Guard de staff: sesion staff + rolesPermitidos opcional
├── config/empresa.js         # Datos estaticos de la empresa
├── context/                  # React Contexts
│   ├── AuthContext.jsx        # CLIENTE: JWT + sesion + expiracion (user.es_admin)
│   ├── StaffAuthContext.jsx   # STAFF: JWT + sesion separada (staff.rol)
│   ├── CartContext.jsx        # Carrito de compras
│   ├── EnvioContext.jsx       # Gestion de envios/direcciones
│   ├── FavoritosContext.jsx   # Lista de favoritos
│   └── LoadingBarContext.jsx  # Barra de carga superior
├── hooks/                    # Custom hooks (useEsMobile, usePush)
├── pages/                    # Paginas (~44 archivos)
│   └── staff/                # StaffLogin, StaffDashboard, StaffDespacho, StaffOrdenes (+ CSS)
├── utils/                    # Helpers (validadores, generadores de PDF, etc.)
├── App.jsx                   # Router principal (Routes)
├── main.jsx                  # Entry point (BrowserRouter + Provider Chakra)
└── sw.js                     # Service worker para PWA
```

## Arquitectura de componentes

### Contexts — Providers en App.jsx (orden de anidamiento)
1. AuthProvider — CLIENTE: JWT, login/logout, user state (user.es_admin)
2. StaffAuthProvider — STAFF: sesion interna separada (staff.rol)
3. CartProvider — carrito de compras
4. FavoritosProvider — productos favoritos
5. EnvioProvider — direcciones de envio
6. LoadingBarProvider — barra de progreso superior

### Rutas protegidas
- `<PrivateRoute>` — Requiere autenticacion (cualquier usuario logueado)
- `<PrivateRouteSensible>` — Requiere auth + puede tener restricciones adicionales
- `<PrivateRoute adminOnly>` — Solo admin
- `<PrivateRouteStaff>` — Requiere sesion staff (+ `rolesPermitidos` opcional)

### Registro — 3 formularios independientes
- `/registro` → RegistroConTipo (selector de tipo)
- `/registro/institucional` → RegistroInstitucional (multi-paso: Datos → Documentos → Confirmacion)
- `/registro/profesional` → RegistroProfesional (multi-paso)
- `/registro/honorifico` → RegistroHonorifico (multi-paso, requiere codigo de invitacion)
- `/registro/finalizar` → RegistroPasoFinal (contrasena + Turnstile — compartido)

Cada formulario de registro es un archivo JSX autonomo con su propio estado local (useState, no useReducer). No comparten logica de formulario entre si.

### Login — Flujo de dos pasos
1. El usuario escribe email → se verifica si existe via POST /auth/check-email
2. Si existe →滑 al paso de contrasena. Si no → redirige a /registro con el email precargado

### API — Interceptor de Axios
- Agrega Authorization: Bearer <token> automaticamente
- Si recibe 401 (excepto en /auth/login), limpia token y redirige a /login?expirado=1
- Muestra loading bar en cada request

### CSS
- NO se usa CSS modules ni CSS-in-JS para todo. La mayoria de componentes tienen su propio archivo .css al lado.
- Auth pages usan Auth.css compartido
- Los estilos son CSS plain, no Tailwind, no CSS modules
- Paleta de marca: #1B4B8F (azul oscuro), #12A594 (teal), #0052DC (azul principal), #232B45 (gris oscuro)

## Paginas principales

| Pagina | Ruta | Auth? | Descripcion |
|--------|------|-------|-------------|
| Home | /home | Si | Dashboard del usuario con carruseles, ofertas, etc. |
| Catalogo | /catalogo | No | Catalogo de productos con busqueda y filtros |
| ProductoDetalle | /producto/:id | No | Detalle de producto individual |
| Carrito | /carrito | Si | Carrito de compras + checkout |
| MisOrdenes | /orders | Si | Historial de pedidos |
| OrdenDetalle | /orders/:id | Si | Detalle de un pedido |
| MiCuenta | /cuenta | Si | Perfil y configuracion |
| MisItems | /mis-items | Si | Listas personalizadas de items |
| EstadoCuenta | /estado-cuenta | Si+ | Estado de cuenta (sensible) |
| Admin | /admin/* | Admin | Panel administrativo completo |
| Chat | /chat | No | Chat con la empresa |
| Notificaciones | /notificaciones | Si | Centro de notificaciones |
| Direcciones | /direcciones | Si | Gestion de direcciones de envio |
| Ofertas | /ofertas | Si | Ofertas especiales |
| Cotizaciones | /mis-solicitudes/cotizaciones | Si | Solicitudes de cotizacion |
| Presupuesto | /presupuesto | Si | Presupuesto/requerimiento rapido |

## Paginas admin (dentro de /admin)

El Admin.jsx usa rutas anidadas. Componentes en `src/components/admin/`:
- DashboardAdmin, OrdenesAdmin, ProductosAdmin, UsuariosAdmin
- PagosAdmin, FacturaForm, EstadoCuentaAdmin
- PromocionesAdmin, DescuentosAdmin, DeliveryAdmin
- AnalyticsVentas, EstadisticasProductos, TasaCambio
- ChatAdmin, DocumentosAdmin, RequerimientosAdmin, CotizacionesAdmin
- MoleculasPanel, FichasProductoAdmin

## PWA / Service Worker

- Configurada via vite-plugin-pwa con injectManifest
- Service worker en src/sw.js
- Workbox para caching (precaching + strategies)
- Manifest: Drogueria Carrisan, theme #0052DC
- PWA staff separada: `public/manifest-staff.json` (scope /staff/, start_url /staff/login) + iconos `staff-*.png`
  - OJO: `PwaScopeSwitcher` (cambia manifest/titulo/icono segun la ruta sea /staff) esta importado en App.jsx pero NO montado — el swap de la PWA staff NO funciona actualmente.

## Autenticacion de personal interno (staff) — Frontend

El personal de la empresa (vendedor, despachador, administrador, admin) NO usa el login de clientes (`/auth/login`). Tiene su propio flujo bajo `/staff` (login separado, como en el backend).

- **Dos sesiones independientes en el mismo navegador** (coexisten sin pisarse):
  - Cliente: `localStorage.token` + `localStorage.user` → AuthContext, gates con `user.es_admin`
  - Staff: `localStorage.staff_token` + `localStorage.staff_user` → StaffAuthContext, `staff.rol`
  - Claves de localStorage, contexts y axios distintos. Nunca mezclar `useAuth` con `useStaffAuth`.

- **API layer**: `src/api/staffAxios.js` es una instancia axios separada que lee `staff_token`. Ante un 401 (excepto en `/staff/login`) limpia la sesion y redirige a `/staff/login?expirado=1`. NO usa la loading bar de `axios.js` (esa barra solo funciona en el cliente).

- **StaffAuthContext** exporta: `{ staff, token, loading, loginStaff, logoutStaff }`. `loginStaff(email,password)` hace POST `/staff/login` y guarda `data.token` + `data.staff`.

- **Guard**: `<PrivateRouteStaff rolesPermitidos={[...]}>` envuelve las paginas staff. Sin `rolesPermitidos` solo exige sesion staff; con roles redirige a `/staff/dashboard` si el `staff.rol` no coincide. El Navbar se oculta en cualquier ruta `/staff/*` (ver Navbar.jsx).

- **Admin bridge** (boton "Administrativo" en StaffDashboard): POST `/staff/admin-bridge` devuelve un JWT de CLIENTE valido (mismo formato que `/auth/login`) para la cuenta `users` cuyo email coincida y tenga `es_admin=true`. El frontend escribe `token` + `user` en localStorage del cliente y hace `window.location.href='/admin'` (recarga completa a proposito — AuthContext ya montado no relee localStorage; un `navigate` no bastaria). El staff debe tener una cuenta cliente con `es_admin=true` con el MISMO email para poder entrar a `/admin`.

- **PWA staff**: ver seccion PWA arriba. El swap requiere montar `<PwaScopeSwitcher/>`.

## Paginas staff (dentro de /staff)

| Ruta | Guard | Estado | Descripcion |
|------|-------|--------|-------------|
| /staff/login | publico | funcional | Login interno (email+password), usa Auth.css |
| /staff/dashboard | PrivateRouteStaff | funcional | Cards filtradas por rol + boton admin-bridge |
| /staff/despacho | roles: despachador/admin | funcional | Cola de ordenes 'enviado' + marcar entregado |
| /staff/ordenes | roles: vendedor/admin | funcional | Crear orden a nombre de un cliente (buscar cliente, tipo de envio + direccion delivery, items, POST /staff/ordenes). CSS propio `StaffOrdenes.css`. |

**Plan de módulos staff por rol (incl. rol `preparador`, estadísticas separadas, proveedores):** ver `analisis/plan-modulos-staff-por-rol.md` (raíz del repo). Principio: los endpoints NUEVOS de operación van bajo `/staff/*` (sesión staff); el panel `/admin` queda solo para el dueño vía bridge.

La pagina de crear orden a cliente (StaffOrdenes) usa **staffApi** (no el `api` de clientes) y los endpoints `/staff/*`: `GET /staff/clientes?buscar=`, `GET /staff/clientes/:id/direcciones`, `POST /staff/ordenes`. El campo `creado_por_staff_id` lo agrega el backend, no el frontend. Los errores de validacion llegan estructurados (credito/stock) y se muestran como toast en pantalla.

## CSS responsive — Auth pages

- `.auth-container` → max-width 440px (login, simples)
- `.auth-container--registro` → max-width 720px (formularios multi-columna)
- Mobile: ambos a 100% con padding reducido
- Desktop: containers centrados con max-width fijo

## Errores comunes a evitar

1. **No agregar imports en App.jsx sin verificar** que el componente exista. Landing.jsx esta conectado via RootRedirect.jsx — no confundir con un archivo huerfano.
2. **El AuthContext exporta `login(email, password)`** que retorna el usuario. No confundir con `login` de React Router.
3. **El Chakra Toaster esta en App.jsx.** No duplicar en main.jsx.
4. **Los PDFs se generan en el frontend** con jsPDF, no en el backend.
5. **Las validaciones** estan en src/utils/validadores.js y se reusan en Login y todos los registros.
6. **La ruta `/analytics` esta protegida** con `<PrivateRoute adminOnly>`. No quitar el guard.
7. **Staff ≠ cliente.** No mezclar `useAuth`/`api` con `useStaffAuth`/`staffApi`. Usa `staffApi` para endpoints `/staff` y `api` para `/auth` y el resto. Nunca llamar `useAuth().login()` desde una pagina staff (eso seria el login de cliente, no staff).
8. **PwaScopeSwitcher no esta montado** — no asumas que el swap de manifest staff funciona; requiere montarlo en App.jsx. Al montarlo, verificar que exista el componente (ver Error #1).
