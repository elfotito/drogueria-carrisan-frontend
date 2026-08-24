/**
 * Profesiones de la salud, su título por defecto, y especialidades
 * disponibles para cada una. Usado en el formulario de registro del
 * Usuario Profesional de la Salud.
 *
 * titulo: se autocompleta al elegir la profesión (ej: Médico Cirujano
 * → "Dr."/"Dra." según el selector de tratamiento). Para 'otro' no hay
 * título por defecto — el campo queda editable manualmente en el form.
 */

export const PROFESIONES = [
  { value: 'medico_cirujano', label: 'Médico Cirujano', tituloDefecto: 'Dr.' },
  { value: 'bionalista', label: 'Bionalista', tituloDefecto: 'Lic.' },
  { value: 'enfermero', label: 'Enfermero/a', tituloDefecto: 'Lic.' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta', tituloDefecto: 'Lic.' },
  { value: 'psicologo_clinico', label: 'Psicólogo/a Clínico', tituloDefecto: 'Lic.' },
  { value: 'otro', label: 'Otro', tituloDefecto: null }
]

// Variantes de título según género — el formulario deja elegir entre
// estas dos cuando la profesión sugiere "Dr." o "Lic." por defecto.
export const TITULOS_POR_DEFECTO = {
  medico_cirujano: ['Dr.', 'Dra.'],
  bionalista: ['Lic.', 'Lcda.'],
  enfermero: ['Lic.', 'Lcda.'],
  fisioterapeuta: ['Lic.', 'Lcda.'],
  psicologo_clinico: ['Lic.', 'Lcda.']
}

export const ESPECIALIDADES_POR_PROFESION = {
  medico_cirujano: [
    'Medicina General', 'Cardiología', 'Pediatría', 'Ginecología y Obstetricia',
    'Traumatología', 'Cirugía General', 'Medicina Interna', 'Dermatología',
    'Oftalmología', 'Otorrinolaringología', 'Urología', 'Neurología',
    'Anestesiología', 'Radiología', 'Oncología', 'Endocrinología',
    'Gastroenterología', 'Neumología', 'Nefrología', 'Psiquiatría'
  ],
  bionalista: [
    'Hematología', 'Microbiología', 'Bioquímica Clínica', 'Parasitología',
    'Banco de Sangre', 'Inmunología'
  ],
  enfermero: [
    'Enfermería General', 'Enfermería Quirúrgica', 'Cuidados Intensivos',
    'Enfermería Pediátrica', 'Enfermería Oncológica', 'Emergenciología'
  ],
  fisioterapeuta: [
    'Rehabilitación Física', 'Fisioterapia Deportiva', 'Fisioterapia Respiratoria',
    'Fisioterapia Neurológica', 'Fisioterapia Pediátrica'
  ],
  psicologo_clinico: [
    'Psicología Clínica General', 'Psicología Infantil', 'Terapia de Pareja y Familia',
    'Neuropsicología', 'Psicología Organizacional'
  ]
  // 'otro' no tiene lista — el campo especialidad queda como texto libre
}

export function obtenerTituloDefecto(profesion) {
  return PROFESIONES.find((p) => p.value === profesion)?.tituloDefecto || null
}

export function obtenerEspecialidades(profesion) {
  return ESPECIALIDADES_POR_PROFESION[profesion] || []
}