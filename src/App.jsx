import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { EnvioProvider } from './context/EnvioContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import Registro from './pages/Registro'
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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <EnvioProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><MisOrdenes /></PrivateRoute>} />
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
        </Routes>
        </EnvioProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
