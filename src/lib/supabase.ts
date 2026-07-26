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
  'gonzalo@gmail.com'
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

  const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).maybeSingle();
  
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
      rating: 5.0,
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

  async getUserProfile(id: string): Promise<any> {
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.nombre,
      nombre: data.nombre,
      email: data.email,
      role: isEmailAdmin(data.email) || data.rol === 'admin' ? 'Admin' : (data.rol === 'profesional' ? 'Profesional' : 'Cliente'),
      rol: isEmailAdmin(data.email) ? 'admin' : data.rol,
      plan: data.plan || 'Gratis',
      status: 'Activo',
      date: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Reciente',
      verificacion: data.verificado ? 'Verificado' : (data.rol === 'profesional' ? 'Pendiente' : 'Sin Solicitud'),
      trade: data.oficios && data.oficios.length > 0 ? data.oficios.join(', ') : '',
      rating: 5.0,
      docMatricula: '-',
      avatar: data.foto_perfil || 'https://i.pravatar.cc/150?u=' + data.id,
      fotoPerfil: data.foto_perfil || '',
      location: data.ciudad && data.provincia ? `${data.ciudad}, ${data.provincia}` : (data.provincia || ''),
      category: data.oficios && data.oficios.length > 0 ? data.oficios[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '',
      experiencia: data.experiencia || '',
      biografia: data.biografia || '',
      montoMinimo: data.monto_minimo || '',
      telefono: data.telefono || '',
      provincia: data.provincia || '',
      ciudad: data.ciudad || '',
      oficios: data.oficios || [],
    };
  },

  async updateUserPlan(id: string, plan: string): Promise<void> {
    const { error } = await supabase.from('perfiles').update({ plan }).eq('id', id);
    if (error) throw error;
  },

  async updateUserVerification(id: string, verificado: boolean, estadoDni?: string): Promise<void> {
    const updates: any = { verificado };
    if (estadoDni) {
      updates.estado_dni = estadoDni;
    }
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
    if (updates.biografia !== undefined) dbUpdates.biografia = updates.biografia;
    if (updates.experiencia !== undefined) dbUpdates.experiencia = updates.experiencia;
    if (updates.foto_perfil !== undefined) dbUpdates.foto_perfil = updates.foto_perfil;
    if (updates.oficios !== undefined) dbUpdates.oficios = updates.oficios;
    if (updates.monto_minimo !== undefined) dbUpdates.monto_minimo = updates.monto_minimo;
    
    const { error } = await supabase.from('perfiles').update(dbUpdates).eq('id', id);
    if (error) throw error;
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
      const { error: profileError } = await supabase.from('perfiles').insert([{
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

  async registerProfesional(fullName: string, email: string, phone: string, password: string, oficios: string[], provincia?: string, ciudad?: string): Promise<any> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase.from('perfiles').insert([{
        id: data.user.id,
        nombre: fullName,
        email,
        telefono: phone,
        oficios,
        rol: 'profesional',
        provincia: provincia || '',
        ciudad: ciudad || '',
      }]);
      if (profileError) throw profileError;

      const profileData = {
        id: data.user.id,
        nombre: fullName,
        email,
        telefono: phone,
        oficios,
        rol: 'profesional',
        fotoPerfil: '',
        provincia: provincia || '',
        ciudad: ciudad || '',
      };
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(profileData));
      localStorage.setItem('oficiosya_session', JSON.stringify(profileData));
    }
    return data;
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
    const dbJob = {
      ...job,
      empleadoravatar: job.empleadorAvatar
    };
    delete dbJob.empleadorAvatar;
    if (!dbJob.id) {
      dbJob.id = Date.now();
    }

    const { data, error } = await supabase.from('trabajos').insert([dbJob]).select().single();
    if (error) throw error;
    return data;
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
    return data || [];
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
      candidatoavatar: postulacion.candidatoAvatar,
      candidatooficio: postulacion.candidatoOficio
    };
    delete dbPostulacion.idPostulacion;
    delete dbPostulacion.empleoId;
    delete dbPostulacion.candidatoAvatar;
    delete dbPostulacion.candidatoOficio;

    const { data, error } = await supabase.from('postulaciones').insert([dbPostulacion]).select().single();
    if (error) throw error;
    return data;
  },

  async getMisPostulaciones(candidatoName: string): Promise<any[]> {
    const { data, error } = await supabase.from('postulaciones').select('*').eq('candidato', candidatoName).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
      .order('created_at', { ascending: true });

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

    // Update last message on conversation
    await supabase
      .from('conversaciones')
      .update({
        ultimo_mensaje: texto.substring(0, 100),
        ultimo_mensaje_fecha: new Date().toISOString(),
      })
      .eq('id', conversacionId);

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

  logout,
};
