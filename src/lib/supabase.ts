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

// Email del administrador
const ADMIN_EMAIL = 'gonzalohumacata1992@gmail.com';

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

  const { data, error } = await supabase.from('perfiles').select('*').eq('id', user.id).single();
  if (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
  return data;
}

/**
 * Verifica si el usuario actual es administrador.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
}

/**
 * Cierra sesión completa: Supabase Auth + limpieza de localStorage.
 */
export async function logout() {
  await supabase.auth.signOut();
  clearAllLocalData();
}

/**
 * Limpia todos los datos de oficiosya en localStorage.
 */
export function clearAllLocalData() {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    'oficiosya_session',
    'oficiosya_cliente_perfil',
    'oficiosya_profesional_perfil',
    'oficiosya_profiles',
    'oficiosya_admin_users',
    'oficiosya_resenas',
    'oficiosya_muro_jobs',
    'oficiosya_empleos',
    'oficiosya_postulaciones',
    'oficiosya_tickets',
    'oficiosya_clientes_v2',
    'oficiosya_obras_v2',
    'oficiosya_presupuestos_guardados',
    'oficiosya_user_notifications',
    'oficiosya_trabajos_activos',
    'oficiosya_calendar_notes',
    'show_confetti',
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// ============================================================
// DB HELPER — Solo Supabase (sin modo mock)
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
      role: p.rol === 'profesional' ? 'Profesional' : 'Cliente',
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
      rol: p.rol,
    }));
  },

  async getUserProfile(id: string): Promise<any> {
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', id).single();
    if (error) return null;
    if (!data) return null;
    return {
      id: data.id,
      name: data.nombre,
      nombre: data.nombre,
      email: data.email,
      role: data.rol === 'profesional' ? 'Profesional' : 'Cliente',
      rol: data.rol,
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
    // Status tracking - could be added to perfiles table if needed
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

  // --- AUTHENTICATION ---
  async login(email: string, password: string): Promise<any> {
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Auto-crear usuario administrador en Supabase Auth la primera vez que inicia sesión
    if (error && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre: 'Gonzalo Humacata', rol: 'admin' }
          }
        });

        if (!signUpErr && signUpData.user) {
          // Crear perfil admin en la tabla 'perfiles'
          await supabase.from('perfiles').upsert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            nombre: 'Gonzalo Humacata',
            rol: 'admin',
            verificado: true
          });

          // Reintentar inicio de sesión
          const retrySignIn = await supabase.auth.signInWithPassword({ email, password });
          if (retrySignIn.data && retrySignIn.data.user) {
            data = retrySignIn.data;
            error = null;
          } else if (signUpData.session) {
            data = { user: signUpData.user, session: signUpData.session };
            error = null;
          }
        }
      } catch (provisionErr) {
        console.error("Error al auto-provisionar admin:", provisionErr);
      }
    }

    if (error) throw error;
    
    // Fetch profile from perfiles table
    let { data: profile } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single();
    
    // Si no existe perfil en la tabla 'perfiles' (por ejemplo para el admin), crearlo automáticamente
    if (!profile && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const adminProfile = {
        id: data.user.id,
        email: data.user.email,
        nombre: 'Gonzalo Humacata',
        rol: 'admin',
        verificado: true
      };
      await supabase.from('perfiles').upsert(adminProfile);
      profile = adminProfile;
    }
    
    // Store profile in localStorage for backward compatibility
    if (profile) {
      const profileData = {
        id: profile.id,
        nombre: profile.nombre,
        email: profile.email,
        telefono: profile.telefono,
        rol: profile.rol,
        oficios: profile.oficios || [],
        fotoPerfil: profile.foto_perfil || '',
        provincia: profile.provincia || '',
        ciudad: profile.ciudad || '',
        biografia: profile.biografia || '',
        experiencia: profile.experiencia || '',
        plan: profile.plan || 'Gratis',
        verificado: profile.verificado || false,
      };
      
      if (profile.rol === 'profesional') {
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(profileData));
        localStorage.removeItem('oficiosya_cliente_perfil');
      } else {
        localStorage.setItem('oficiosya_cliente_perfil', JSON.stringify(profileData));
        localStorage.removeItem('oficiosya_profesional_perfil');
      }
      localStorage.setItem('oficiosya_session', JSON.stringify(profileData));
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
      console.error('Error buscando conversación:', searchError);
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
    const { data, error } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`usuario1_id.eq.${userId},usuario2_id.eq.${userId}`)
      .order('ultimo_mensaje_fecha', { ascending: false });

    if (error) {
      console.error('Error al cargar conversaciones:', error);
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
  },

  /**
   * Obtiene los mensajes de una conversación.
   */
  async getMensajes(conversacionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al cargar mensajes:', error);
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
    
    const tables = [
      'mensajes',
      'conversaciones',
      'reviews',
      'postulaciones',
      'trabajos',
      'tickets_soporte',
      'clientes',
      'obras',
      'presupuestos',
      // perfiles se borra al final porque tiene foreign keys
      'perfiles',
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).delete().neq('id', '___never_match___');
        if (error) {
          errors.push(`${table}: ${error.message}`);
        }
      } catch (err: any) {
        errors.push(`${table}: ${err.message}`);
      }
    }

    // Also clean localStorage
    clearAllLocalData();

    return { success: errors.length === 0, errors };
  },

  logout,
};
