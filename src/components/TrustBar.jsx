import { Truck, ShieldCheck, BadgeCheck, PackageCheck } from 'lucide-react'
import './TrustBar.css'

// Barra de confianza del Home: señales que refuerzan la compra
// institucional de una droguería (envío, pago seguro, registro y
// verificación de lotes). Dirección editorial: franja compacta y fija,
// sin carruseles ni ruido extra.

const ITEMS = [
  { icono: Truck, titulo: 'Entregas programadas', texto: 'Rápidas y sin filas, donde estés' },
  { icono: ShieldCheck, titulo: 'Pagos seguros', texto: 'Contado o crédito, siempre verificados' },
  { icono: BadgeCheck, titulo: 'Registro INHRR', texto: 'Todos los productos regulados y trazables' },
  { icono: PackageCheck, titulo: 'Cada lote verificado', texto: 'Revisado antes de salir de nuestra bodega' },
]

function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Garantías de la droguería">
      {ITEMS.map(({ icono: Icono, titulo, texto }) => (
        <div className="trust-bar__item" key={titulo}>
          <Icono className="trust-bar__icono" size={22} strokeWidth={1.8} aria-hidden="true" />
          <div className="trust-bar__textos">
            <p className="trust-bar__titulo">{titulo}</p>
            <p className="trust-bar__texto">{texto}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default TrustBar