export type Screen = 'home' | 'profile_client' | 'job_detail' | 'notifications' | 'register_pro' | 'publish_job';

export interface Professional {
  id: string | number;
  name: string;
  category: string;
  trade: string;
  location: string;
  rating: number;
  avatar: string;
  // Campos extendidos para búsqueda de profesionales
  verificacion?: string;
  estadoDNI?: string;
  matriculadoVerificado?: boolean;
  estadoCertificados?: string;
  plan?: string;
  provincia?: string;
  experiencia?: string;
}

export interface Job {
  id: string | number;
  title: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'pending'; // <-- ¡Aquí agregamos 'pending'!
  timeAgo: string;
}

// ============================================================
// TIPOS PARA BÚSQUEDA FILTRADA DE PROFESIONALES (SERVIDOR)
// ============================================================

/** Parámetros de filtrado para la consulta de profesionales en Supabase */
export interface FiltrosProfesionales {
  /** Oficio a filtrar (ej: "Plomería", "Electricidad") */
  oficio?: string;
  /** Provincia a filtrar (ej: "Buenos Aires", "CABA") */
  provincia?: string;
  /** Texto libre para buscar por nombre o descripción */
  busqueda?: string;
  /** Solo traer profesionales con verificación de DNI aprobada */
  soloVerificados?: boolean;
  /** Solo traer profesionales con matrícula verificada */
  soloMatriculados?: boolean;
  /** Columna para ordenar los resultados */
  ordenarPor?: 'rating' | 'trabajos_realizados' | 'fecha_registro';
  /** Número de página (1-based) */
  page?: number;
  /** Cantidad de resultados por página */
  limit?: number;
}

/** Resultado paginado de la búsqueda de profesionales */
export interface ResultadoProfesionales {
  data: Professional[];
  count: number;
  totalPages: number;
  error: any | null;
}

// ============================================================
// MURO DE SERVICIOS
// ============================================================

/** Estado posible de un trabajo publicado en el Muro de Servicios */
export type EstadoTrabajo = 'abierto' | 'adjudicado' | 'en_progreso' | 'finalizado';

/** Trabajo con su estado para el Muro de Servicios */
export interface TrabajoConEstado {
  id: number | string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion?: string;
  ciudad?: string;
  provincia?: string;
  urgente?: boolean;
  imagen?: string;
  cliente_id: string;
  estado: EstadoTrabajo;
  profesional_adjudicado_id?: string;
  created_at: string;
}

/** Estado posible de una oferta en el Muro de Servicios */
export type EstadoOfertaMuro = 'pendiente' | 'aceptado' | 'rechazado';

/** Oferta enviada por un profesional en el Muro de Servicios */
export interface PresupuestoMuro {
  id: string;
  trabajoId: number | string;
  profesionalId: string;
  clienteId: string;
  monto: number;
  descripcion: string;
  tiempoEstimado?: string;
  materialesIncluidos: boolean;
  garantia: string;
  estado: EstadoOfertaMuro;
  version: number;
  createdAt: string;
  updatedAt: string;
  profesional?: {
    id: string;
    nombre: string;
    fotoPerfil: string;
    oficios: string[];
    provincia: string;
    ciudad: string;
    verificado: boolean;
    rating: number;
    totalResenas: number;
  };
}