export const OFICIOS_CORE = [
  'Plomería',
  'Electricidad',
  'Albañilería',
  'Pintura',
  'Carpintería',
  'Gasista',
  'Cerrajería',
  'Durlock / Yeso',
  'Aire Acondicionado',
  'Jardinería',
  'Fumigación',
  'Herrería',
  'Techista / Impermeabilización',
  'Fletes y Mudanzas',
  'Limpieza',
  'Otro'
];

export const PROVINCIAS_Y_CIUDADES: Record<string, string[]> = {
  'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pilar', 'Campana'],
  'CABA (Ciudad Autónoma de Buenos Aires)': ['Palermo', 'Caballito', 'Belgrano', 'Recoleta', 'Flores', 'Almagro', 'Villa Urquiza'],
  'Catamarca': ['San Fernando del Valle de Catamarca', 'Andalgalá', 'Tinogasta'],
  'Chaco': ['Resistencia', 'Sáenz Peña', 'Villa Ángela'],
  'Chubut': ['Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'],
  'Córdoba': ['Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'San Francisco'],
  'Corrientes': ['Corrientes Capital', 'Goya', 'Paso de los Libres'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Formosa': ['Formosa Capital', 'Clorinda'],
  'Jujuy': ['San Salvador de Jujuy', 'San Pedro', 'Libertador General San Martín'],
  'La Pampa': ['Santa Rosa', 'General Pico'],
  'La Rioja': ['La Rioja Capital', 'Chilecito'],
  'Mendoza': ['Mendoza Capital', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'],
  'Misiones': ['Posadas', 'Eldorado', 'Oberá'],
  'Neuquén': ['Neuquén Capital', 'San Martín de los Andes', 'Villa La Angostura'],
  'Río Negro': ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti'],
  'Salta': ['Salta Capital', 'San Ramón de la Nueva Orán', 'Tartagal'],
  'San Juan': ['San Juan Capital', 'Caucete', 'Chimbas'],
  'San Luis': ['San Luis Capital', 'Villa Mercedes', 'Merlo'],
  'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate'],
  'Santa Fe': ['Rosario', 'Santa Fe Capital', 'Rafaela', 'Venado Tuerto', 'Reconquista'],
  'Santiago del Estero': ['Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo'],
  'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
  'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción', 'Aguilares', 'Banda del Río Salí']
};

export const PROVINCIAS_CORE = Object.keys(PROVINCIAS_Y_CIUDADES);
