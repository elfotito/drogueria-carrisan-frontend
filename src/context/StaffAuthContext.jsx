import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import staffApi from '../api/staffAxios';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/safeStorage';

const StaffAuthContext = createContext();

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(() => safeGetItem('staff_token'));
  const [staff, setStaff] = useState(() => {
    if (!token) return null;
    if (!isTokenValid(token)) {
      safeRemoveItem('staff_token');
      safeRemoveItem('staff_user');
      return null;
    }
    try {
      const guardado = safeGetItem('staff_user');
      if (guardado) {
        try { return JSON.parse(guardado); } catch { return jwtDecode(token); }
      }
      return jwtDecode(token);
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  // Guarda una sesión staff ya autenticada ({ token, staff }). Lo usa el
  // login y también el registro staff (el backend devuelve token+staff y
  // así se evita un doble POST).
  function iniciarSesionConDatos({ token, staff }) {
    safeSetItem('staff_token', token);
    safeSetItem('staff_user', JSON.stringify(staff));
    setToken(token);
    setStaff(staff);
    return staff;
  }

  async function loginStaff(email, password) {
    const { data } = await staffApi.post('/staff/login', { email, password });
    return iniciarSesionConDatos(data);
  }

  function logoutStaff() {
    safeRemoveItem('staff_token');
    safeRemoveItem('staff_user');
    setToken(null);
    setStaff(null);
  }

  return (
    <StaffAuthContext.Provider value={{ staff, token, loading, loginStaff, logoutStaff, iniciarSesionConDatos }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  return useContext(StaffAuthContext);
}