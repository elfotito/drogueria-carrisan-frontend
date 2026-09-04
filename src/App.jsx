import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { EnvioProvider } from './context/EnvioContext'
import { FavoritosProvider } from './context/FavoritosContext'
import { LoadingBarProvider, useLoadingBar } from './context/LoadingBarContext'
import { registerLoadingBar } from './api/axios'
import { useEffect } from 'react'
import TopLoadingBar from './components/TopLoadingBar'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopFloat from './components/ScrollToTopFloat'
import PrivateRoute from './components/PrivateRoute'
import PrivateRouteSensible from './components/PrivateRouteSensible'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import RecuperarPassword from './pages/Recuperarpassword'
import Registro from './pages/RegistroConTipo'
import RegistroInstitucional from './pages/RegistroInstitucional'
import RegistroProfesional from './pages/RegistroProfesional'
import RegistroHonorifico from './pages/RegistroHonorifico'
import Carrito from './pages/Carrito'
import MisOrdenes from './pages/MisOrdenes'
import Admin from './pages/Admin'
import QuienesSomos from './pages/QuienesSomos'
import Ayuda from './pages/Ayuda'
import Contacto from './pages/Contacto'
import MiCuenta from './pages/MiCuenta'
import MisItems from './pages/MisItems'
import Notificaciones from './pages/Notificaciones'
import Terminos from './pages/Terminos'
import Privacidad from './pages/Privacidad'
import EstadoCuenta from './pages/EstadoCuenta'
import ProductoDetalle from './pages/ProductoDetalle'
import ListaDetalle from './pages/ListaDetalle'
import Menu from './pages/Menu'
import Ofertas from './pages/Ofertas'
import LineaFarmacia from './pages/LineaFarmacia'
import LineaHospitalaria from './pages/LineaHospitalaria'
import OrdenDetalle from './pages/OrdenDetalle'
import Direcciones from './pages/Direcciones'
import Pagos from './pages/Pagos'
import RootRedirect from './components/RootRedirect'
import { Toaster } from './components/ui/toaster'
import PagosEstadoCuenta from './pages/PagosEstadoCuenta'
import FacturasEstadoCuenta from './pages/FacturasEstadoCuenta'
import AmpliacionEstadoCuenta from './pages/AmpliacionEstadoCuenta'
import ReportesEstadoCuenta from './pages/ReportesEstadoCuenta'
import Cotizaciones from './pages/Cotizaciones'
import Requerimientos from './pages/Requerimientos'
import Documentos from './pages/Documentos'
import ChatCentro from './pages/Chat'
import SubUsuarios from'./pages/SubUsuarios'
import Presupuesto from'./pages/Presupuesto'
import Mantenimiento from './pages/Mantenimiento'
import AnalyticsVentas from './components/admin/AnalyticsVentas'
import { StaffAuthProvider } from './context/StaffAuthContext'
import PrivateRouteStaff from './components/PrivateRouteStaff'
import PwaScopeSwitcher from './components/PwaScopeSwitcher'
import StaffLogin from './pages/staff/StaffLogin'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffDespacho from './pages/staff/StaffDespacho'
import StaffOrdenes from './pages/staff/StaffOrdenes'
import StaffAlmacen from './pages/staff/StaffAlmacen'
import StaffContabilidad from './pages/staff/StaffContabilidad'


function LoadingBarBridge() {
  const bar = useLoadingBar()
  useEffect(() => { registerLoadingBar(bar) }, [bar])
  return <TopLoadingBar />
}

function App() {
  return (
  <AuthProvider>
    <StaffAuthProvider>
      <CartProvider>
        <FavoritosProvider>
          <EnvioProvider>
            <ScrollToTop />
            <LoadingBarProvider>
              <PwaScopeSwitcher />
              <Navbar />
              <ScrollToTopFloat />
              <LoadingBarBridge />
              <Toaster />
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recuperar" element={<RecuperarPassword />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/registro/finalizar" element={<Registro />} />
                <Route path="/registro/institucional" element={<RegistroInstitucional />} />
                <Route path="/registro/profesional" element={<RegistroProfesional />} />
                <Route path="/registro/honorifico" element={<RegistroHonorifico />} />
                <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><MisOrdenes /></PrivateRoute>} />
                <Route path="/orders/:id" element={<PrivateRoute><OrdenDetalle /></PrivateRoute>} />
                <Route path="/pagos" element={<PrivateRouteSensible><Pagos /></PrivateRouteSensible>} />
                <Route path="/admin/*" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/dashboard" element={<PrivateRouteStaff><StaffDashboard /></PrivateRouteStaff>} />
                <Route path="/staff/despacho" element={<PrivateRouteStaff rolesPermitidos={['despachador', 'administrador', 'director', 'admin']}><StaffDespacho /></PrivateRouteStaff>} />
                <Route path="/staff/ordenes" element={<PrivateRouteStaff rolesPermitidos={['vendedor', 'administrador', 'director', 'admin']}><StaffOrdenes /></PrivateRouteStaff>} />
                <Route path="/staff/almacen" element={<PrivateRouteStaff rolesPermitidos={['almacenista', 'administrador', 'director', 'admin']}><StaffAlmacen /></PrivateRouteStaff>} />
                <Route path="/staff/contabilidad" element={<PrivateRouteStaff rolesPermitidos={['contabilidad', 'administrador', 'director', 'admin']}><StaffContabilidad /></PrivateRouteStaff>} />
                <Route path="/quienes-somos" element={<QuienesSomos />} />
                <Route path="/ayuda" element={<Ayuda />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/cuenta" element={<PrivateRoute><MiCuenta /></PrivateRoute>} />
                <Route path="/mis-items" element={<PrivateRoute><MisItems /></PrivateRoute>} />
                <Route path="/notificaciones" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/mantenimiento" element={<Mantenimiento />} />
                <Route path="/estado-cuenta" element={<PrivateRouteSensible><EstadoCuenta /></PrivateRouteSensible>} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/listas/:id" element={<PrivateRoute><ListaDetalle /></PrivateRoute>} />
                <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
                <Route path="/ofertas" element={<PrivateRoute><Ofertas /></PrivateRoute>} />
                <Route path="/farmacia" element={<PrivateRoute><LineaFarmacia /></PrivateRoute>} />
                <Route path="/hospitalaria" element={<PrivateRoute><LineaHospitalaria /></PrivateRoute>} />
                <Route path="/direcciones" element={<PrivateRoute><Direcciones /></PrivateRoute>} />
                <Route path="/estado-cuenta/pagos" element={<PrivateRouteSensible><PagosEstadoCuenta /></PrivateRouteSensible>} />
                <Route path="/estado-cuenta/facturas" element={<PrivateRouteSensible><FacturasEstadoCuenta /></PrivateRouteSensible>} />
                <Route path="/estado-cuenta/reportes" element={<PrivateRouteSensible><ReportesEstadoCuenta /></PrivateRouteSensible>} />
                <Route path="/estado-cuenta/ampliacion" element={<PrivateRouteSensible><AmpliacionEstadoCuenta /></PrivateRouteSensible>} />
                <Route path="/mis-solicitudes/cotizaciones" element={<PrivateRoute><Cotizaciones /></PrivateRoute>} />
                <Route path="/mis-solicitudes/requerimientos" element={<PrivateRoute><Requerimientos /></PrivateRoute>} />
                <Route path="/mis-solicitudes/documentos" element={<PrivateRoute><Documentos /></PrivateRoute>} />
                <Route path="/chat" element={<ChatCentro />} />
                <Route path="/chat/orden/:ordenId" element={<ChatCentro />} />
                <Route path="/subusuarios" element={<SubUsuarios />} />
                <Route path="/presupuesto" element={<Presupuesto />} />
                <Route path="/analytics" element={<PrivateRoute adminOnly><AnalyticsVentas /></PrivateRoute>} />
              </Routes>
            </LoadingBarProvider>
          </EnvioProvider>
        </FavoritosProvider>
      </CartProvider>
    </StaffAuthProvider>
  </AuthProvider>
  )
}

export default App