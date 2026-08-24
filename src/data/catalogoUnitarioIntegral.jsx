// src/data/catalogoUnitarioIntegral.jsx
//
// Contenido del modal informativo "Catálogo unitario integral".
//
// A diferencia de beneficios.jsx y financiamiento.jsx, esta funcionalidad no
// apareció en el código de backend/frontend que hemos revisado hasta ahora,
// así que el texto de abajo es un placeholder razonable — ajústalo con la
// descripción real de cómo funciona tu catálogo unitario.
//
// Uso:
//   import catalogoUnitarioInfo from '../data/catalogoUnitarioIntegral'
//   <ModalInformativo titulo={catalogoUnitarioInfo.titulo} abierto={abierto} onCerrar={cerrar}>
//     <catalogoUnitarioInfo.Contenido />
//   </ModalInformativo>

import './contenidoInformativo.css'

function Contenido() {
  return (
    <>
      <section className="contenido-info__seccion">
        <h3>¿Qué es el catálogo unitario integral?</h3>
        <p>
          {/* TODO: reemplazar con la descripción real */}
          Puedes comprar cada producto por unidad, sin obligarte a llevar cajas o
          empaques completos. El catálogo cubre todas las líneas disponibles —
          farmacéutica, insumos médicos y consumo masivo — con el mismo detalle
          y disponibilidad que ves en la presentación por mayor.
        </p>
      </section>

      <section className="contenido-info__seccion">
        <h3>¿A quién le sirve?</h3>
        <p>
          {/* TODO: ajustar según el público real (farmacias pequeñas, clínicas, etc.) */}
          Ideal si necesitas surtir con precisión sin sobre-stockear, o si estás
          probando la rotación de un producto antes de pedirlo por mayor.
        </p>
      </section>

      <section className="contenido-info__seccion">
        <h3>¿Cómo lo encuentro?</h3>
        <p>
          {/* TODO: describir la ubicación real dentro de la plataforma */}
          Cada producto muestra su presentación unitaria disponible directamente
          en su ficha, junto al precio y la cantidad en existencia.
        </p>
      </section>
    </>
  )
}

const catalogoUnitarioInfo = {
  titulo: 'Catálogo unitario integral',
  Contenido,
}

export default catalogoUnitarioInfo
