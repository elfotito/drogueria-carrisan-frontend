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
import PrivateRoute from './components/PrivateRoute'
import PrivateRouteSensible from './components/PrivateRouteSensible'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import Registro from './pages/RegistroConTipo'
import RegistroPasoFinal from './pages/RegistroPasoFinal'
import RegistroInstitucional from './pages/RegistroInstitucional'
import RegistroProfesional from './pages/RegistroProfesional'
import RegistroHonorifico from './pages/RegistroHonorifico'
import Carrito from './pages/Carrito'
import MisOrdenes from './pages/MisOrdenes'
import Admin from './pages/Admin'
import QuienesSomos from './pages/QuienesSomos'
import FAQ from './pages/FAQ'
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
import Landing from './pages/Landing'
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
import AnalyticsVentas from './components/admin/AnalyticsVentas'


function LoadingBarBridge() {
  const bar = useLoadingBar()
  useEffect(() => { registerLoadingBar(bar) }, [bar])
  return <TopLoadingBar />
}

// Registro centralizado del Service Worker para push notifications.
// Se ejecuta una sola vez al montar la app, evitando registros duplicados
// que ocurrían cuando cada hook usePush llamaba a register() individualmente.
function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Error registrando Service Worker:', err)
      })
    }
  }, [])
  return null
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritosProvider>
          <EnvioProvider>
            <ServiceWorkerRegistrar />
            <ScrollToTop />
            <LoadingBarProvider>
              <Navbar />
              <LoadingBarBridge />
              <Toaster />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/registro/finalizar" element={<RegistroPasoFinal />} />
                <Route path="/registro/institucional" element={<RegistroInstitucional />} />
                <Route path="/registro/profesional" element={<RegistroProfesional />} />
                <Route path="/registro/honorifico" element={<RegistroHonorifico />} />
                <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><MisOrdenes /></PrivateRoute>} />
                <Route path="/orders/:id" element={<PrivateRoute><OrdenDetalle /></PrivateRoute>} />
                <Route path="/pagos" element={<PrivateRouteSensible><Pagos /></PrivateRouteSensible>} />
                <Route path="/admin/*" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
                <Route path="/quienes-somos" element={<QuienesSomos />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/ayuda" element={<Ayuda />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/cuenta" element={<PrivateRoute><MiCuenta /></PrivateRoute>} />
                <Route path="/mis-items" element={<PrivateRoute><MisItems /></PrivateRoute>} />
                <Route path="/notificaciones" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/privacidad" element={<Privacidad />} />
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
                <Route path="/analytics" element={<AnalyticsVentas />} />
              </Routes>
            </LoadingBarProvider>
          </EnvioProvider>
        </FavoritosProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App