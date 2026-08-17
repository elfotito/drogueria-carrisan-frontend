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
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import Registro from './pages/RegistroConTipo'
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
import

function LoadingBarBridge() {
  const bar = useLoadingBar()
  useEffect(() => { registerLoadingBar(bar) }, [bar])
  return <TopLoadingBar />
}


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritosProvider>
          <EnvioProvider>
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
            <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><MisOrdenes /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrdenDetalle /></PrivateRoute>} />  {/* ← nuevo */}
            <Route path="/pagos" element={<PrivateRoute><Pagos /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/cuenta" element={<PrivateRoute><MiCuenta /></PrivateRoute>} />
            <Route path="/mis-items" element={<PrivateRoute><MisItems /></PrivateRoute>} />
            <Route path="/notificaciones" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/estado-cuenta" element={<PrivateRoute><EstadoCuenta /></PrivateRoute>} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/listas/:id" element={<PrivateRoute><ListaDetalle /></PrivateRoute>} />
            <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
            <Route path="/ofertas" element={<PrivateRoute><Ofertas /></PrivateRoute>} />
            <Route path="/farmacia" element={<PrivateRoute><LineaFarmacia /></PrivateRoute>} />
            <Route path="/hospitalaria" element={<PrivateRoute><LineaHospitalaria /></PrivateRoute>} />
            <Route path="/direcciones" element={<PrivateRoute><Direcciones /></PrivateRoute>} />

<Route path="/estado-cuenta/pagos" element={<PrivateRoute><PagosEstadoCuenta /></PrivateRoute>} />} />
<Route path="/estado-cuenta/facturas" element={<PrivateRoute><FacturasEstadoCuenta /></PrivateRoute>} />} />
<Route path="/estado-cuenta/reportes" element={<PrivateRoute><ReportesEstadoCuenta /></PrivateRoute>} />} />
<Route path="/estado-cuenta/ampliacion" element={<PrivateRoute><AmpliacionEstadoCuenta /></PrivateRoute>} />} />
          </Routes>
            </LoadingBarProvider>
          </EnvioProvider>
        </FavoritosProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
