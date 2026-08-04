import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AgregarAItemsModal from '../components/AgregarAItemsModal'
import './ProductoDetalle.css'

function ProductoDetalle() {
  // ... todo el código existente ...
  const [mostrarModalItems, setMostrarModalItems] = useState(false)

  // ... resto del código igual hasta la sección de acciones ...

  // En detalle-acciones, donde está el botón de agregar al carrito:
  <div className="detalle-acciones">
    <div className="detalle-cantidad">
      {/* ... igual ... */}
    </div>

    <button
      className={`detalle-btn-agregar ${agregado ? 'agregado' : ''}`}
      onClick={handleAgregar}
      disabled={!user}
    >
      {agregado ? '✓ Agregado' : 'Agregar al carrito'}
    </button>

    {user && (
      <button
        onClick={() => setMostrarModalItems(true)}
        style={{
          padding: '12px 20px',
          background: '#f5f5f5',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
        title="Agregar a Mis Items"
      >
        📦
      </button>
    )}
  </div>

  {/* Al final del componente, antes del último </div> */}
  {mostrarModalItems && (
    <AgregarAItemsModal
      producto={producto}
      onClose={() => setMostrarModalItems(false)}
    />
  )}