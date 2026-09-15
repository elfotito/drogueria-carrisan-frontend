import axios from 'axios';
import { safeGetItem, safeRemoveItem } from '../utils/safeStorage';

// Instancia separada de la de clientes: usa su propio token
// ('staff_token') y su propio flujo de sesión vencida. Así un mismo
// navegador puede tener una sesión de cliente y una de staff activas
// a la vez sin que se pisen (dos localStorage keys distintas).
const staffApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

staffApi.interceptors.request.use((config) => {
  const token = safeGetItem('staff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

staffApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const esNoAutorizado = error.response?.status === 401;
    const esRequestDeLogin = error.config?.url?.includes('/staff/login');

    if (esNoAutorizado && !esRequestDeLogin) {
      safeRemoveItem('staff_token');
      safeRemoveItem('staff_user');
      if (!window.location.pathname.startsWith('/staff/login')) {
        window.location.href = '/staff/login?expirado=1';
      }
    }

    return Promise.reject(error);
  }
);

export default staffApi;