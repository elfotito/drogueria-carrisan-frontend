/**
 * Estados y ciudades/municipios de Venezuela.
 * Usado por el selector dependiente Estado -> Ciudad en los formularios
 * de registro (Institucional, Profesional, Honorífico).
 *
 * Las ciudades provienen de la unión de:
 *  - lista curada original (capitales y localidades clave de logística)
 *  - dataset público zokeber/venezuela-json (ciudades + capitales de municipio)
 * Total ~500 localidades; no incluye cada parroquia.
 */

export const ESTADOS_VENEZUELA = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
]

export const CIUDADES_POR_ESTADO = {
  'Amazonas': [
    'Isla Ratón', 'La Esmeralda', 'Maroa', 'Puerto Ayacucho', 'San Carlos de Río Negro', 'San Fernando de Atabapo', 'San Juan de Manapiare'
  ],
  'Anzoátegui': [
    'Anaco', 'Aragua de Barcelona', 'Barcelona', 'Boca de Uchire', 'Cantaura', 'Clarines', 'El Chaparro', 'El Pao', 'El Tigre', 'El Tigrito', 'Guanape', 'Guanta', 'Lechería', 'Mapire', 'Onoto', 'Pariaguán', 'Píritu', 'Puerto La Cruz', 'Puerto Píritu', 'Sabana de Uchire', 'San José de Guanipa', 'San Mateo', 'San Pablo', 'San Tomé', 'Santa Ana', 'Santa Ana de Anzoátegui', 'Santa Fe', 'Santa Rosa', 'Soledad', 'Urica', 'Valle de Guanape'
  ],
  'Apure': [
    'Achaguas', 'Biruaca', 'Bruzual', 'El Amparo', 'El Nula', 'Elorza', 'Guasdualito', 'Mantecal', 'Puerto Páez', 'San Fernando de Apure', 'San Juan de Payara'
  ],
  'Aragua': [
    'Barbacoas', 'Cagua', 'Camatagua', 'Choroní', 'Colonia Tovar', 'El Consejo', 'El Limón', 'La Victoria', 'Las Tejerías', 'Magdaleno', 'Maracay', 'Ocumare de La Costa', 'Palo Negro', 'San Casimiro', 'San Mateo', 'San Sebastián', 'San Sebastián de Los Reyes', 'Santa Cruz de Aragua', 'Santa Rita', 'Tocorón', 'Turmero', 'Villa de Cura', 'Zuata'
  ],
  'Barinas': [
    'Arismendi', 'Barinitas', 'Barrancas', 'Calderas', 'Capitanejo', 'Ciudad Bolivia', 'Ciudad de Nutrias', 'El Cantón', 'Las Veguitas', 'Libertad', 'Libertad de Barinas', 'Obispos', 'Sabaneta', 'Santa Bárbara', 'Santa Bárbara de Barinas', 'Socopó'
  ],
  'Bolívar': [
    'Caicara del Orinoco', 'Canaima', 'Ciudad', 'Ciudad Bolívar', 'Ciudad Guayana', 'Ciudad Piar', 'Ciudad Píar', 'El Callao', 'El Dorado', 'El Manteco', 'El Palmar', 'El Pao', 'Guasipati', 'Guri', 'La Paragua', 'Maripa', 'Matanzas', 'Puerto Ordaz', 'San Félix', 'Santa Elena de Uairén', 'Tumeremo', 'Unare', 'Upata'
  ],
  'Carabobo': [
    'Bejuma', 'Belén', 'Campo de Carabobo', 'Canoabo', 'Central Tacarigua', 'Chirgua', 'Ciudad Alianza', 'El Palito', 'Guacara', 'Guigue', 'Güigüe', 'Las Trincheras', 'Los Guayos', 'Mariara', 'Miranda', 'Montalbán', 'Morón', 'Naguanagua', 'Puerto Cabello', 'San Diego', 'San Joaquín', 'Tocuyito', 'Urama', 'Valencia', 'Vigirimita'
  ],
  'Cojedes': [
    'Aguirre', 'Apartaderos', 'Arismendi', 'Camuriquito', 'El Baúl', 'El Limón', 'El Pao', 'El Socorro', 'La Aguadita', 'Las Vegas', 'Libertad', 'Libertad de Cojedes', 'Macapo', 'Mapuey', 'Piñedo', 'Samancito', 'San Carlos', 'Sucre', 'Tinaco', 'Tinaquillo', 'Vallecito'
  ],
  'Delta Amacuro': [
    'Curiapo', 'Pedernales', 'Sierra Imataca', 'Tucupita'
  ],
  'Distrito Capital': [
    'Caracas'
  ],
  'Falcón': [
    'Adícora', 'Boca de Aroa', 'Cabure', 'Capadare', 'Capatárida', 'Chichiriviche', 'Churuguara', 'Coro', 'Cumarebo', 'Dabajuro', 'Jacura', 'Judibana', 'La Cruz de Taratara', 'La Vela de Coro', 'Los Taques', 'Maparari', 'Mene de Mauroa', 'Mirimire', 'Palmasola', 'Pedregal', 'Píritu', 'Pueblo Nuevo', 'Puerto Cumarebo', 'Punta Cardón', 'Punto Fijo', 'San Juan de Los Cayos', 'San Luis', 'Santa Ana', 'Santa Ana de Coro', 'Santa Cruz De Bucaral', 'Santa Cruz de Los Taques', 'Tocopero', 'Tocópero', 'Tocuyo de La Costa', 'Tucacas', 'Urumaco', 'Yaracal'
  ],
  'Guárico': [
    'Altagracia de Orituco', 'Cabruta', 'Calabozo', 'Camaguán', 'Chaguaramas', 'El Socorro', 'El Sombrero', 'Guayabal', 'Las Mercedes', 'Las Mercedes de Los Llanos', 'Lezama', 'Onoto', 'Ortiz', 'Ortíz', 'San José de Guaribe', 'San Juan de Los Morros', 'San Rafael de Laya', 'Santa María de Ipire', 'Tucupido', 'Valle de La Pascua', 'Zaraza'
  ],
  'Lara': [
    'Aguada Grande', 'Atarigua', 'Barquisimeto', 'Bobare', 'Cabudare', 'Carora', 'Cubiro', 'Cují', 'Duaca', 'El Manzano', 'El Tocuyo', 'Guaríco', 'Humocaro Alto', 'Humocaro Bajo', 'La Miel', 'Moroturo', 'Quibor', 'Quíbor', 'Río Claro', 'Sanare', 'Santa Inés', 'Sarare', 'Siquisique', 'Tintorero'
  ],
  'Mérida': [
    'Apartaderos', 'Arapuey', 'Aricagua', 'Bailadores', 'Caja Seca', 'Canaguá', 'Chachopo', 'Chiguara', 'Ejido', 'El Vigía', 'Guaraque', 'La Azulita', 'La Playa', 'Lagunillas', 'Mesa de Bolívar', 'Mucuchíes', 'Mucujepe', 'Mucuruba', 'Nueva Bolivia', 'Palmarito', 'Pueblo Llano', 'Santa Cruz de Mora', 'Santa Elena de Arenales', 'Santa María de Caparo', 'Santo Domingo', 'Tabay', 'Tabáy', 'Timotes', 'Torondoy', 'Tovar', 'Tucani', 'Tucaní', 'Zea'
  ],
  'Miranda': [
    'Araguita', 'Baruta', 'Carrizal', 'Caucagua', 'Chacao', 'Chaguaramas', 'Charallave', 'Chirimena', 'Chuspa', 'Cúa', 'Cupira', 'Cúpira', 'Curiepe', 'El Guapo', 'El Jarillo', 'Filas de Mariche', 'Guarenas', 'Guatire', 'Higuerote', 'Los Anaucos', 'Los Teques', 'Mamporal', 'Ocumare del Tuy', 'Panaquire', 'Paracotos', 'Petare', 'Río Chico', 'San Antonio de Los Altos', 'San Diego de Los Altos', 'San Fernando del Guapo', 'San Francisco de Yare', 'San José de Barlovento', 'San José de Los Altos', 'San José de Río Chico', 'San Pedro de Los Altos', 'Santa Lucía', 'Santa Rosalía de Palermo', 'Santa Teresa', 'Santa Teresa del Tuy', 'Tacarigua de La Laguna', 'Tacarigua de Mamporal', 'Tácata', 'Turumo'
  ],
  'Monagas': [
    'Aguasay', 'Aragua de Maturín', 'Barrancas del Orinoco', 'Caicara de Maturín', 'Caripe', 'Caripito', 'Chaguaramal', 'Chaguaramas', 'El Furrial', 'El Tejero', 'Jusepín', 'La Toscana', 'Maturín', 'Miraflores', 'Punta de Mata', 'Quiriquire', 'San Antonio de Capayacuar', 'San Antonio de Maturín', 'San Vicente', 'Santa Bárbara', 'Temblador', 'Teresen', 'Uracoa'
  ],
  'Nueva Esparta': [
    'Altagracia', 'Boca de Pozo', 'Boca de Río', 'El Espinal', 'El Valle', 'El Valle del Espíritu Santo', 'El Yaque', 'Juan Griego', 'Juangriego', 'La Asunción', 'La Guardia', 'Pampatar', 'Paraguachí', 'Porlamar', 'Puerto Fermín', 'Punta de Piedras', 'San Francisco de Macanao', 'San Juan Bautista', 'San Pedro de Coche', 'Santa Ana', 'Santa Ana de Nueva Esparta', 'Villa Rosa'
  ],
  'Portuguesa': [
    'Acarigua', 'Agua Blanca', 'Araure', 'Biscucuy', 'Boconoito', 'Boconoíto', 'Campo Elías', 'Chabasquén', 'El Playón', 'Guanare', 'Guanarito', 'La Aparición', 'La Misión', 'Mesa de Cavacas', 'Ospino', 'Papelón', 'Paraíso de Chabasquén', 'Payara', 'Pimpinela', 'Píritu', 'Píritu de Portuguesa', 'San Rafael de Onoto', 'Santa Rosalía', 'Turén', 'Villa Bruzual'
  ],
  'Sucre': [
    'Altos de Sucre', 'Araya', 'Cariaco', 'Carúpano', 'Casanay', 'Cumaná', 'Cumanacoa', 'El Morro Puerto Santo', 'El Pilar', 'El Poblado', 'Guaca', 'Guiria', 'Güiria', 'Irapa', 'Manicuare', 'Mariguitar', 'Marigüitar', 'Río Caribe', 'San Antonio del Golfo', 'San José de Aerocuar', 'San Vicente de Sucre', 'Santa Fe de Sucre', 'Tunapuy', 'Yaguaraparo', 'Yoco'
  ],
  'Táchira': [
    'Abejales', 'Borota', 'Bramon', 'Capacho', 'Capacho Nuevo', 'Capacho Viejo', 'Colón', 'Coloncito', 'Cordero', 'Delicias', 'El Cobre', 'El Pinal', 'Independencia', 'La Fría', 'La Grita', 'La Pedrera', 'La Tendida', 'Las Delicias', 'Las Hernández', 'Las Mesas', 'Lobatera', 'Michelena', 'Palmira', 'Pregonero', 'Queniquea', 'Rubio', 'San Antonio del Tachira', 'San Antonio del Táchira', 'San Cristobal', 'San Cristóbal', 'San José de Bolívar', 'San Josecito', 'San Pedro del Río', 'San Rafael del Piñal', 'San Simón', 'Santa Ana', 'Santa Ana de Táchira', 'Seboruco', 'Táriba', 'Umuquena', 'Ureña'
  ],
  'Trujillo': [
    'Batatal', 'Betijoque', 'Boconó', 'Campo Elías', 'Carache', 'Carvajal', 'Chejende', 'Chejendé', 'Cuicas', 'El Dividive', 'El Jaguito', 'El Paradero', 'Escuque', 'Isnotú', 'Jajó', 'La Ceiba', 'La Concepción de Trujllo', 'La Mesa de Esnujaque', 'La Puerta', 'La Quebrada', 'Mendoza Fría', 'Meseta de Chimpire', 'Monay', 'Monte Carmelo', 'Motatán', 'Pampán', 'Pampanito', 'Sabana de Mendoza', 'Sabana Grande', 'San Lázaro', 'Santa Ana de Trujillo', 'Santa Apolonia', 'Santa Isabel', 'Tostós', 'Valera'
  ],
  'Vargas': [
    'Carayaca', 'Catia La Mar', 'La Guaira', 'Litoral', 'Macuto', 'Maiquetía'
  ],
  'Yaracuy': [
    'Aroa', 'Boraure', 'Campo Elías de Yaracuy', 'Chivacoa', 'Cocorote', 'Farriar', 'Guama', 'Independencia', 'Marín', 'Nirgua', 'Sabana de Parra', 'Salom', 'San Felipe', 'San Pablo', 'San Pablo de Yaracuy', 'Urachiche', 'Yaritagua', 'Yumare'
  ],
  'Zulia': [
    'Bachaquero', 'Bobures', 'Cabimas', 'Campo Concepción', 'Campo Mara', 'Campo Rojo', 'Carrasquero', 'Casigua', 'Casigua - El Cubo', 'Chiquinquirá', 'Ciudad Ojeda', 'El Batey', 'El Carmelo', 'El Chivo', 'El Guayabo', 'El Mene', 'El Toro', 'El Venado', 'Encontrados', 'Gibraltar', 'Isla de Toas', 'La Concepción', 'La Paz', 'La Sierrita', 'La Villa del Rosario', 'Lagunillas', 'Las Piedras', 'Los Cortijos', 'Los Puertos de Altagracia', 'Machiques', 'Maracaibo', 'Mene Grande', 'Palmarejo', 'Paraguaipoa', 'Potrerito', 'Pueblo Nuevo', 'Pueblo Nuevo - El Chivo', 'Puertos de Altagracia', 'Punta Gorda', 'Sabaneta de Palma', 'San Carlos del Zulia', 'San Francisco', 'San José de Perijá', 'San Rafael de El Moján', 'San Rafael del Moján', 'San Timoteo', 'Santa Bárbara del Zulia', 'Santa Cruz de Mara', 'Santa Cruz del Zulia', 'Santa Rita', 'Sinamaica', 'Tamare', 'Tía Juana', 'Villa Rosario'
  ],
}

export function obtenerCiudades(estado) {
  return CIUDADES_POR_ESTADO[estado] || []
}
