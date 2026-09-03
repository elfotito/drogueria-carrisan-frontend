import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import staffApi from '../api/staffAxios';

const StaffAuthContext = createContext();

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}

export function StaffAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('staff_token'));
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && isTokenValid(token)) {
      const guardado = localStorage.getItem('staff_user');
      if (guardado) {
        try {
          setStaff(JSON.parse(guardado));
        } catch (e) {
          setStaff(jwtDecode(token));
        }
      } else {
        setStaff(jwtDecode(token));
      }
    } else {
      if (token) {
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
      }
      setStaff(null);
    }
    setLoading(false);
  }, [token]);

  async function loginStaff(email, password) {
    const { data } = await staffApi.post('/staff/login', { email, password });
    localStorage.setItem('staff_token', data.token);
    localStorage.setItem('staff_user', JSON.stringify(data.staff));
    setToken(data.token);
    setStaff(data.staff);
    return data.staff;
  }

  function logoutStaff() {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    setToken(null);
    setStaff(null);
  }

  return (
    <StaffAuthContext.Provider value={{ staff, token, loading, loginStaff, logoutStaff }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  return useContext(StaffAuthContext);
}