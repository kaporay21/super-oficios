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

// Mapea la forma en que la gente busca un oficio ("electricista", "plomero")
// al nombre de categoría real guardado en `perfiles.oficios` ("Electricidad",
// "Plomería") -- son palabras distintas, así que un ILIKE/contains directo
// contra el nombre de la categoría nunca matchea el término de búsqueda.
export const SINONIMOS_OFICIO: Record<string, string> = {
  plomero: 'Plomería',
  plomera: 'Plomería',
  gasfiter: 'Plomería',
  electricista: 'Electricidad',
  albañil: 'Albañilería',
  albanil: 'Albañilería',
  pintor: 'Pintura',
  pintora: 'Pintura',
  carpintero: 'Carpintería',
  carpintera: 'Carpintería',
  cerrajero: 'Cerrajería',
  cerrajera: 'Cerrajería',
  durlock: 'Durlock / Yeso',
  yesero: 'Durlock / Yeso',
  yesera: 'Durlock / Yeso',
  yeso: 'Durlock / Yeso',
  climatizacion: 'Aire Acondicionado',
  climatización: 'Aire Acondicionado',
  aire: 'Aire Acondicionado',
  jardinero: 'Jardinería',
  jardinera: 'Jardinería',
  jardin: 'Jardinería',
  fumigador: 'Fumigación',
  fumigadora: 'Fumigación',
  herrero: 'Herrería',
  herrera: 'Herrería',
  techista: 'Techista / Impermeabilización',
  techador: 'Techista / Impermeabilización',
  impermeabilizacion: 'Techista / Impermeabilización',
  impermeabilización: 'Techista / Impermeabilización',
  fletero: 'Fletes y Mudanzas',
  flete: 'Fletes y Mudanzas',
  mudanza: 'Fletes y Mudanzas',
  mudanzas: 'Fletes y Mudanzas',
  limpiador: 'Limpieza',
  limpiadora: 'Limpieza',
  mucama: 'Limpieza',
};

function normalizarTexto(s: string): string {
  return s
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .trim();
}

// Dado lo que alguien escribió en el buscador, devuelve las categorías de
// `OFICIOS_CORE` que probablemente esté buscando -- ya sea porque escribió
// el nombre de la categoría directamente (parcial), o porque escribió el
// nombre del oficio en su forma de persona ("plomero" en vez de "Plomería").
export function resolverOficiosPorTexto(termino: string): string[] {
  const t = normalizarTexto(termino);
  if (!t) return [];

  const coincidencias = new Set<string>();

  for (const oficio of OFICIOS_CORE) {
    const oficioNorm = normalizarTexto(oficio);
    if (oficioNorm.includes(t) || t.includes(oficioNorm)) {
      coincidencias.add(oficio);
    }
  }

  for (const [sinonimo, oficio] of Object.entries(SINONIMOS_OFICIO)) {
    if (sinonimo.includes(t) || t.includes(sinonimo)) {
      coincidencias.add(oficio);
    }
  }

  return Array.from(coincidencias);
}

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
