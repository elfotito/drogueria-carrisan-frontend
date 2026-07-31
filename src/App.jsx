import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import Carrito from './pages/Carrito'
import MisOrdenes from './pages/MisOrdenes'
import Admin from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />

          <Route path="/carrito" element={
            <PrivateRoute><Carrito /></PrivateRoute>
          } />

          <Route path="/orders" element={
            <PrivateRoute><MisOrdenes /></PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute adminOnly><Admin /></PrivateRoute>
          } />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
