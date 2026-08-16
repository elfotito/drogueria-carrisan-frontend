import axios from 'axios';

let loadingBarHooks = { start: () => {}, finish: () => {} }
export function registerLoadingBar(hooks) { loadingBarHooks = hooks }

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  loadingBarHooks.start()
  return config
})
api.interceptors.response.use(
  (res) => { loadingBarHooks.finish(); return res },
  (err) => { loadingBarHooks.finish(); return Promise.reject(err) }
)
// Interceptor: agrega el token JWT automáticamente a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si el backend responde 401, el token venció o es
// inválido a mitad de sesión (ej. el usuario estaba navegando y expiró).
// Sin esto, cada página tiene que manejar el 401 por su cuenta y el usuario
// queda en un estado raro de "sesión abierta pero rota" -- exactamente el bug
// reportado con Mis Órdenes.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esNoAutorizado = error.response?.status === 401;
    // No aplica esta lógica al propio intento de login: un 401 ahí significa
    // "credenciales incorrectas", no "sesión expirada" -- eso ya lo maneja
    // Login.jsx directamente con su propio mensaje de error.
    const esRequestDeLogin = error.config?.url?.includes('/auth/login');

    if (esNoAutorizado && !esRequestDeLogin) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expirado=1';
      }
    }

    return Promise.reject(error);
  }
);

export default api;