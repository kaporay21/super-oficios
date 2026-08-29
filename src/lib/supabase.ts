import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Advertencia: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas.'
  );
}

// Inicialización del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Emails de administradores
export const ADMIN_EMAILS = [
  'gonzalohumacata1992@gmail.com',
  'gonzalo@gmail.com',
  'pedro@gmail.com'
];

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ============================================================
// AUTH HELPERS
// ============================================================

/**
 * Obtiene el usuario autenticado actual desde Supabase Auth.
 * Retorna null si no hay sesión activa.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Obtiene el perfil completo del usuario desde la tabla 'perfiles'.
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  let { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).maybeSingle();
  
  if (!profile && !isEmailAdmin(user.email)) {
    try {
      let stored: any = null;
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('oficiosya_profesional_perfil') || localStorage.getItem('oficiosya_cliente_perfil') || localStorage.getItem('oficiosya_session');
        if (local) stored = JSON.parse(local);
      }

      const fallbackProfile = {
        id: user.id,
        email: user.email,
        nombre: stored?.nombre || user.email?.split('@')[0] || 'Usuario',
        telefono: stored?.telefono || '',
        oficios: stored?.oficios || [],
        rol: stored?.rol || (stored?.oficios && stored.oficios.length > 0 ? 'profesional' : 'cliente'),
        provincia: stored?.provincia || '',
        ciudad: stored?.ciudad || ''
      };

      await supabase.from('perfiles').upsert(fallbackProfile);
      profile = fallbackProfile;
    } catch (e) {
      console.error('Error auto-healing profile:', e);
    }
  }

  if (!profile && isEmailAdmin(user.email)) {
    const adminProfile = {
      id: user.id,
      email: user.email,
      nombre: 'Gonzalo Humacata',
      rol: 'cliente',
      verificado: true,
      plan: 'Pro'
    };
    await supabase.from('perfiles').upsert(adminProfile);
    return { ...adminProfile, rol: 'admin' };
  }

  if (profile && isEmailAdmin(user.email)) {
    return { ...profile, rol: 'admin' };
  }

  return profile;
}

/**
 * Verifica si el usuario actual es administrador.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (isEmailAdmin(user.email)) return true;
  const profile = await getCurrentProfile();
  return profile?.rol === 'admin';
}

/**
 * Cierra sesión completa en Supabase Auth.
 */
export async function logout() {
  await supabase.auth.signOut();
  clearAllLocalData();
}

/**
 * Limpia la caché local de la app en localStorage.
 */
export function clearAllLocalData() {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    'oficiosya_session',
    'oficiosya_cliente_perfil',
    'oficiosya_profesional_perfil',
    'show_confetti',
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ============================================================
// DB HELPER — Solo Supabase (100% Real)
// ============================================================

/**
 * Sube una captura de rostro (data-URL de la cámara) al bucket `avatars` y
 * devuelve la URL pública para guardar en `perfiles.foto_perfil`.
 *
 * Guardar el data-URL en la columna significaba arrastrar ~100 KB por perfil
 * en cada consulta, y getAllUsers() hace select('*').
 *
 * Si la subida falla devuelve el base64 original: preferimos una fila pesada
 * antes que perder la captura, que es lo único que habilita el sello
 * "Rostro Verificado".
 */
async function subirRostroAStorage(userId: string, foto: string): Promise<string> {
  // Si ya es una URL (Storage o externa) no hay nada que subir.
  if (!foto.startsWith('data:')) return foto;

  try {
    // Import dinámico: supabaseStorage importa de este módulo, así que un
    // import estático crearía un ciclo entre ambos archivos.
    const { uploadImageToSupabase } = await import('./supabaseStorage');
    const blob = await (await fetch(foto)).blob();
    const file = new File([blob], `rostro-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const { publicUrl } = await uploadImageToSupabase('avatars', `${userId}/rostro.jpg`, file);
    return publicUrl || foto;
  } catch (e) {
    console.warn('No se pudo subir el rostro a Storage, se guarda inline:', e);
    return foto;
  }
}

/**
 * Devuelve el nombre de la columna que Supabase reporta como inexistente,
 * o null si el error es de otra naturaleza.
 *
 * Hay dos formas del mensaje según por dónde entre la escritura:
 *   PGRST204 → "Could not find the 'pais' column of 'perfiles' in the schema cache"
 *   42703    → "column perfiles.pais does not exist"
 */
function columnaFaltante(error: any): string | null {
  const msg = String(error?.message || '');
  return (
    msg.match(/Could not find the '([^']+)' column/i)?.[1] ||
    msg.match(/column (?:[\w]+\.)?"?(\w+)"? does not exist/i)?.[1] ||
    null
  );
}

/**
 * Escribe en `perfiles` tolerando columnas que todavía no existen.
 *
 * Las migraciones se corren a mano en el SQL Editor de Supabase, así que el
 * código puede quedar por delante del esquema. Sin esta tolerancia un solo
 * campo nuevo tira abajo el guardado entero: en el registro dejaría al usuario
 * con cuenta de auth pero sin fila en `perfiles`, un estado del que no puede
 * salir por sí mismo.
 *
 * Descarta solo las columnas que faltan y avisa por consola cuáles fueron.
 */
async function escribirPerfil(
  fila: Record<string, any>,
  modo: 'upsert' | 'update',
  id?: string
): Promise<void> {
  const payload = { ...fila };
  const descartadas: string[] = [];

  // Cada vuelta descarta a lo sumo una columna, así que con tantos intentos
  // como campos haya alcanza para terminar.
  for (let intento = 0; intento <= Object.keys(fila).length; intento++) {
    const { error } = modo === 'upsert'
      ? await supabase.from('perfiles').upsert([payload])
      : await supabase.from('perfiles').update(payload).eq('id', id!);

    if (!error) {
      if (descartadas.length > 0) {
        console.warn(
          `[perfiles] Columnas inexistentes en el esquema, se guardó sin ellas ` +
          `(correr sprint0_pendientes.sql): ${descartadas.join(', ')}`
        );
      }
      return;
    }

    const col = columnaFaltante(error);
    if (!col || !(col in payload)) throw error;
    delete payload[col];
    descartadas.push(col);
  }
}

/**
 * Inserta en `tabla` tolerando columnas que todavía no existen en el
 * esquema (mismo problema que `escribirPerfil`, generalizado para
 * cualquier tabla). Devuelve la fila creada.
 */
async function insertarTolerante(tabla: string, fila: Record<string, any>): Promise<any> {
  const payload = { ...fila };
  const descartadas: string[] = [];

  for (let intento = 0; intento <= Object.keys(fila).length; intento++) {
    const { data, error } = await supabase.from(tabla).insert([payload]).select().single();

    if (!error) {
      if (descartadas.length > 0) {
        console.warn(`[${tabla}] Columnas inexistentes en el esquema, se guardó sin ellas: ${descartadas.join(', ')}`);
      }
      return data;
    }

    const col = columnaFaltante(error);
    if (!col || !(col in payload)) throw error;
    delete payload[col];
    descartadas.push(col);
  }
}

export const dbHelper = {
  // --- USERS / PROFILES ---
  async getAllUsers(): Promise<any[]> {
    const { data, error } = await supabase.from('perfiles').select('*');
    if (error) throw error;
    
    return (data || []).map(p => ({
      id: p.id,
      name: p.nombre,
      email: p.email,
      role: isEmailAdmin(p.email) || p.rol === 'admin' ? 'Admin' : (p.rol === 'profesional' ? 'Profesional' : 'Cliente'),
      plan: p.plan || 'Gratis',
      status: 'Activo',
      date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Reciente',
      verificacion: p.verificado ? 'Verificado' : (p.rol === 'profesional' ? 'Pendiente' : 'Sin Solicitud'),
      trade: p.oficios && p.oficios.length > 0 ? p.oficios.join(', ') : '',
      rating: Number(p.rating) || 0,
      totalResenas: Number(p.total_resenas) || 0,
      fotoVerificada: !!p.foto_verificada_en,
      docMatricula: '-',
      avatar: p.foto_perfil || 'https://i.pravatar.cc/150?u=' + p.id,
      location: p.ciudad && p.provincia ? `${p.ciudad}, ${p.provincia}` : (p.provincia || ''),
      category: p.oficios && p.oficios.length > 0 ? p.oficios[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '',
      telefono: p.telefono || '',
      provincia: p.provincia || '',
      ciudad: p.ciudad || '',
      oficios: p.oficios || [],
      fotoPerfil: p.foto_perfil || '',
      nombre: p.nombre,
      rol: isEmailAdmin(p.email) ? 'admin' : p.rol,
    }));
  },

  // ============================================================
  // BÚSQUEDA FILTRADA DE PROFESIONALES (LADO SERVIDOR)
  // ============================================================

  /**
   * Obtiene profesionales filtrados directamente desde Supabase.
   * Aplica filtros de oficio, provincia, verificación y búsqueda de texto en el servidor,
   * eliminando la necesidad de traer todos los usuarios al cliente.
   *
   * @param filters - Objeto con los filtros y opciones de paginación
   * @returns Objeto con los profesionales, conteo total y páginas disponibles
   */
  async getFilteredProfessionals(filters: {
    oficio?: string;
    provincia?: string;
    busqueda?: string;
    soloVerificados?: boolean;
    soloMatriculados?: boolean;
    ordenarPor?: 'rating' | 'trabajos_realizados' | 'fecha_registro';
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: any[]; count: number; totalPages: number; error: any | null }> {
    const {
      oficio,
      provincia,
      busqueda,
      soloVerificados = false,
      soloMatriculados = false,
      ordenarPor = 'fecha_registro',
      page = 1,
      limit = 12,
    } = filters;

    try {
      // Calculamos el rango de paginación (Supabase usa índices 0-based)
      const desde = (page - 1) * limit;
      const hasta = desde + limit - 1;

      // Iniciamos la query con conteo exacto para calcular el total de páginas
      let query = supabase
        .from('perfiles')
        .select('*', { count: 'exact' })
        .eq('rol', 'profesional');

      // ── Filtro por Oficio ──────────────────────────────────────────
      // Usamos 'cs' (contains) ya que `oficios` es un array en Supabase (tipo text[])
      if (oficio && oficio.trim() !== '') {
        query = query.contains('oficios', [oficio]);
      }

      // ── Filtro por Provincia ───────────────────────────────────────
      if (provincia && provincia.trim() !== '') {
        query = query.ilike('provincia', `%${provincia}%`);
      }

      // ── Filtro por Texto Libre (nombre) ────────────────────────────
      // Buscamos por nombre del perfil con coincidencia parcial
      if (busqueda && busqueda.trim() !== '') {
        query = query.ilike('nombre', `%${busqueda.trim()}%`);
      }

      // ── Filtro: Solo Verificados (DNI aprobado) ────────────────────
      if (soloVerificados) {
        query = query.eq('verificado', true);
      }

      // ── Filtro: Solo Matriculados (certificados validados) ─────────
      if (soloMatriculados) {
        query = query.eq('matriculado_verificado', true);
      }

      // ── Ordenamiento ───────────────────────────────────────────────
      // Antes las tres opciones caían al mismo order('created_at'): el
      // selector "Más Valorados" no ordenaba nada. Ahora `rating` y
      // `total_resenas` son columnas reales (ver sprint0_desbloqueo.sql).
      if (ordenarPor === 'rating') {
        // nullsFirst:false deja abajo a los que todavía no tienen reseñas.
        query = query
          .order('rating', { ascending: false, nullsFirst: false })
          .order('total_resenas', { ascending: false, nullsFirst: false });
      } else if (ordenarPor === 'trabajos_realizados') {
        query = query
          .order('total_resenas', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // ── Paginación ─────────────────────────────────────────────────
      query = query.range(desde, hasta);

      const { data, count, error } = await query;

      if (error) {
        console.error('Error en getFilteredProfessionals:', error.message);
        return { data: [], count: 0, totalPages: 0, error };
      }

      const totalCount = count ?? 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Mapeamos el resultado al mismo formato normalizado que usa la aplicación
      const profesionales = (data || []).map((p: any) => ({
        id: p.id,
        name: p.nombre,
        email: p.email,
        role: 'Profesional',
        rol: 'profesional',
        plan: p.plan || 'Gratis',
        status: 'Activo',
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Reciente',
        verificacion: p.verificado ? 'Verificado' : 'Pendiente',
        estadoDNI: p.estado_dni || (p.verificado ? 'Validado' : 'Pendiente'),
        matriculadoVerificado: p.matriculado_verificado || p.estado_certificados === 'Validado' || false,
        estadoCertificados: p.estado_certificados || (p.certificados && p.certificados.length > 0 ? 'Pendiente' : 'Sin Cargar'),
        trade: p.oficios && p.oficios.length > 0 ? p.oficios.join(', ') : '',
        // Rating real calculado por trigger sobre `reviews`. 0 = sin calificaciones
        // todavía; la UI muestra "Nuevo" en vez de inventar un 5.0.
        rating: Number(p.rating) || 0,
        totalResenas: Number(p.total_resenas) || 0,
        // Solo es "Rostro Verificado" si la foto se tomó con la cámara en vivo.
        // No alcanza con tener `avatar`, que siempre trae un fallback.
        fotoVerificada: !!p.foto_verificada_en,
        docMatricula: p.nro_matricula || '-',
        avatar: p.foto_perfil || 'https://i.pravatar.cc/150?u=' + p.id,
        fotoPerfil: p.foto_perfil || '',
        location: p.ciudad && p.provincia ? `${p.ciudad}, ${p.provincia}` : (p.provincia || 'Ubicación no especificada'),
        category: p.oficios && p.oficios.length > 0
          ? p.oficios[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          : '',
        experiencia: p.experiencia || '',
        biografia: p.biografia || '',
        montoMinimo: p.monto_minimo || '',
        telefono: p.telefono || '',
        provincia: p.provincia || '',
        ciudad: p.ciudad || '',
        oficios: p.oficios || [],
        nombre: p.nombre,
        nroMatricula: p.nro_matricula || '',
      }));

      return { data: profesionales, count: totalCount, totalPages, error: null };
    } catch (err: any) {
      console.error('Excepción en getFilteredProfessionals:', err?.message || err);
      return { data: [], count: 0, totalPages: 0, error: err };
    }
  },



  async getUserProfile(id: string): Promise<any> {
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.nombre,
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || '',
      role: isEmailAdmin(data.email) || data.rol === 'admin' ? 'Admin' : (data.rol === 'profesional' ? 'Profesional' : 'Cliente'),
      rol: isEmailAdmin(data.email) ? 'admin' : data.rol,
      plan: data.plan || 'Gratis',
      status: 'Activo',
      date: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Reciente',
      verificacion: data.verificado ? 'Verificado' : (data.rol === 'profesional' ? 'Pendiente' : 'Sin Solicitud'),
      estadoDNI: data.estado_dni || (data.verificado ? 'Validado' : 'Pendiente'),
      matriculadoVerificado: data.matriculado_verificado || data.estado_certificados === 'Validado' || false,
      estadoCertificados: data.estado_certificados || (data.certificados && data.certificados.length > 0 ? 'Pendiente' : 'Sin Cargar'),
      trade: data.oficios && data.oficios.length > 0 ? data.oficios.join(', ') : '',
      rating: Number(data.rating) || 0,
      totalResenas: Number(data.total_resenas) || 0,
      fotoVerificada: !!data.foto_verificada_en,
      docMatricula: data.nro_matricula || '-',
      avatar: data.foto_perfil || 'https://i.pravatar.cc/150?u=' + data.id,
      fotoPerfil: data.foto_perfil || '',
      location: data.ciudad && data.provincia ? `${data.ciudad}, ${data.provincia}` : (data.provincia || 'Ubicación no especificada'),
      category: data.oficios && data.oficios.length > 0 ? data.oficios[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '',
      experiencia: data.experiencia || '',
      biografia: data.biografia || '',
      montoMinimo: data.monto_minimo || '',
      telefono: data.telefono || '',
      provincia: data.provincia || '',
      ciudad: data.ciudad || '',
      fechaNacimiento: data.fecha_nacimiento || '',
      pais: data.pais || 'Argentina',
      nroMatricula: data.nro_matricula || '',
      certificados: data.certificados || [],
      portafolio: data.portafolio || [],
      oficios: data.oficios || [],
    };
  },

  async updateUserPlan(id: string, plan: string): Promise<void> {
    const { error } = await supabase.from('perfiles').update({ plan }).eq('id', id);
    if (error) throw error;
  },

  async updateUserVerification(id: string, verificado: boolean, estadoDni?: string, matriculadoVerificado?: boolean, estadoCertificados?: string): Promise<void> {
    const updates: any = { verificado };
    if (estadoDni !== undefined) updates.estado_dni = estadoDni;
    if (matriculadoVerificado !== undefined) updates.matriculado_verificado = matriculadoVerificado;
    if (estadoCertificados !== undefined) updates.estado_certificados = estadoCertificados;

    const { error } = await supabase.from('perfiles').update(updates).eq('id', id);
    if (error) throw error;
  },

  async updateUserStatus(id: string, status: string): Promise<void> {
    console.log(`Status update for ${id}: ${status}`);
  },

  async updateProfile(id: string, updates: any): Promise<void> {
    const dbUpdates: any = {};
    if (updates.nombre !== undefined) dbUpdates.nombre = updates.nombre;
    if (updates.telefono !== undefined) dbUpdates.telefono = updates.telefono;
    if (updates.provincia !== undefined) dbUpdates.provincia = updates.provincia;
    if (updates.ciudad !== undefined) dbUpdates.ciudad = updates.ciudad;
    if (updates.foto_perfil !== undefined) dbUpdates.foto_perfil = updates.foto_perfil;
    if (updates.oficios !== undefined) dbUpdates.oficios = updates.oficios;
    if (updates.biografia !== undefined) dbUpdates.biografia = updates.biografia;
    if (updates.portafolio !== undefined) dbUpdates.portafolio = updates.portafolio;

    // Tolerante a columnas que todavía no existen (ej. portafolio antes de
    // correr sprint0_portafolio.sql): sin esto, un solo campo nuevo tira
    // abajo el guardado de todo el resto del perfil.
    await escribirPerfil(dbUpdates, 'update', id);
  },

  // --- AUTHENTICATION REAL ---
  async login(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Autenticar con Supabase Auth REAL
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data?.user) {
      throw error || new Error('Credenciales inválidas.');
    }

    const userId = data.user.id;
    const userEmail = data.user.email || normalizedEmail;

    // Obtener perfil real de la tabla 'perfiles' de Supabase
    let { data: profile } = await supabase.from('perfiles').select('*').eq('id', userId).maybeSingle();
    
    // Si es un admin y no existe perfil aún, crearlo en la tabla real de Supabase
    if (!profile && isEmailAdmin(userEmail)) {
      const adminProfile = {
        id: userId,
        email: userEmail,
        nombre: 'Gonzalo Humacata',
        rol: 'cliente',
        verificado: true
      };
      await supabase.from('perfiles').upsert(adminProfile);
      profile = { ...adminProfile, rol: 'admin' };
    } else if (profile && isEmailAdmin(userEmail)) {
      profile = { ...profile, rol: 'admin' };
    }
    
    return { user: data.user, profile };
  },

  async registerCliente(fullName: string, email: string, phone: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase.from('perfiles').upsert([{
        id: data.user.id,
        nombre: fullName,
        email,
        telefono: phone,
        rol: 'cliente'
      }]);
      if (profileError) throw profileError;

      // Store in localStorage for backward compatibility
      const profileData = {
        id: data.user.id,
        nombre: fullName,
        email,
        telefono: phone,
        rol: 'cliente',
        fotoPerfil: '',
      };
      localStorage.setItem('oficiosya_cliente_perfil', JSON.stringify(profileData));
      localStorage.setItem('oficiosya_session', JSON.stringify(profileData));
    }
    return data;
  },

  async registerProfesional(
    fullName: string, 
    email: string, 
    phone: string, 
    password: string, 
    oficios: string[], 
    provincia?: string, 
    ciudad?: string,
    extraData?: { apellido?: string; fechaNacimiento?: string; pais?: string; experiencia?: string; fotoPerfil?: string }
  ): Promise<any> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.user) {
      // La foto llega como data-URL desde CameraCaptureModal: la subimos a
      // Storage antes de escribir el perfil para no guardar el base64 crudo.
      const fotoPerfil = extraData?.fotoPerfil
        ? await subirRostroAStorage(data.user.id, extraData.fotoPerfil)
        : '';

      const baseProfile: any = {
        id: data.user.id,
        nombre: fullName,
        email,
        telefono: phone,
        oficios: oficios || [],
        rol: 'profesional',
        provincia: provincia || '',
        ciudad: ciudad || '',
        foto_perfil: fotoPerfil,
        // El registro exige captura con cámara en vivo, así que si vino foto
        // queda sellada como verificada. Es lo que habilita el badge real.
        foto_verificada_en: fotoPerfil ? new Date().toISOString() : null,
      };

      // Datos que el formulario ya pedía y hasta ahora se descartaban: el
      // apellido solo se concatenaba dentro de `nombre` y los otros tres no
      // llegaban nunca a la base (ver sprint0_pendientes.sql).
      // Van como null y no como '' para que "no lo cargó" quede distinguible
      // de "lo cargó vacío".
      await escribirPerfil({
        ...baseProfile,
        apellido: extraData?.apellido?.trim() || null,
        fecha_nacimiento: extraData?.fechaNacimiento || null,
        pais: extraData?.pais?.trim() || null,
        experiencia: extraData?.experiencia?.trim() || null,
      }, 'upsert');
    }
    return data;
  },

  /**
   * Actualiza la foto de perfil con una captura de cámara en vivo.
   *
   * Guarda la URL de Storage, no el base64 (ver subirRostroAStorage).
   *
   * Sella `foto_verificada_en`, que es lo único que habilita el badge
   * "Rostro Verificado". Sin este sello el badge no debe mostrarse.
   */
  async updateFotoPerfilCamara(userId: string, fotoBase64: string): Promise<boolean> {
    const urlFinal = await subirRostroAStorage(userId, fotoBase64);

    const { error } = await supabase
      .from('perfiles')
      .update({
        foto_perfil: urlFinal,
        foto_verificada_en: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error al actualizar foto de perfil con cámara:', error);
      throw error;
    }
    return true;
  },

  // --- TICKETS ---
  async getTickets(): Promise<any[]> {
    const { data, error } = await supabase.from('tickets_soporte').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createTicket(ticket: any): Promise<any> {
    const dbTicket = {
      id: Date.now().toString(),
      nombre: ticket.nombre,
      email: ticket.email,
      tipo: ticket.tipo,
      mensaje: ticket.mensaje,
      archivobase64: ticket.archivoBase64,
      estado: 'Pendiente',
      fecha: ticket.fecha || new Date().toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };

    const { data, error } = await supabase.from('tickets_soporte').insert([dbTicket]).select().single();
    if (error) throw error;
    return data;
  },

  // --- TRABAJOS ---
  async getJobs(): Promise<any[]> {
    const { data, error } = await supabase.from('trabajos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async deleteJob(id: number | string): Promise<void> {
    const { error } = await supabase.from('trabajos').delete().eq('id', id);
    if (error) throw error;
  },

  async createJob(job: any): Promise<any> {
    const dbJob: any = {
      ...job,
      empleadoravatar: job.empleadorAvatar || job.empleadoravatar,
      // Discriminador real entre pedidos de servicio (muro) y ofertas de
      // empleo (bolsa de trabajo). Antes se borraba acá porque la columna
      // no existía; ver sprint0_esempleo.sql.
      esempleo: job.esEmpleo ?? job.esempleo ?? false,
    };
    delete dbJob.empleadorAvatar;
    delete dbJob.esEmpleo;

    // Fotos de referencia de la solicitud.
    // Antes se hacía `delete dbJob.imagen` porque la columna no existía, así que
    // las fotos que subía el cliente se perdían siempre. Ahora van a la columna
    // `imagenes text[]` como URLs de Storage (ver sprint0_desbloqueo.sql).
    const imagenes: string[] = Array.isArray(job.imagenes)
      ? job.imagenes.filter(Boolean)
      : (job.imagen ? [job.imagen] : []);
    delete dbJob.imagen;
    dbJob.imagenes = imagenes;

    // Guardar cliente_id del usuario autenticado para poder notificarlo después
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) dbJob.cliente_id = user.id;

    // Tolerante por si sprint0_esempleo.sql todavía no se corrió.
    const data = await insertarTolerante('trabajos', dbJob);

    // Asynchronously notify professionals in the background (no await so it doesn't block)
    dbHelper.notifyProfessionalsForJob(data).catch(console.error);

    return data;
  },

  // --- PREGUNTAS PRE-PRESUPUESTO ---
  async getPreguntasTrabajo(trabajoId: number | string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('preguntas_trabajo')
        .select('*, profesional:perfiles!profesional_id(nombre, foto_perfil)')
        .eq('trabajo_id', String(trabajoId))
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        pregunta: p.pregunta,
        respuesta: p.respuesta || null,
        fecha: p.created_at,
        profesionalNombre: p.profesional?.nombre || 'Profesional',
        profesionalAvatar: p.profesional?.foto_perfil || '',
        profesional_id: p.profesional_id,
      }));
    } catch (e) {
      console.error('Error getPreguntasTrabajo:', e);
      return [];
    }
  },

  async addPreguntaTrabajo(trabajoId: number | string, texto: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Insertar la pregunta
      const { error } = await supabase
        .from('preguntas_trabajo')
        .insert([{
          trabajo_id: String(trabajoId),
          profesional_id: user.id,
          pregunta: texto,
        }]);
      if (error) throw error;

      // Obtener el trabajo para saber a quién notificar
      const { data: trabajo } = await supabase
        .from('trabajos')
        .select('titulo, cliente_id')
        .eq('id', trabajoId)
        .maybeSingle();

      // Crear notificación para el cliente dueño del trabajo
      if (trabajo?.cliente_id) {
        const { data: profesionalPerfil } = await supabase
          .from('perfiles')
          .select('nombre')
          .eq('id', user.id)
          .maybeSingle();
        const nombrePro = profesionalPerfil?.nombre || 'Un profesional';
        await supabase.from('notificaciones').insert([{
          usuario_id: trabajo.cliente_id,
          tipo: 'trabajo',
          titulo: '💬 Nueva pregunta en tu trabajo',
          descripcion: `${nombrePro} preguntó sobre "${trabajo.titulo}": ${texto.substring(0, 80)}${texto.length > 80 ? '...' : ''}`,
          leida: false,
          referencia_id: String(trabajoId),
        }]);
      }

      return true;
    } catch (e) {
      console.error('Error addPreguntaTrabajo:', e);
      return false;
    }
  },

  async responderPreguntaTrabajo(preguntaId: string, respuesta: string): Promise<boolean> {
    try {
      // 1. Actualizar la pregunta
      const { data: pregActualizada, error } = await supabase
        .from('preguntas_trabajo')
        .update({ respuesta })
        .eq('id', preguntaId)
        .select('trabajo_id, profesional_id, pregunta, trabajos(titulo)')
        .single();
        
      if (error) throw error;
      
      // 2. Notificar al profesional
      if (pregActualizada?.profesional_id && pregActualizada?.trabajo_id) {
        const tituloTrabajo = (Array.isArray(pregActualizada.trabajos) ? (pregActualizada.trabajos[0] as any)?.titulo : (pregActualizada.trabajos as any)?.titulo) || 'un trabajo';
        await supabase.from('notificaciones').insert([{
          usuario_id: pregActualizada.profesional_id,
          tipo: 'mensaje',
          titulo: 'Respuesta del cliente',
          descripcion: `El cliente respondió a tu consulta sobre "${tituloTrabajo}": ${respuesta.substring(0, 80)}${respuesta.length > 80 ? '...' : ''}`,
          leida: false,
          referencia_id: String(pregActualizada.trabajo_id),
        }]);
      }

      return true;
    } catch (e) {
      console.error('Error responderPreguntaTrabajo:', e);
      return false;
    }
  },

  // --- POSTULACIONES ---
  async getAllPostulaciones(): Promise<any[]> {
    const { data, error } = await supabase.from('postulaciones').select('*');
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id || p.idpostulacion,
      idPostulacion: p.id || p.idpostulacion,
      empleoId: p.empleoid,
      candidato: p.candidato,
      candidatoAvatar: p.candidatoavatar,
      candidatoOficio: p.candidatooficio,
      empleador: p.empleador,
      estado: p.estado || 'Pendiente',
      fecha: p.fecha || p.created_at,
      mensaje: p.mensaje
    }));
  },

  async getPostulaciones(empleadorName: string): Promise<any[]> {
    const { data, error } = await supabase.from('postulaciones').select('*').eq('empleador', empleadorName);
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id || p.idpostulacion,
      idPostulacion: p.id || p.idpostulacion,
      empleoId: p.empleoid,
      tituloEmpleo: p.tituloempleo,
      candidato: p.candidato,
      candidatoAvatar: p.candidatoavatar,
      candidatoRating: p.candidatorating,
      candidatoVerificado: p.candidatoverificado,
      candidatoOficio: p.candidatooficio,
      empleador: p.empleador,
      estado: p.estado || 'Pendiente',
      fecha: p.fecha || p.created_at,
      mensaje: p.mensaje,
    }));
  },

  async updatePostulacion(id: number | string, nuevoEstado: string, _empleadorName: string): Promise<void> {
    const { error } = await supabase.from('postulaciones').update({ estado: nuevoEstado }).eq('id', id);
    if (error) throw error;
  },

  async createPostulacion(postulacion: any): Promise<any> {
    const dbPostulacion = {
      ...postulacion,
      idpostulacion: postulacion.idPostulacion || Date.now(),
      empleoid: postulacion.empleoId,
      tituloempleo: postulacion.tituloEmpleo,
      candidatoavatar: postulacion.candidatoAvatar,
      candidatorating: postulacion.candidatoRating,
      candidatoverificado: postulacion.candidatoVerificado,
      candidatooficio: postulacion.candidatoOficio
    };
    delete dbPostulacion.idPostulacion;
    delete dbPostulacion.empleoId;
    delete dbPostulacion.tituloEmpleo;
    delete dbPostulacion.candidatoAvatar;
    delete dbPostulacion.candidatoRating;
    delete dbPostulacion.candidatoVerificado;
    delete dbPostulacion.candidatoOficio;

    // Tolerante a columnas que no existen todavía en el esquema real
    // (oficio, tipo, provincia, candidatoverificado no están creadas).
    return insertarTolerante('postulaciones', dbPostulacion);
  },

  async getMisPostulaciones(candidatoName: string): Promise<any[]> {
    const { data, error } = await supabase.from('postulaciones').select('*').eq('candidato', candidatoName).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id || p.idpostulacion,
      idPostulacion: p.id || p.idpostulacion,
      empleoId: p.empleoid,
      tituloEmpleo: p.tituloempleo,
      candidato: p.candidato,
      candidatoAvatar: p.candidatoavatar,
      candidatoRating: p.candidatorating,
      candidatoVerificado: p.candidatoverificado,
      candidatoOficio: p.candidatooficio,
      empleador: p.empleador,
      estado: p.estado || 'Pendiente',
      fecha: p.fecha || p.created_at,
      mensaje: p.mensaje,
    }));
  },

  async deletePostulacion(empleoId: number | string, candidatoName: string): Promise<void> {
    const { error } = await supabase.from('postulaciones').delete().match({ empleoid: empleoId, candidato: candidatoName });
    if (error) throw error;
  },

  // --- REVIEWS ---
  async getReviewsForProfessional(professionalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(r => ({
      id: r.id,
      profesionalId: r.professional_id,
      clienteNombre: r.client_name,
      clienteAvatar: 'https://i.pravatar.cc/150?u=' + r.client_name,
      rating: r.rating,
      texto: r.review_text,
      trabajoTitulo: 'Servicio realizado',
      fecha: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  },

  async createReview(review: { professional_id: string; job_id: number | string; client_name: string; rating: number; review_text: string }): Promise<void> {
    const { error } = await supabase.from('reviews').insert([review]);
    if (error) throw error;
  },

  // --- CLIENTES (CRM) ---
  async getClientes(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        nombre: c.nombre,
        initials: c.initials,
        color: c.color,
        telefono: c.telefono,
        email: c.email,
        direccion: c.direccion
      }));
    } catch {
      return [];
    }
  },

  async saveCliente(cliente: any): Promise<void> {
    try {
      await supabase.from('clientes').upsert([{
        id: cliente.id,
        nombre: cliente.nombre,
        initials: cliente.initials,
        color: cliente.color,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion
      }]);
    } catch (err) {
      console.warn('Error syncing cliente to Supabase:', err);
    }
  },

  async deleteCliente(id: string): Promise<void> {
    try {
      await supabase.from('clientes').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting cliente from Supabase:', err);
    }
  },

  // --- OBRAS (CRM) ---
  async getObras(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(o => ({
        id: o.id,
        clienteId: o.cliente_id || o.clienteId,
        nombre: o.nombre,
        direccion: o.direccion,
        fecha: o.fecha,
        estado: o.estado,
        total: o.total,
        avance: o.avance,
        pagos: o.pagos || []
      }));
    } catch {
      return [];
    }
  },

  async saveObra(obra: any): Promise<void> {
    try {
      await supabase.from('obras').upsert([{
        id: obra.id,
        cliente_id: obra.clienteId,
        nombre: obra.nombre,
        direccion: obra.direccion,
        fecha: obra.fecha,
        estado: obra.estado,
        total: obra.total,
        avance: obra.avance,
        pagos: obra.pagos || []
      }]);
    } catch (err) {
      console.warn('Error syncing obra to Supabase:', err);
    }
  },

  async deleteObra(id: string): Promise<void> {
    try {
      await supabase.from('obras').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting obra from Supabase:', err);
    }
  },

  // --- PRESUPUESTOS ---
  async getPresupuestos(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('presupuestos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        nombre: p.nombre,
        cliente: p.cliente,
        telefono: p.telefono,
        nota: p.nota,
        totalManoObra: p.total_mano_obra,
        cantMateriales: p.cant_materiales,
        total: p.total,
        manoObra: p.mano_obra || [],
        materiales: p.materiales || [],
        fecha: p.fecha
      }));
    } catch {
      return [];
    }
  },

  async savePresupuesto(presupuesto: any): Promise<void> {
    try {
      await supabase.from('presupuestos').upsert([{
        id: presupuesto.id,
        nombre: presupuesto.nombre,
        cliente: presupuesto.cliente,
        telefono: presupuesto.telefono,
        nota: presupuesto.nota,
        total_mano_obra: presupuesto.totalManoObra,
        cant_materiales: presupuesto.cantMateriales,
        total: presupuesto.total,
        mano_obra: presupuesto.manoObra || [],
        materiales: presupuesto.materiales || [],
        fecha: presupuesto.fecha
      }]);
    } catch (err) {
      console.warn('Error syncing presupuesto to Supabase:', err);
    }
  },

  async deletePresupuesto(id: string): Promise<void> {
    try {
      await supabase.from('presupuestos').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting presupuesto from Supabase:', err);
    }
  },

  // ============================================================
  // CHAT — Integración Real con Supabase
  // ============================================================

  /**
   * Obtiene o crea una conversación entre dos usuarios.
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<any> {
    // Buscar conversación existente entre los dos usuarios
    const { data: existing, error: searchError } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`and(usuario1_id.eq.${userId1},usuario2_id.eq.${userId2}),and(usuario1_id.eq.${userId2},usuario2_id.eq.${userId1})`)
      .maybeSingle();

    if (searchError) {
      console.warn('Error buscando conversación:', searchError.message || JSON.stringify(searchError) || searchError);
    }

    if (existing) return existing;

    // Crear nueva conversación
    const { data: newConv, error: createError } = await supabase
      .from('conversaciones')
      .insert([{
        usuario1_id: userId1,
        usuario2_id: userId2,
        ultimo_mensaje: '',
        ultimo_mensaje_fecha: new Date().toISOString(),
      }])
      .select()
      .single();

    if (createError) throw createError;
    return newConv;
  },

  /**
   * Obtiene todas las conversaciones de un usuario con info del interlocutor.
   */
  async getConversaciones(userId: string): Promise<any[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('conversaciones')
        .select('*')
        .or(`usuario1_id.eq.${userId},usuario2_id.eq.${userId}`)
        .order('ultimo_mensaje_fecha', { ascending: false });

      if (error) {
        console.warn('Error al cargar conversaciones:', error.message || JSON.stringify(error) || error);
        return [];
      }

      if (!data || data.length === 0) return [];

    // Enrich with partner profile info
    const enriched = await Promise.all(data.map(async (conv) => {
      const partnerId = conv.usuario1_id === userId ? conv.usuario2_id : conv.usuario1_id;
      const partner = await dbHelper.getUserProfile(partnerId);
      
      // Count unread messages
      const { count } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('conversacion_id', conv.id)
        .eq('receptor_id', userId)
        .eq('leido', false);

      return {
        id: conv.id,
        partnerId,
        partnerNombre: partner?.nombre || partner?.name || 'Usuario',
        partnerAvatar: partner?.avatar || partner?.fotoPerfil || 'https://i.pravatar.cc/150?u=' + partnerId,
        partnerTrade: partner?.trade || '',
        ultimoMensaje: conv.ultimo_mensaje || '',
        ultimoMensajeFecha: conv.ultimo_mensaje_fecha,
        noLeidos: count || 0,
      };
    }));

      return enriched;
    } catch (err: any) {
      console.warn('Error general al cargar conversaciones:', err?.message || JSON.stringify(err) || err);
      return [];
    }
  },

  /**
   * Obtiene los mensajes de una conversación.
   */
  async getMensajes(conversacionId: string): Promise<any[]> {
    if (!conversacionId) return [];
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('fecha', { ascending: true });

    if (error) {
      console.warn('Error al cargar mensajes:', error.message || JSON.stringify(error) || error);
      return [];
    }

    return data || [];
  },

  /**
   * Envía un mensaje en una conversación.
   */
  async enviarMensaje(conversacionId: string, emisorId: string, receptorId: string, texto: string): Promise<any> {
    const { data, error } = await supabase
      .from('mensajes')
      .insert([{
        conversacion_id: conversacionId,
        emisor_id: emisorId,
        receptor_id: receptorId,
        texto,
        leido: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // Update conversation's ultimo_mensaje
    await supabase.from('conversaciones')
      .update({
        ultimo_mensaje: texto.startsWith('📄') ? 'Presupuesto enviado' : texto.substring(0, 100),
        ultimo_mensaje_fecha: new Date().toISOString()
      })
      .eq('id', conversacionId);

    // Enviar notificacion al receptor
    try {
      await dbHelper.crearNotificacion({
        usuario_id: receptorId,
        tipo: 'mensaje',
        titulo: 'Nuevo mensaje',
        descripcion: `Recibiste un nuevo mensaje: "${texto.substring(0, 50)}..."`,
        referencia_id: conversacionId
      });
    } catch (e) {
      console.warn('Error al enviar notificacion de mensaje:', e);
    }

    return data;
  },

  /**
   * Marca todos los mensajes de una conversación como leídos para un receptor.
   */
  async marcarMensajesLeidos(conversacionId: string, receptorId: string): Promise<void> {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('conversacion_id', conversacionId)
      .eq('receptor_id', receptorId)
      .eq('leido', false);
  },


  // ============================================================
  // ÓRDENES DE TRABAJO (Informe 7 + 9)
  // ============================================================

  /**
   * Crea una nueva Orden de Trabajo entre profesional y cliente.
   */
  async createOrdenTrabajo(orden: {
    profesional_id: string;
    cliente_id: string;
    titulo: string;
    descripcion?: string;
    garantia?: string;
    fecha_inicio?: string;
    monto?: number;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .insert([{
        profesional_id: orden.profesional_id,
        cliente_id: orden.cliente_id,
        titulo: orden.titulo,
        descripcion: orden.descripcion || '',
        estado: 'pendiente',
        garantia: orden.garantia || 'sin_garantia',
        fecha_inicio: orden.fecha_inicio || new Date().toISOString().split('T')[0],
        monto: orden.monto || 0,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene órdenes de trabajo de un profesional.
   */
  async getOrdenesTrabajoProfesional(profesionalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('*')
      .eq('profesional_id', profesionalId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando órdenes de trabajo:', error.message);
      return [];
    }
    // Sin FK declarada entre ordenes_trabajo y perfiles: se trae el perfil
    // del cliente aparte (mismo workaround que getPresupuestosPorTrabajo).
    return Promise.all((data || []).map(async (orden: any) => {
      const cliente = await dbHelper.getUserProfile(orden.cliente_id);
      return {
        ...orden,
        perfiles: cliente ? { nombre: cliente.nombre, foto_perfil: cliente.fotoPerfil, telefono: cliente.telefono } : null,
      };
    }));
  },

  /**
   * Obtiene órdenes de trabajo de un cliente.
   */
  async getOrdenesTrabajoCliente(clienteId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando órdenes de trabajo del cliente:', error.message);
      return [];
    }
    return Promise.all((data || []).map(async (orden: any) => {
      const profesional = await dbHelper.getUserProfile(orden.profesional_id);
      return {
        ...orden,
        perfiles: profesional ? { nombre: profesional.nombre, foto_perfil: profesional.fotoPerfil, telefono: profesional.telefono, oficios: profesional.oficios } : null,
      };
    }));
  },

  /**
   * Actualiza el estado de una Orden de Trabajo.
   */
  async updateOrdenTrabajoEstado(id: string, estado: string, fechaFin?: string): Promise<void> {
    const updates: any = { estado };
    if (fechaFin) updates.fecha_fin = fechaFin;
    const { error } = await supabase.from('ordenes_trabajo').update(updates).eq('id', id);
    if (error) throw error;
  },

  // ============================================================
  // RESEÑAS INTELIGENTES (Informe 7)
  // ============================================================

  /**
   * Crea una reseña inteligente con preguntas estructuradas.
   * Solo se puede crear si existe una Orden de Trabajo registrada.
   */
  async createResenaInteligente(resena: {
    orden_trabajo_id: string;
    profesional_id: string;
    cliente_id: string;
    puntualidad: number;
    resolvio_problema: number;
    volveria_contratar: boolean;
    dejo_limpio: number;
    comentario?: string;
  }): Promise<any> {
    const rating_promedio = (resena.puntualidad + resena.resolvio_problema + resena.dejo_limpio) / 3;
    const { data, error } = await supabase
      .from('resenas_inteligentes')
      .insert([{ ...resena, rating_promedio: Math.round(rating_promedio * 10) / 10 }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las reseñas inteligentes de un profesional.
   */
  async getResenasProfesional(profesionalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('resenas_inteligentes')
      .select('*, perfiles!resenas_inteligentes_cliente_id_fkey(nombre, foto_perfil)')
      .eq('profesional_id', profesionalId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando reseñas inteligentes:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Verifica si un cliente puede dejar reseña (tiene orden de trabajo finalizada).
   */
  async puedeDejarResena(profesionalId: string, clienteId: string): Promise<boolean> {
    const { data } = await supabase
      .from('ordenes_trabajo')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('cliente_id', clienteId)
      .in('estado', ['finalizado', 'con_garantia'])
      .limit(1);
    return (data?.length || 0) > 0;
  },

  // ============================================================
  // ÍNDICE DE CONFIANZA (Informe 7)
  // ============================================================

  /**
   * Calcula el Índice de Confianza de un profesional (0-100).
   * Ponderación:
   *   - Identidad verificada: 20 pts
   *   - Perfil completo (foto, bio, oficios, zona): 15 pts
   *   - Trabajos completados (máx 20 pts escalonado): 20 pts
   *   - Rating promedio de reseñas: 20 pts
   *   - Tiempo de respuesta: 15 pts
   *   - Sin reclamos activos: 10 pts
   */
  async calcularIndiceConfianza(profesionalId: string): Promise<{
    total: number;
    desglose: Record<string, number>;
    sugerencias: string[];
  }> {
    try {
      const [perfil, resenas, ordenes] = await Promise.all([
        supabase.from('perfiles').select('*').eq('id', profesionalId).maybeSingle(),
        supabase.from('resenas_inteligentes').select('rating_promedio').eq('profesional_id', profesionalId),
        supabase.from('ordenes_trabajo').select('id, estado').eq('profesional_id', profesionalId).in('estado', ['finalizado', 'con_garantia']),
      ]);

      const p = perfil.data;
      const desglose: Record<string, number> = {};
      const sugerencias: string[] = [];

      // 1. Identidad verificada (20 pts)
      desglose.identidad = p?.verificado ? 20 : 0;
      if (!p?.verificado) sugerencias.push('Verificá tu identidad para ganar 20 puntos');

      // 2. Perfil completo (15 pts)
      let perfilPts = 0;
      if (p?.foto_perfil) perfilPts += 4;
      if (p?.biografia && p.biografia.length > 30) perfilPts += 4;
      if (p?.oficios?.length > 0) perfilPts += 4;
      if (p?.provincia && p?.ciudad) perfilPts += 3;
      desglose.perfilCompleto = perfilPts;
      if (perfilPts < 15) sugerencias.push('Completá tu perfil (foto, descripción, zona)');

      // 3. Trabajos completados (20 pts, escalonado)
      const totalTrab = ordenes.data?.length || 0;
      let trabajoPts = 0;
      if (totalTrab >= 1) trabajoPts = 5;
      if (totalTrab >= 5) trabajoPts = 10;
      if (totalTrab >= 10) trabajoPts = 15;
      if (totalTrab >= 25) trabajoPts = 20;
      desglose.trabajos = trabajoPts;
      if (trabajoPts < 20) sugerencias.push(`Completá más trabajos (tenés ${totalTrab}, necesitás 25 para el máximo)`);

      // 4. Rating promedio (20 pts)
      const ratings = resenas.data?.map((r: any) => r.rating_promedio) || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      const ratingPts = ratings.length === 0 ? 0 : Math.round((avgRating / 5) * 20);
      desglose.rating = ratingPts;
      if (ratings.length === 0) sugerencias.push('Conseguí tus primeras reseñas verificadas');

      // 5. Tiempo de respuesta (15 pts)
      const tiempoRespuesta = p?.tiempo_respuesta_minutos || 999;
      let tiempoPts = 0;
      if (tiempoRespuesta <= 10) tiempoPts = 15;
      else if (tiempoRespuesta <= 30) tiempoPts = 10;
      else if (tiempoRespuesta <= 60) tiempoPts = 5;
      desglose.tiempoRespuesta = tiempoPts;
      if (tiempoPts < 15) sugerencias.push('Respondé más rápido a los mensajes');

      // 6. Sin reclamos (10 pts)
      const { count: reclamos } = await supabase
        .from('reportes')
        .select('*', { count: 'exact', head: true })
        .eq('reportado_id', profesionalId)
        .eq('estado', 'pendiente');
      desglose.sinReclamos = (reclamos || 0) === 0 ? 10 : Math.max(0, 10 - (reclamos || 0) * 3);

      const total = Object.values(desglose).reduce((a, b) => a + b, 0);
      return { total: Math.min(100, total), desglose, sugerencias: sugerencias.slice(0, 3) };
    } catch (e) {
      console.warn('Error calculando índice de confianza:', e);
      return { total: 0, desglose: {}, sugerencias: [] };
    }
  },

  // ============================================================
  // MI HOGAR — Centro Digital del Hogar (Informe 8-9)
  // ============================================================

  /**
   * Obtiene todas las propiedades de un cliente.
   */
  async getPropiedades(clienteId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mi_hogar_propiedades')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando propiedades:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Crea una nueva propiedad en Mi Hogar.
   */
  async createPropiedad(propiedad: {
    cliente_id: string;
    nombre: string;
    direccion?: string;
    tipo?: string;
    superficie_m2?: number;
    anio_construccion?: number;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('mi_hogar_propiedades')
      .insert([propiedad])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Actualiza una propiedad existente.
   */
  async updatePropiedad(id: string, updates: any): Promise<void> {
    const { error } = await supabase.from('mi_hogar_propiedades').update(updates).eq('id', id);
    if (error) throw error;
  },

  /**
   * Elimina una propiedad y todos sus datos asociados.
   */
  async deletePropiedad(id: string): Promise<void> {
    await supabase.from('mi_hogar_comprobantes').delete().eq('propiedad_id', id);
    await supabase.from('mi_hogar_mantenimientos').delete().eq('propiedad_id', id);
    const { error } = await supabase.from('mi_hogar_propiedades').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Obtiene comprobantes de una propiedad.
   */
  async getComprobantes(propiedadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mi_hogar_comprobantes')
      .select('*')
      .eq('propiedad_id', propiedadId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando comprobantes:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Crea un nuevo comprobante en una propiedad.
   */
  async createComprobante(comprobante: {
    propiedad_id: string;
    cliente_id: string;
    tipo: string;
    descripcion?: string;
    url_archivo?: string;
    monto?: number;
    fecha_documento?: string;
    fecha_vencimiento?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('mi_hogar_comprobantes')
      .insert([comprobante])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Elimina un comprobante.
   */
  async deleteComprobante(id: string): Promise<void> {
    const { error } = await supabase.from('mi_hogar_comprobantes').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Obtiene los mantenimientos programados de una propiedad.
   */
  async getMantenimientos(propiedadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mi_hogar_mantenimientos')
      .select('*')
      .eq('propiedad_id', propiedadId)
      .order('proxima_fecha', { ascending: true });
    if (error) {
      console.warn('Error cargando mantenimientos:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Crea un recordatorio de mantenimiento.
   */
  async createMantenimiento(mantenimiento: {
    propiedad_id: string;
    cliente_id: string;
    titulo: string;
    descripcion?: string;
    frecuencia?: string;
    proxima_fecha?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('mi_hogar_mantenimientos')
      .insert([{ ...mantenimiento, completado: false }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Marca un mantenimiento como completado.
   */
  async completarMantenimiento(id: string): Promise<void> {
    const { error } = await supabase
      .from('mi_hogar_mantenimientos')
      .update({ completado: true })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Obtiene el historial completo de trabajos de una propiedad.
   */
  async getHistorialPropiedad(propiedadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('*, perfiles!ordenes_trabajo_profesional_id_fkey(nombre, foto_perfil, oficios)')
      .eq('propiedad_id', propiedadId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando historial de propiedad:', error.message);
      return [];
    }
    return data || [];
  },

  // ============================================================
  // LOGROS Y MISIONES / GAMIFICACIÓN (Informe 8)
  // ============================================================

  /**
   * Obtiene los logros desbloqueados de un profesional.
   */
  async getLogros(profesionalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('logros_profesional')
      .select('*')
      .eq('profesional_id', profesionalId)
      .order('desbloqueado_en', { ascending: false });
    if (error) {
      console.warn('Error cargando logros:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Desbloquea un logro para un profesional (si no lo tiene ya).
   */
  async desbloquearLogro(profesionalId: string, tipo: string, titulo: string, descripcion: string): Promise<void> {
    const { data: existing } = await supabase
      .from('logros_profesional')
      .select('id')
      .eq('profesional_id', profesionalId)
      .eq('tipo', tipo)
      .maybeSingle();
    if (existing) return; // Ya tiene el logro
    await supabase.from('logros_profesional').insert([{
      profesional_id: profesionalId,
      tipo,
      titulo,
      descripcion,
    }]);
  },

  /**
   * Calcula el nivel de plataforma según trabajos completados.
   * Bronce: 0-9, Plata: 10-49, Oro: 50-99, Platino: 100+
   */
  getNivelPlataforma(totalTrabajos: number): { nivel: string; emoji: string; siguiente: number } {
    if (totalTrabajos >= 100) return { nivel: 'Platino', emoji: 'ðŸ’Ž', siguiente: 0 };
    if (totalTrabajos >= 50) return { nivel: 'Oro', emoji: 'ðŸ¥‡', siguiente: 100 };
    if (totalTrabajos >= 10) return { nivel: 'Plata', emoji: 'ðŸ¥ˆ', siguiente: 50 };
    return { nivel: 'Bronce', emoji: 'ðŸ¥‰', siguiente: 10 };
  },

  // ============================================================
  // PANEL FINANCIERO (Informe 9) — Solo estadísticas, sin pagos
  // ============================================================

  /**
   * Obtiene estadísticas financieras del profesional.
   * No maneja pagos reales, solo organiza información registrada.
   */
  async getEstadisticasFinancieras(profesionalId: string): Promise<{
    totalPresupuestado: number;
    ticketPromedio: number;
    trabajosEstesMes: number;
    serviciosMasVendidos: Array<{ servicio: string; cantidad: number }>;
    evolucionMensual: Array<{ mes: string; total: number }>;
  }> {
    try {
      const { data: ordenes } = await supabase
        .from('ordenes_trabajo')
        .select('monto, titulo, created_at, estado')
        .eq('profesional_id', profesionalId)
        .in('estado', ['finalizado', 'con_garantia']);

      const items = ordenes || [];
      const totalPresupuestado = items.reduce((acc: number, o: any) => acc + (o.monto || 0), 0);
      const ticketPromedio = items.length > 0 ? totalPresupuestado / items.length : 0;

      const now = new Date();
      const trabajosEstesMes = items.filter((o: any) => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Servicios más frecuentes
      const conteo: Record<string, number> = {};
      items.forEach((o: any) => {
        const key = o.titulo?.split(' ')[0] || 'Otro';
        conteo[key] = (conteo[key] || 0) + 1;
      });
      const serviciosMasVendidos = Object.entries(conteo)
        .map(([servicio, cantidad]) => ({ servicio, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Evolución últimos 6 meses
      const evolucionMensual: Array<{ mes: string; total: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mes = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
        const total = items
          .filter((o: any) => {
            const od = new Date(o.created_at);
            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          })
          .reduce((acc: number, o: any) => acc + (o.monto || 0), 0);
        evolucionMensual.push({ mes, total });
      }

      return { totalPresupuestado, ticketPromedio, trabajosEstesMes, serviciosMasVendidos, evolucionMensual };
    } catch (e) {
      console.warn('Error cargando estadísticas financieras:', e);
      return { totalPresupuestado: 0, ticketPromedio: 0, trabajosEstesMes: 0, serviciosMasVendidos: [], evolucionMensual: [] };
    }
  },

  // ============================================================
  // REPORTES BIDIRECCIONALES (Informe 7)
  // ============================================================

  /**
   * Crea un reporte (cliente reporta profesional o viceversa).
   */
  async createReporte(reporte: {
    reportador_id: string;
    reportado_id: string;
    tipo: string;
    descripcion: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('reportes')
      .insert([{ ...reporte, estado: 'pendiente' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todos los reportes (para admin).
   */
  async getReportes(): Promise<any[]> {
    const { data, error } = await supabase
      .from('reportes')
      .select('*, reportador:perfiles!reportes_reportador_id_fkey(nombre, foto_perfil), reportado:perfiles!reportes_reportado_id_fkey(nombre, foto_perfil)')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Error cargando reportes:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Actualiza el estado de un reporte (para admin).
   */
  async updateReporteEstado(id: string, estado: string): Promise<void> {
    const { error } = await supabase.from('reportes').update({ estado }).eq('id', id);
    if (error) throw error;
  },

  // ============================================================
  // RESUMEN DIARIO DEL PROFESIONAL (Informe 9) — Sin IA
  // ============================================================

  /**
   * Genera el resumen diario real del profesional.
   * Datos 100% de Supabase, sin IA, sin datos simulados.
   */
  async getResumenDiarioProfesional(profesionalId: string): Promise<{
    trabajosHoy: number;
    presupuestosPendientes: number;
    mensajesNoLeidos: number;
    nuevasSolicitudes: number;
    alertas: string[];
  }> {
    try {
      const hoy = new Date().toISOString().split('T')[0];

      const [ordenesHoy, presupuestos, mensajes, solicitudes] = await Promise.all([
        supabase.from('ordenes_trabajo').select('id', { count: 'exact', head: true })
          .eq('profesional_id', profesionalId)
          .eq('fecha_inicio', hoy)
          .eq('estado', 'en_progreso'),
        supabase.from('presupuestos').select('id', { count: 'exact', head: true })
          .eq('profesional_id', profesionalId)
          .eq('estado', 'pendiente'),
        supabase.from('mensajes').select('id', { count: 'exact', head: true })
          .eq('receptor_id', profesionalId)
          .eq('leido', false),
        supabase.from('trabajos').select('id', { count: 'exact', head: true })
          .eq('estado', 'abierto')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Alertas inteligentes basadas en reglas (sin IA)
      const alertas: string[] = [];
      if ((mensajes.count || 0) > 3) alertas.push(`Tenés ${mensajes.count} mensajes sin leer`);
      if ((presupuestos.count || 0) > 2) alertas.push(`${presupuestos.count} presupuestos esperan tu respuesta`);

      return {
        trabajosHoy: ordenesHoy.count || 0,
        presupuestosPendientes: presupuestos.count || 0,
        mensajesNoLeidos: mensajes.count || 0,
        nuevasSolicitudes: solicitudes.count || 0,
        alertas,
      };
    } catch (e) {
      console.warn('Error cargando resumen diario:', e);
      return { trabajosHoy: 0, presupuestosPendientes: 0, mensajesNoLeidos: 0, nuevasSolicitudes: 0, alertas: [] };
    }
  },

  // ============================================================
  // ESTADÍSTICAS DE PERFIL / MI MARCA (Informe 8)
  // ============================================================

  /**
   * Obtiene estadísticas de visitas al perfil del profesional.
   * Usa tabla profile_views si existe, fallback a 0.
   */
  async getEstadisticasPerfil(profesionalId: string): Promise<{
    visitasTotal: number;
    visitasSemana: number;
    contactosSemana: number;
    clientesRecurrentes: number;
  }> {
    try {
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [visitasSemana, contactosSemana, clientesRecurrentes] = await Promise.all([
        supabase.from('profile_views').select('id', { count: 'exact', head: true })
          .eq('profesional_id', profesionalId)
          .gte('created_at', semanaAtras),
        supabase.from('conversaciones').select('id', { count: 'exact', head: true })
          .or(`usuario1_id.eq.${profesionalId},usuario2_id.eq.${profesionalId}`)
          .gte('created_at', semanaAtras),
        supabase.from('ordenes_trabajo').select('cliente_id')
          .eq('profesional_id', profesionalId)
          .in('estado', ['finalizado', 'con_garantia']),
      ]);

      // Contar clientes únicos con más de 1 trabajo
      const clientesIds = (clientesRecurrentes.data || []).map((o: any) => o.cliente_id);
      const conteo: Record<string, number> = {};
      clientesIds.forEach((id: string) => { conteo[id] = (conteo[id] || 0) + 1; });
      const recurrentes = Object.values(conteo).filter(v => v > 1).length;

      return {
        visitasTotal: 0, // Requiere función RPC especial en Supabase
        visitasSemana: visitasSemana.count || 0,
        contactosSemana: contactosSemana.count || 0,
        clientesRecurrentes: recurrentes,
      };
    } catch (e) {
      console.warn('Error cargando estadísticas de perfil:', e);
      return { visitasTotal: 0, visitasSemana: 0, contactosSemana: 0, clientesRecurrentes: 0 };
    }
  },

  // ============================================================
  // DATA CLEANUP — Limpieza total de datos
  // ============================================================

  /**
   * Borra TODOS los datos de todas las tablas de Supabase.
   * ¡Usar con precaución! Solo para resetear la plataforma.
   */
  async cleanAllData(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const currentUser = await getCurrentUser();
    
    const tables = [
      'mensajes',
      'messages',
      'conversaciones',
      'reviews',
      'postulaciones',
      'job_postings',
      'trabajos',
      'jobs',
      'tickets_soporte',
      'clientes',
      'obras',
      'presupuestos',
      'quotes',
      'quote_items',
      'profesionales',
      'portfolio_photos',
      'profiles',
      'perfiles',
    ];

    for (const table of tables) {
      try {
        // Usar uuid válido o .not('id', 'is', null) para evitar error de sintaxis 'invalid input syntax for type uuid'
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          // Reintentar con sintaxis IS NOT NULL si la columna o la tabla requiere otra consulta
          const { error: err2 } = await supabase.from(table).delete().not('id', 'is', null);
          if (err2) {
            errors.push(`${table}: ${err2.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`${table}: ${err.message}`);
      }
    }

    // Re-crear / asegurar perfil admin para que no quede bloqueado
    if (currentUser) {
      try {
        await supabase.from('perfiles').upsert({
          id: currentUser.id,
          email: currentUser.email,
          nombre: currentUser.user_metadata?.nombre || 'Gonzalo Humacata',
          rol: 'admin',
          verificado: true
        });
      } catch (e) {
        console.warn('Error re-creando perfil admin tras vaciar:', e);
      }
    }

    // Also clean localStorage
    clearAllLocalData();

    return { success: errors.length === 0, errors };
  },

  // ============================================================
  // PRESUPUESTOS ESTRUCTURADOS & CONTRATACIÓN
  // ============================================================

  async getPresupuestosPorTrabajo(trabajoId: string): Promise<any[]> {
    if (!trabajoId) return [];
    try {
      const { data, error } = await supabase
        .from('presupuestos_estructurados')
        .select('*')
        .ilike('observaciones', `%TRABAJO_ID:${trabajoId}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch profiles manually to avoid Foreign Key missing relation errors in PostgREST
      const enriched = await Promise.all(data.map(async (pres: any) => {
        const profile = await dbHelper.getUserProfile(pres.profesional_id);
        return {
          ...pres,
          profesional: profile ? { nombre: profile.nombre, foto_perfil: profile.fotoPerfil, id: profile.id } : null
        };
      }));

      return enriched;
    } catch (e) {
      console.warn('Error fetching presupuestos por trabajo:', e);
      return [];
    }
  },

  async getPresupuestosEnviados(profesionalId: string): Promise<any[]> {
    if (!profesionalId) return [];
    try {
      const { data, error } = await supabase
        .from('presupuestos_estructurados')
        .select('*')
        .eq('profesional_id', profesionalId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Error fetching presupuestos enviados:', e);
      return [];
    }
  },

  async crearPresupuestoEstructurado(payload: {
    conversacion_id: string;
    profesional_id: string;
    cliente_id: string;
    trabajo_id?: string;
    monto: number;
    tiempo_estimado?: string;
    garantia?: string;
    detalle?: string;
    materiales_incluidos?: boolean;
    observaciones?: string;
  }) {
    // Si hay trabajo_id, lo inyectamos en observaciones porque la columna no existe
    const observacionesFinal = payload.trabajo_id 
      ? `${payload.observaciones || ''} | TRABAJO_ID:${payload.trabajo_id}` 
      : payload.observaciones;

    const dbPayload = {
      conversacion_id: payload.conversacion_id,
      profesional_id: payload.profesional_id,
      cliente_id: payload.cliente_id,
      monto: payload.monto,
      tiempo_estimado: payload.tiempo_estimado,
      garantia: payload.garantia,
      detalle: payload.detalle,
      materiales_incluidos: payload.materiales_incluidos,
      observaciones: observacionesFinal,
      estado: 'pendiente'
    };

    const { data, error } = await supabase
      .from('presupuestos_estructurados')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    // Enviar mensaje especial de notificación en la conversación
    await this.enviarMensaje(
      payload.conversacion_id,
      payload.profesional_id,
      payload.cliente_id,
      `📄 PRESUPUESTO_ENVIADO:${data.id}`
    );

    return data;
  },

  async aceptarPresupuestoEstructurado(presupuestoId: string, clienteId: string) {
    // 1. Obtener datos del presupuesto
    const { data: pres, error: presErr } = await supabase
      .from('presupuestos_estructurados')
      .select('*')
      .eq('id', presupuestoId)
      .single();

    if (presErr || !pres) throw new Error('Presupuesto no encontrado');

    // 2. Marcar presupuesto como aceptado
    await supabase
      .from('presupuestos_estructurados')
      .update({ estado: 'aceptado' })
      .eq('id', presupuestoId);

    // 3. Crear automáticamente la Orden de Trabajo
    const { data: orden, error: ordenErr } = await supabase
      .from('ordenes_trabajo')
      .insert({
        profesional_id: pres.profesional_id,
        cliente_id: clienteId,
        titulo: pres.detalle || 'Trabajo Contratado',
        descripcion: pres.observaciones || '',
        monto: pres.monto,
        garantia: pres.garantia || '30_dias',
        estado: 'en_progreso',
        fecha_inicio: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (ordenErr) console.warn('Error al crear orden automatica:', ordenErr);

    // 4. Crear el Expediente del Trabajo (Carpeta Digital)
    const { data: expediente } = await supabase
      .from('expedientes_trabajo')
      .insert({
        orden_trabajo_id: orden?.id,
        presupuesto_id: presupuestoId,
        conversacion_id: pres.conversacion_id,
        cliente_id: clienteId,
        profesional_id: pres.profesional_id,
        titulo: pres.detalle || 'Trabajo Contratado',
        costo_total: pres.monto,
        garantia: pres.garantia || '30_dias'
      })
      .select()
      .single();

    // 5. Cambiar el estado de la conversación a 'trabajo'
    if (pres.conversacion_id) {
      await supabase
        .from('conversaciones')
        .update({ estado_chat: 'trabajo', orden_trabajo_id: orden?.id })
        .eq('id', pres.conversacion_id);

      // Enviar mensaje de confirmación
      await supabase.from('mensajes').insert({
        conversacion_id: pres.conversacion_id,
        emisor_id: clienteId,
        receptor_id: pres.profesional_id,
        texto: `✅ PRESUPUESTO_ACEPTADO:${expediente?.id || ''}`
      });
    }

    return { orden, expediente };
  },

  async rechazarPresupuestoEstructurado(presupuestoId: string, clienteId: string, motivo?: string) {
    const { data: pres } = await supabase
      .from('presupuestos_estructurados')
      .select('*')
      .eq('id', presupuestoId)
      .single();

    await supabase
      .from('presupuestos_estructurados')
      .update({ estado: 'rechazado', motivo_rechazo: motivo || 'Elegí otra opción' })
      .eq('id', presupuestoId);

    if (pres?.conversacion_id) {
      await supabase.from('mensajes').insert({
        conversacion_id: pres.conversacion_id,
        emisor_id: clienteId,
        receptor_id: pres.profesional_id,
        texto: `❌ PRESUPUESTO_RECHAZADO:${motivo || 'No especificado'}`
      });
    }
  },

  // ============================================================
  // EXPEDIENTES DEL TRABAJO
  // ============================================================

  async getExpedienteTrabajo(expedienteId: string) {
    const { data, error } = await supabase
      .from('expedientes_trabajo')
      .select(`
        *,
        ordenes_trabajo(*),
        presupuestos_estructurados(*),
        profesional:perfiles!profesional_id(*),
        cliente:perfiles!cliente_id(*)
      `)
      .eq('id', expedienteId)
      .single();

    if (error) throw error;
    return data;
  },

  async getExpedientesCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('expedientes_trabajo')
      .select(`
        *,
        profesional:perfiles!profesional_id(nombre, foto_perfil, oficio_principal)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  // ============================================================
  // TICKETS DE SOPORTE (#SO-XXXXXX)
  // ============================================================

  async crearTicketSoporte(payload: {
    usuario_id: string;
    categoria: string;
    asunto?: string;
    mensaje: string;
    adjuntos?: string[];
  }) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const codigo_ticket = `#SO-${randomNum}`;

    const { data, error } = await supabase
      .from('tickets_soporte')
      .insert({
        ...payload,
        codigo_ticket,
        estado: 'Recibida'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTicketsSoporteUsuario(usuarioId: string) {
    const { data, error } = await supabase
      .from('tickets_soporte')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async getTodosLosTicketsAdmin() {
    const { data, error } = await supabase
      .from('tickets_soporte')
      .select('*, usuario:perfiles!usuario_id(nombre, email, rol)')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  },

  async responderTicketAdmin(ticketId: string, respuesta: string, nuevoEstado: string) {
    const { data, error } = await supabase
      .from('tickets_soporte')
      .update({
        respuesta_admin: respuesta,
        fecha_respuesta: new Date().toISOString(),
        estado: nuevoEstado
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============================================================
  // CENTRO DE RESOLUCIÓN DE DISPUTAS
  // ============================================================

  async crearDisputaResolucion(payload: {
    orden_trabajo_id?: string;
    cliente_id: string;
    profesional_id: string;
    tipo_solucion: string;
    descripcion: string;
    monto_reclamado?: number;
  }) {
    const { data, error } = await supabase
      .from('disputas_resolucion')
      .insert({
        ...payload,
        estado: payload.tipo_solucion === 'Intervención SuperOficios' ? 'escalado_admin' : 'en_proceso'
      })
      .select()
      .single();

    if (error) throw error;

    // Si solicita intervención de SuperOficios, auto-genera ticket admin de prioridad alta
    if (payload.tipo_solucion === 'Intervención SuperOficios') {
      await dbHelper.crearTicketSoporte({
        usuario_id: payload.cliente_id,
        categoria: 'Reclamo',
        asunto: `Disputa de Mediación en Trabajo #${payload.orden_trabajo_id || ''}`,
        mensaje: `Solicitud de Intervención urgente: ${payload.descripcion}`
      });
    }

    return data;
  },

  async getDisputasCliente(clienteId: string) {
    const { data } = await supabase
      .from('disputas_resolucion')
      .select('*, profesional:perfiles!profesional_id(nombre)')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    return data || [];
  },


  // ============================================================
  // URLS SEMANTICAS SEO - Perfil por Slug (desde Supabase)
  // ============================================================

  async getProfileBySlug(slug: string): Promise<any> {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('slug', slug)
      .eq('rol', 'profesional')
      .maybeSingle();
    if (error || !data) return null;
    return data;
  },

  // ============================================================
  // HISTORIAL DE CLIENTES (mini-CRM del Profesional)
  // ============================================================

  async getHistorialClientes(profesionalId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('ordenes_trabajo')
      .select('id, titulo, estado, monto, created_at, cliente:perfiles!ordenes_trabajo_cliente_id_fkey(id, nombre, foto_perfil, telefono)')
      .eq('profesional_id', profesionalId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const byCliente: Record<string, any> = {};
    for (const orden of data) {
      const cId = (orden.cliente as any)?.id;
      if (!cId) continue;
      if (!byCliente[cId]) {
        byCliente[cId] = {
          clienteId: cId,
          nombre: (orden.cliente as any)?.nombre || 'Cliente',
          fotoPerfil: (orden.cliente as any)?.foto_perfil || '',
          telefono: (orden.cliente as any)?.telefono || '',
          totalTrabajos: 0,
          ultimoTrabajo: orden.titulo,
          ultimaFecha: orden.created_at,
          montoTotal: 0,
        };
      }
      byCliente[cId].totalTrabajos++;
      byCliente[cId].montoTotal += parseFloat(orden.monto || 0);
      if (orden.created_at > byCliente[cId].ultimaFecha) {
        byCliente[cId].ultimaFecha = orden.created_at;
        byCliente[cId].ultimoTrabajo = orden.titulo;
      }
    }
    return Object.values(byCliente).slice(0, 8);
  },

  // ============================================================
  // ACTIVIDAD RECIENTE (Perfil Vivo)
  // ============================================================

  async getActividadReciente(profesionalId: string): Promise<any[]> {
    const ahora = new Date();
    const actividades = [];
    try {
      const { data: msgs } = await supabase
        .from('mensajes')
        .select('fecha')
        .or('emisor_id.eq.' + profesionalId + ',receptor_id.eq.' + profesionalId)
        .order('fecha', { ascending: false })
        .limit(1);

      if (msgs?.[0]) {
        const mins = Math.floor((ahora.getTime() - new Date(msgs[0].fecha).getTime()) / 60000);
        actividades.push({
          tipo: 'mensaje', icono: '💬',
          texto: mins < 60 ? 'Respondiste hace ' + mins + ' min' : 'Ultimo mensaje hace ' + Math.floor(mins / 60) + 'h',
        });
      }

      const { data: ordenes } = await supabase
        .from('ordenes_trabajo')
        .select('titulo, updated_at')
        .eq('profesional_id', profesionalId)
        .eq('estado', 'finalizado')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (ordenes?.[0]) {
        const dias = Math.floor((ahora.getTime() - new Date(ordenes[0].updated_at).getTime()) / 86400000);
        actividades.push({
          tipo: 'trabajo', icono: '✅',
          texto: dias === 0 ? 'Terminaste un trabajo hoy' : 'Finalizaste un trabajo hace ' + dias + ' dia(s)',
        });
      }

      const { count: numResenas } = await supabase
        .from('resenas_inteligentes')
        .select('*', { count: 'exact', head: true })
        .eq('profesional_id', profesionalId)
        .gte('created_at', new Date(ahora.getTime() - 7 * 86400000).toISOString());

      if ((numResenas || 0) > 0) {
        actividades.push({ tipo: 'resena', icono: '⭐', texto: 'Recibiste ' + numResenas + ' resena(s) esta semana' });
      }

      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const { count: visitas } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profesional_id', profesionalId)
        .gte('created_at', hoy.toISOString());

      if ((visitas || 0) > 0) {
        actividades.push({ tipo: 'visita', icono: '👁️', texto: visitas + ' cliente(s) vieron tu perfil hoy' });
      }
    } catch (err) {
      console.warn('getActividadReciente error:', err);
    }
    return actividades.slice(0, 4);
  },

  // ============================================================
  // SISTEMA DE PUNTOS Y RECOMPENSAS
  // ============================================================

  async getOrCreatePuntosProfesional(profesionalId: string): Promise<any> {
    let { data } = await supabase
      .from('puntos_profesional')
      .select('*')
      .eq('profesional_id', profesionalId)
      .maybeSingle();

    if (!data) {
      const { data: newData } = await supabase
        .from('puntos_profesional')
        .insert({ profesional_id: profesionalId, puntos_totales: 0, puntos_canjeados: 0, nivel: 'Bronce' })
        .select()
        .single();
      data = newData;
    }
    return data;
  },

  async registrarPuntos(profesionalId: string, accion: string, puntos: number, descripcion?: string): Promise<void> {
    try {
      await supabase.from('transacciones_puntos').insert({
        profesional_id: profesionalId, tipo: 'ganado', accion, puntos,
        descripcion: descripcion || accion,
      });
      const actual = await dbHelper.getOrCreatePuntosProfesional(profesionalId);
      const nuevosTotal = (actual?.puntos_totales || 0) + puntos;
      let nivel = 'Bronce';
      if (nuevosTotal >= 1000) nivel = 'Platino';
      else if (nuevosTotal >= 500) nivel = 'Oro';
      else if (nuevosTotal >= 200) nivel = 'Plata';
      await supabase.from('puntos_profesional')
        .update({ puntos_totales: nuevosTotal, nivel })
        .eq('profesional_id', profesionalId);
    } catch (err) { console.warn('registrarPuntos error:', err); }
  },

  // ============================================================
  // CONVERSACIONES RECIENTES - Para Panel Profesional
  // ============================================================

  async getConversacionesRecientes(userId: string, limit = 5): Promise<any[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('conversaciones')
        .select('*')
        .or('usuario1_id.eq.' + userId + ',usuario2_id.eq.' + userId)
        .order('ultimo_mensaje_fecha', { ascending: false })
        .limit(limit);

      if (error || !data?.length) return [];

      const enriched = await Promise.all(data.map(async (conv) => {
        const partnerId = conv.usuario1_id === userId ? conv.usuario2_id : conv.usuario1_id;
        const { data: partner } = await supabase
          .from('perfiles')
          .select('id, nombre, foto_perfil, rol')
          .eq('id', partnerId)
          .maybeSingle();

        return {
          id: conv.id,
          partnerId,
          partnerNombre: partner?.nombre || 'Usuario',
          partnerAvatar: partner?.foto_perfil || 'https://i.pravatar.cc/150?u=' + partnerId,
          partnerRol: partner?.rol || 'cliente',
          ultimoMensaje: conv.ultimo_mensaje || '',
          ultimoMensajeFecha: conv.ultimo_mensaje_fecha,
          estadoChat: conv.estado_chat || 'consulta',
        };
      }));
      return enriched;
    } catch (err) { return []; }
  },

  // ============================================================
  // NOTIFICACIONES
  // ============================================================

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .eq('leida', false);
      if (error) return 0;
      return count || 0;
    } catch (e) {
      return 0;
    }
  },

  async getNotificaciones(userId: string): Promise<any[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error getNotificaciones:', e);
      return [];
    }
  },

  async marcarNotificacionLeida(notificacionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificacionId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error marcarNotificacionLeida:', e);
      return false;
    }
  },

  async crearNotificacion(notificacion: {
    usuario_id: string;
    tipo: 'trabajo' | 'mensaje' | 'sistema' | 'alerta';
    titulo: string;
    descripcion: string;
    referencia_id?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .insert(notificacion);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error crearNotificacion:', e);
      return false;
    }
  },

  async getAuditLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    } catch (e) {
      console.error('Error getAuditLogs:', e);
      return [];
    }
  },

  async registrarAuditoria(log: {
    admin_email: string;
    accion: string;
    riesgo: 'Bajo' | 'Medio' | 'Alto';
  }): Promise<boolean> {
    try {
      const { error } = await supabase.from('audit_logs').insert([{
        admin_email: log.admin_email,
        accion: log.accion,
        riesgo: log.riesgo
      }]);
      if (error) console.error('Error registrarAuditoria:', error);
      return !error;
    } catch (e) {
      console.error('Error registrarAuditoria:', e);
      return false;
    }
  },

  async notifyProfessionalsForJob(jobData: any): Promise<void> {
    try {
      // Find all professionals
      const { data: professionals, error } = await supabase
        .from('perfiles')
        .select('id, oficios, nombre')
        .eq('rol', 'profesional');
        
      if (error || !professionals) return;

      const categoryMatches = (oficios: any[]) => {
        if (!oficios || !Array.isArray(oficios)) return false;
        // Normalize strings for comparison
        const jobCat = jobData.categoria?.toLowerCase().trim() || '';
        return oficios.some(o => typeof o === 'string' && o.toLowerCase().trim() === jobCat);
      };

      const matchedPros = professionals.filter(p => categoryMatches(p.oficios));

      if (matchedPros.length > 0) {
        const notificationsToInsert = matchedPros.map(p => ({
          usuario_id: p.id,
          tipo: 'alerta',
          titulo: 'Nuevo trabajo en tu zona',
          descripcion: `Hay un nuevo trabajo de "${jobData.categoria}" en ${jobData.ciudad || 'tu zona'}: ${jobData.titulo}. ¡Enviá tu presupuesto!`,
          referencia_id: String(jobData.id || ''),
          leida: false
        }));

        await supabase.from('notificaciones').insert(notificationsToInsert);
      }
    } catch (e) {
      console.error('Error notifying professionals:', e);
    }
  },

  // ============================================================
  // MURO DE SERVICIOS — Presupuestos del Muro (presupuestos_muro)
  // ============================================================

  /**
   * Verifica si un profesional ya envió una oferta en un trabajo.
   * Retorna la oferta existente o null.
   */
  async getMiOfertaEnTrabajo(trabajoId: number | string, profesionalId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('presupuestos_muro')
        .select('*')
        .eq('trabajo_id', Number(trabajoId))
        .eq('profesional_id', profesionalId)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (e) {
      console.warn('Error getMiOfertaEnTrabajo:', e);
      return null;
    }
  },

  /**
   * Cuenta cuántos profesionales ofertaron en un trabajo.
   * No expone montos — solo el contador.
   */
  async getCountOfertasTrabajo(trabajoId: number | string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('presupuestos_muro')
        .select('*', { count: 'exact', head: true })
        .eq('trabajo_id', Number(trabajoId))
        .eq('estado', 'pendiente');
      if (error) throw error;
      return count || 0;
    } catch (e) {
      console.warn('Error getCountOfertasTrabajo:', e);
      return 0;
    }
  },

  /**
   * Envía una nueva oferta al Muro de Servicios.
   * Crea el registro y notifica al cliente.
   */
  async enviarOfertaMuro(oferta: {
    trabajo_id: number | string;
    profesional_id: string;
    cliente_id: string;
    monto: number;
    descripcion: string;
    tiempo_estimado?: string;
    materiales_incluidos?: boolean;
    garantia?: string;
    titulo_trabajo?: string;
  }): Promise<any> {
    // 1. Obtener o crear conversación entre cliente y profesional
    let conv = await dbHelper.getOrCreateConversation(oferta.cliente_id, oferta.profesional_id).catch(() => null);

    // 2. Insertar en presupuestos_muro
    const { data, error } = await supabase
      .from('presupuestos_muro')
      .insert([{
        trabajo_id: Number(oferta.trabajo_id),
        profesional_id: oferta.profesional_id,
        cliente_id: oferta.cliente_id,
        conversacion_id: conv?.id || null,
        monto: oferta.monto,
        descripcion: oferta.descripcion,
        tiempo_estimado: oferta.tiempo_estimado || '',
        materiales_incluidos: oferta.materiales_incluidos || false,
        garantia: oferta.garantia || 'sin_garantia',
        estado: 'pendiente',
        version: 1,
      }])
      .select()
      .single();
    if (error) throw error;

    // 3. Generar mensaje automático con tarjeta de presupuesto en la conversación
    if (conv?.id) {
      const cardPayload = JSON.stringify({
        tipo: 'presupuesto_card',
        presupuesto_id: data.id,
        profesional_id: oferta.profesional_id,
        monto: oferta.monto,
        detalle: oferta.descripcion,
        tiempo_estimado: oferta.tiempo_estimado || 'A convenir',
        garantia: oferta.garantia || 'sin_garantia',
        materiales_incluidos: oferta.materiales_incluidos || false,
        estado: 'pendiente'
      });

      try {
        await supabase.from('mensajes').insert([{
          conversacion_id: conv.id,
          emisor_id: oferta.profesional_id,
          receptor_id: oferta.cliente_id,
          texto: cardPayload,
          leido: false,
        }]);

        await supabase.from('conversaciones').update({
          ultimo_mensaje: `💰 Presupuesto de $${Number(oferta.monto).toLocaleString('es-AR')}: ${oferta.descripcion.substring(0, 60)}`,
          ultimo_mensaje_fecha: new Date().toISOString()
        }).eq('id', conv.id);
      } catch (e) {
        console.warn('Error al vincular mensaje de presupuesto en chat:', e);
      }
    }


    // Obtener nombre del profesional para notificación
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', oferta.profesional_id)
      .maybeSingle();
    const nombrePro = perfil?.nombre || 'Un profesional';

    // Notificar al cliente
    await supabase.from('notificaciones').insert([{
      usuario_id: oferta.cliente_id,
      tipo: 'presupuesto',
      titulo: '💰 Nueva oferta recibida',
      descripcion: `${nombrePro} te envió una oferta para "${oferta.titulo_trabajo || 'tu trabajo'}". ¡Revisá tus presupuestos!`,
      referencia_id: String(oferta.trabajo_id),
      leida: false,
    }]);

    return data;
  },

  /**
   * Edita la oferta existente de un profesional en un trabajo.
   * Incrementa la versión y notifica al cliente.
   */
  async editarOfertaMuro(ofertaId: string, updates: {
    monto?: number;
    descripcion?: string;
    tiempo_estimado?: string;
    materiales_incluidos?: boolean;
    garantia?: string;
    cliente_id?: string;
    titulo_trabajo?: string;
    profesional_nombre?: string;
  }): Promise<any> {
    // Primero obtenemos la versión actual
    const { data: actual } = await supabase
      .from('presupuestos_muro')
      .select('version, trabajo_id')
      .eq('id', ofertaId)
      .maybeSingle();

    const versionActual = actual?.version || 1;

    const { data, error } = await supabase
      .from('presupuestos_muro')
      .update({
        monto: updates.monto,
        descripcion: updates.descripcion,
        tiempo_estimado: updates.tiempo_estimado,
        materiales_incluidos: updates.materiales_incluidos,
        garantia: updates.garantia,
        version: versionActual + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ofertaId)
      .select()
      .single();
    if (error) throw error;

    // Notificar al cliente que hubo una actualización
    if (updates.cliente_id) {
      await supabase.from('notificaciones').insert([{
        usuario_id: updates.cliente_id,
        tipo: 'presupuesto',
        titulo: '🔄 Oferta actualizada',
        descripcion: `${updates.profesional_nombre || 'Un profesional'} actualizó su oferta para "${updates.titulo_trabajo || 'tu trabajo'}". Revisá los nuevos detalles.`,
        referencia_id: String(actual?.trabajo_id || ''),
        leida: false,
      }]);
    }

    return data;
  },

  /**
   * Obtiene todos los presupuestos del Muro para un trabajo específico.
   * Solo el cliente dueño puede ver todos los montos.
   * Incluye perfil del profesional.
   */
  async getPresupuestosMuroByTrabajo(trabajoId: number | string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('presupuestos_muro')
        .select('*, profesional:perfiles!presupuestos_muro_profesional_id_fkey(id, nombre, foto_perfil, oficios, provincia, ciudad, verificado, rating, total_resenas)')
        .eq('trabajo_id', Number(trabajoId))
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        trabajoId: p.trabajo_id,
        profesionalId: p.profesional_id,
        clienteId: p.cliente_id,
        conversacionId: p.conversacion_id || null,
        monto: p.monto,
        descripcion: p.descripcion,
        tiempoEstimado: p.tiempo_estimado,
        materialesIncluidos: p.materiales_incluidos,
        garantia: p.garantia,
        estado: p.estado,
        version: p.version,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        profesional: {
          id: p.profesional?.id,
          nombre: p.profesional?.nombre || 'Profesional',
          fotoPerfil: p.profesional?.foto_perfil || '',
          oficios: p.profesional?.oficios || [],
          provincia: p.profesional?.provincia || '',
          ciudad: p.profesional?.ciudad || '',
          verificado: p.profesional?.verificado || false,
          rating: p.profesional?.rating || 0,
          totalResenas: Number(p.profesional?.total_resenas) || 0,
        },
      }));
    } catch (e) {
      console.warn('Error getPresupuestosMuroByTrabajo:', e);
      return [];
    }
  },

  /**
   * Adjudica un trabajo a un profesional.
   * Flujo completo:
   * 1. Marca el presupuesto elegido como 'aceptado'
   * 2. Rechaza los demás presupuestos del mismo trabajo
   * 3. Actualiza el estado del trabajo a 'adjudicado'
   * 4. Crea una Orden de Trabajo automáticamente
   * 5. Notifica al profesional ganador
   * 6. Notifica a los demás profesionales que el trabajo fue adjudicado
   */
  async adjudicarTrabajo({
    trabajoId,
    presupuestoId,
    profesionalId,
    clienteId,
    tituloTrabajo,
    monto,
    garantia,
  }: {
    trabajoId: number | string;
    presupuestoId: string;
    profesionalId: string;
    clienteId: string;
    tituloTrabajo: string;
    monto: number;
    garantia?: string;
  }): Promise<{ ordenId: string }> {
    // 1. Marcar presupuesto seleccionado como aceptado
    await supabase
      .from('presupuestos_muro')
      .update({ estado: 'aceptado' })
      .eq('id', presupuestoId);

    // 2. Rechazar todos los demás presupuestos del mismo trabajo
    await supabase
      .from('presupuestos_muro')
      .update({ estado: 'rechazado' })
      .eq('trabajo_id', Number(trabajoId))
      .neq('id', presupuestoId);

    // 3. Actualizar estado del trabajo a 'adjudicado'
    await supabase
      .from('trabajos')
      .update({
        estado: 'adjudicado',
        profesional_adjudicado_id: profesionalId,
      })
      .eq('id', trabajoId);

    // 4. Crear Orden de Trabajo
    const orden = await dbHelper.createOrdenTrabajo({
      profesional_id: profesionalId,
      cliente_id: clienteId,
      titulo: tituloTrabajo,
      descripcion: `Trabajo adjudicado desde el Muro de Servicios`,
      garantia: garantia || 'sin_garantia',
      monto,
    });

    // 5. Notificar al profesional ganador
    await supabase.from('notificaciones').insert([{
      usuario_id: profesionalId,
      tipo: 'trabajo',
      titulo: '🎉 ¡Te eligieron!',
      descripcion: `El cliente aceptó tu presupuesto para "${tituloTrabajo}". Se generó una Orden de Trabajo. ¡Coordiná los detalles!`,
      referencia_id: String(trabajoId),
      leida: false,
    }]);

    // 6. Notificar a los demás profesionales
    const { data: rechazados } = await supabase
      .from('presupuestos_muro')
      .select('profesional_id')
      .eq('trabajo_id', Number(trabajoId))
      .eq('estado', 'rechazado');

    if (rechazados && rechazados.length > 0) {
      const notifs = rechazados.map((r: any) => ({
        usuario_id: r.profesional_id,
        tipo: 'alerta',
        titulo: 'Trabajo adjudicado',
        descripcion: `El trabajo "${tituloTrabajo}" fue adjudicado a otro profesional.`,
        referencia_id: String(trabajoId),
        leida: false,
      }));
      await supabase.from('notificaciones').insert(notifs);
    }

    return { ordenId: orden.id };
  },

  /**
   * Obtiene presupuestos del Muro enviados por un profesional.
   * Para el panel del profesional.
   */
  async getPresupuestosEnviadosMuro(profesionalId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('presupuestos_muro')
        .select('*, trabajo:trabajos!presupuestos_muro_trabajo_id_fkey(id, titulo, categoria, estado)')
        .eq('profesional_id', profesionalId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Error getPresupuestosEnviadosMuro:', e);
      return [];
    }
  },

  /**
   * El cliente descarta/rechaza un presupuesto del Muro desde su vista.
   * Cambia estado a 'rechazado' y notifica al profesional.
   */
  async descartarOfertaMuro(presupuestoId: string, clienteId: string, tituloTrabajo?: string): Promise<void> {
    // Obtener datos antes de actualizar para notificar
    const { data: pres } = await supabase
      .from('presupuestos_muro')
      .select('profesional_id, monto, trabajo_id')
      .eq('id', presupuestoId)
      .eq('cliente_id', clienteId) // seguridad: solo el cliente dueño
      .maybeSingle();

    const { error } = await supabase
      .from('presupuestos_muro')
      .update({ estado: 'rechazado' })
      .eq('id', presupuestoId)
      .eq('cliente_id', clienteId);

    if (error) throw error;

    // Notificar al profesional
    if (pres?.profesional_id) {
      await supabase.from('notificaciones').insert([{
        usuario_id: pres.profesional_id,
        tipo: 'alerta',
        titulo: 'Oferta descartada',
        descripcion: `Tu oferta${tituloTrabajo ? ` para "${tituloTrabajo}"` : ''} no fue seleccionada por el cliente.`,
        referencia_id: String(pres.trabajo_id || ''),
        leida: false,
      }]);
    }
  },

  logout,
};
