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
├── api/axios.js              # Instancia de Axios con interceptores (auth, loading bar, 401 redirect)
├── assets/                   # Imagenes, logos, favicon
├── components/               # Componentes reutilizables
│   ├── admin/                # Componentes del panel admin (~33 archivos)
│   ├── icons/                # Iconos custom
│   ├── paginas-principales/  # Layouts de navegacion
│   ├── registro/             # Stepper, Selectores de estado/ciudad, Turnstile, SubidaArchivos
│   └── ui/                   # Wrappers de Chakra UI (provider, toaster, tooltip)
├── config/empresa.js         # Datos estaticos de la empresa
├── context/                  # React Contexts
│   ├── AuthContext.jsx        # JWT + sesion + expiracion
│   ├── CartContext.jsx        # Carrito de compras
│   ├── EnvioContext.jsx       # Gestion de envios/direcciones
│   ├── FavoritosContext.jsx   # Lista de favoritos
│   └── LoadingBarContext.jsx  # Barra de carga superior
├── hooks/                    # Custom hooks (useEsMobile, usePush)
├── pages/                    # Paginas (~44 archivos)
├── utils/                    # Helpers (validadores, generadores de PDF, etc.)
├── App.jsx                   # Router principal (Routes)
├── main.jsx                  # Entry point (BrowserRouter + Provider Chakra)
└── sw.js                     # Service worker para PWA
```

## Arquitectura de componentes

### Contexts — Providers en App.jsx (orden de anidamiento)
1. AuthProvider — JWT, login/logout, user state
2. CartProvider — carrito de compras
3. FavoritosProvider — productos favoritos
4. EnvioProvider — direcciones de envio
5. LoadingBarProvider — barra de progreso superior

### Rutas protegidas
- `<PrivateRoute>` — Requiere autenticacion (cualquier usuario logueado)
- `<PrivateRouteSensible>` — Requiere auth + puede tener restricciones adicionales
- `<PrivateRoute adminOnly>` — Solo admin

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

## CSS responsive — Auth pages

- `.auth-container` → max-width 440px (login, simples)
- `.auth-container--registro` → max-width 720px (formularios multi-columna)
- Mobile: ambos a 100% con padding reducido
- Desktop: containers centrados con max-width fijo

## Errores comunes a evitar

1. **No agregar imports en App.jsx sin verificar** que el componente exista. Hay archivos que existen en src/ pero no estan importados en App.jsx (Landing.jsx, por ejemplo).
2. **El AuthContext exporta `login(email, password)`** que retorna el usuario. No confundir con `login` de React Router.
3. **Chakra UI Provider esta en main.jsx Y en App.jsx** (Toaster duplicado). No duplicar.
4. **Los PDFs se generan en el frontend** con jsPDF, no en el backend.
5. **Las validaciones** estan en src/utils/validadores.js y se reusan en Login y todos los registros.
