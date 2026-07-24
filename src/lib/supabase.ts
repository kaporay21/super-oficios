import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Advertencia: Las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas en el archivo .env.local. La aplicación usará datos locales simulados (localStorage) hasta que se conecte un proyecto de Supabase activo.'
  );
}

// Inicialización del cliente de Supabase
export const supabase = createClient(supabaseUrl || 'https://tu-proyecto.supabase.co', supabaseAnonKey || 'public-anon-key');

const isMock = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('tu-proyecto');

// Función auxiliar para emitir notificaciones simuladas
const emitirNotificacion = (notif: any) => {
  if (typeof window !== 'undefined') {
    const stored = JSON.parse(localStorage.getItem('oficiosya_user_notifications') || '[]');
    stored.unshift({ id: Date.now(), leida: false, tiempo: 'Ahora', ...notif });
    localStorage.setItem('oficiosya_user_notifications', JSON.stringify(stored));
  }
};

/**
 * Helper de base de datos para la transición progresiva de Mock a Supabase
 * Si las credenciales no están configuradas, el Helper automáticamente recurre al localStorage.
 */
export const dbHelper = {
  // --- USERS / PROFILES ---
  async getAllUsers(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_admin_users') || '[]');
    }
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
      rating: 5.0, // placeholder
      docMatricula: '-',
      avatar: p.foto_perfil || 'https://i.pravatar.cc/150?u=' + p.id,
      location: p.ciudad && p.provincia ? `${p.ciudad}, ${p.provincia}` : (p.provincia || 'Tucumán'),
      category: p.oficios && p.oficios.length > 0 ? p.oficios[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''
    }));
  },

  async getUserProfile(id: string): Promise<any> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_admin_users') || '[]');
      const user = stored.find((u: any) => u.id === id);
      if (!user) return null;
      // Add placeholders for description/experience if not present
      return {
        ...user,
        experiencia: user.experiencia || 'Más de 5 años en el rubro',
        biografia: user.biografia || 'Compromiso y puntualidad.',
        montoMinimo: user.montoMinimo || '10000'
      };
    }
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', id).single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.nombre,
      email: data.email,
      role: data.rol === 'profesional' ? 'Profesional' : 'Cliente',
      plan: data.plan || 'Gratis',
      status: 'Activo',
      date: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Reciente',
      verificacion: data.verificado ? 'Verificado' : (data.rol === 'profesional' ? 'Pendiente' : 'Sin Solicitud'),
      trade: data.oficios && data.oficios.length > 0 ? data.oficios.join(', ') : '',
      rating: 5.0, // placeholder
      docMatricula: '-',
      avatar: data.foto_perfil || 'https://i.pravatar.cc/150?u=' + data.id,
      location: data.ciudad && data.provincia ? `${data.ciudad}, ${data.provincia}` : (data.provincia || 'Tucumán'),
      category: data.oficios && data.oficios.length > 0 ? data.oficios[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '',
      experiencia: data.experiencia || 'Más de 5 años en el rubro',
      biografia: data.biografia || 'Compromiso y puntualidad.',
      montoMinimo: data.monto_minimo || '10000'
    };
  },

  async updateUserPlan(id: string, plan: string): Promise<void> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_admin_users') || '[]');
      const updated = stored.map((u: any) => u.id === id ? { ...u, plan } : u);
      localStorage.setItem('oficiosya_admin_users', JSON.stringify(updated));
      return;
    }
    const { error } = await supabase.from('perfiles').update({ plan }).eq('id', id);
    if (error) throw error;
  },

  async updateUserVerification(id: string, verificado: boolean, estadoDni?: string): Promise<void> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_admin_users') || '[]');
      const updated = stored.map((u: any) => u.id === id ? { ...u, verificacion: verificado ? 'Verificado' : 'Rechazado' } : u);
      localStorage.setItem('oficiosya_admin_users', JSON.stringify(updated));
      return;
    }
    const updates: any = { verificado };
    if (estadoDni) {
      updates.estado_dni = estadoDni;
    }
    const { error } = await supabase.from('perfiles').update(updates).eq('id', id);
    if (error) throw error;
  },

  async updateUserStatus(id: string, status: string): Promise<void> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_admin_users') || '[]');
      const updated = stored.map((u: any) => u.id === id ? { ...u, status } : u);
      localStorage.setItem('oficiosya_admin_users', JSON.stringify(updated));
    }
  },

  async deleteJob(id: number | string): Promise<void> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_empleos') || '[]');
      const filtered = stored.filter((j: any) => j.id !== id);
      localStorage.setItem('oficiosya_empleos', JSON.stringify(filtered));
      
      const storedMuro = JSON.parse(localStorage.getItem('oficiosya_muro_jobs') || '[]');
      const filteredMuro = storedMuro.filter((j: any) => j.id !== id);
      localStorage.setItem('oficiosya_muro_jobs', JSON.stringify(filteredMuro));
      return;
    }
    const { error } = await supabase.from('trabajos').delete().eq('id', id);
    if (error) throw error;
  },


  // --- AUTHENTICATION ---
  async login(email: string, password: string): Promise<any> {
    if (isMock) {
      const storedProfiles = JSON.parse(localStorage.getItem('oficiosya_profiles') || '[]');
      const user = storedProfiles.find((p: any) => p.email === email && p.password === password);
      if (!user) throw new Error("Credenciales inválidas");
      
      // Simulate login session
      localStorage.setItem('oficiosya_session', JSON.stringify(user));
      
      // Update specific legacy variables for backwards compatibility during mock
      if (user.rol === 'profesional') {
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(user));
      } else {
        localStorage.setItem('oficiosya_cliente_perfil', JSON.stringify(user));
      }
      return { user };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Fetch profile
    const { data: profile } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single();
    return { user: data.user, profile };
  },

  async registerCliente(fullName: string, email: string, phone: string, password: string): Promise<any> {
    if (isMock) {
      const newUser = { id: Date.now().toString(), nombre: fullName, email, telefono: phone, password, rol: 'cliente' };
      const storedProfiles = JSON.parse(localStorage.getItem('oficiosya_profiles') || '[]');
      if (storedProfiles.some((p: any) => p.email === email)) throw new Error("El correo ya está registrado");
      storedProfiles.push(newUser);
      localStorage.setItem('oficiosya_profiles', JSON.stringify(storedProfiles));
      localStorage.setItem('oficiosya_session', JSON.stringify(newUser));
      localStorage.setItem('oficiosya_cliente_perfil', JSON.stringify(newUser));
      return { user: newUser };
    }
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.user) {
      await supabase.from('perfiles').insert([{ id: data.user.id, nombre: fullName, email, telefono: phone, rol: 'cliente' }]);
    }
    return data;
  },

  async registerProfesional(fullName: string, email: string, phone: string, password: string, oficios: string[]): Promise<any> {
    if (isMock) {
      const newUser = { id: Date.now().toString(), nombre: fullName, email, telefono: phone, password, oficios, rol: 'profesional', fotoPerfil: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJFksOrbm_vwGQaTq5Vuqr1acUBEH2jxptCR5CusLDf2Sb5qZ8fqxqznYXUigT9dEfKpCENJlHaLhC_WoPDhEQJYKRkRbxGiFrH2Jf4hrRkaq4pffxxwX2ietvZfajbBEyvOb665wnkChMjc88JXD3dUq70dprcIy22fOVZalBnuC390ApdZb18RNQjeSD56KQnd4KnVj3W9Vf6W_rfyL2JkZDhnRQLKr0smIh2slCZIjrr0crl5Ri-6h1zRMK70Hxc9PXqDijgpuj' };
      const storedProfiles = JSON.parse(localStorage.getItem('oficiosya_profiles') || '[]');
      if (storedProfiles.some((p: any) => p.email === email)) throw new Error("El correo ya está registrado");
      storedProfiles.push(newUser);
      localStorage.setItem('oficiosya_profiles', JSON.stringify(storedProfiles));
      localStorage.setItem('oficiosya_session', JSON.stringify(newUser));
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(newUser));
      return { user: newUser };
    }
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data.user) {
      await supabase.from('perfiles').insert([{ id: data.user.id, nombre: fullName, email, telefono: phone, oficios, rol: 'profesional' }]);
    }
    return data;
  },

  // --- TICKETS ---
  async getTickets(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_tickets') || '[]');
    }
    const { data, error } = await supabase.from('tickets_soporte').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createTicket(ticket: any): Promise<any> {
    if (isMock) {
      const nuevoTicket = { id: Date.now().toString(), ...ticket, estado: 'Pendiente', fecha: new Date().toLocaleDateString('es-AR') };
      const stored = JSON.parse(localStorage.getItem('oficiosya_tickets') || '[]');
      stored.unshift(nuevoTicket);
      localStorage.setItem('oficiosya_tickets', JSON.stringify(stored));
      return nuevoTicket;
    }
    
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
    if (isMock) {
      const mural = JSON.parse(localStorage.getItem('oficiosya_muro_jobs') || '[]');
      const empleos = JSON.parse(localStorage.getItem('oficiosya_empleos') || '[]');
      return [...empleos, ...mural];
    }
    const { data, error } = await supabase.from('trabajos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllPostulaciones(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
    }
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

  async createJob(job: any): Promise<any> {
    if (isMock) {
      const nuevoTrabajo = { id: Date.now(), ...job, tiempo: 'Reciente', reportes: 0, fecha: new Date().toISOString() };
      
      // Guardar una versión sin la imagen base64 en localStorage para evitar QuotaExceededError
      const trabajoParaGuardar = { ...nuevoTrabajo };
      if (trabajoParaGuardar.imagen && typeof trabajoParaGuardar.imagen === 'string' && trabajoParaGuardar.imagen.startsWith('data:')) {
        trabajoParaGuardar.imagen = '[imagen adjunta]'; // Placeholder para no saturar localStorage
      }
      
      try {
        const stored = JSON.parse(localStorage.getItem('oficiosya_empleos') || '[]');
        stored.unshift(trabajoParaGuardar);
        localStorage.setItem('oficiosya_empleos', JSON.stringify(stored));
      } catch (storageError) {
        console.warn('localStorage lleno, guardando sin historial previo:', storageError);
        localStorage.setItem('oficiosya_empleos', JSON.stringify([trabajoParaGuardar]));
      }
      
      // Emitir notificación para profesionales
      emitirNotificacion({
        tipo: 'trabajo',
        titulo: `Nuevo trabajo publicado: ${job.titulo || job.title}`,
        descripcion: `Una nueva solicitud ha sido publicada en tu zona por ${job.empleador}.`
      });
      
      return nuevoTrabajo;
    }
    
    // Convert camelCase properties to lowercase for PostgreSQL compatibility
    const dbJob = {
      ...job,
      empleadoravatar: job.empleadorAvatar
    };
    delete dbJob.empleadorAvatar;
    // ensure id exists
    if (!dbJob.id) {
      dbJob.id = Date.now();
    }

    const { data, error } = await supabase.from('trabajos').insert([dbJob]).select().single();
    if (error) throw error;

    emitirNotificacion({
      tipo: 'trabajo',
      titulo: `Nuevo trabajo publicado: ${job.titulo || job.title}`,
      descripcion: `Una nueva solicitud ha sido publicada en tu zona por ${job.empleador}.`
    });

    return data;
  },

  // --- POSTULACIONES ---
  async getPostulaciones(empleadorName: string): Promise<any[]> {
    if (isMock) {
      const todasPostulaciones = JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
      return todasPostulaciones.filter((p: any) => p.empleador === empleadorName);
    }
    const { data, error } = await supabase.from('postulaciones').select('*').eq('empleador', empleadorName);
    if (error) throw error;
    return data || [];
  },

  async updatePostulacion(id: number | string, nuevoEstado: string, empleadorName: string): Promise<void> {
    if (isMock) {
      const storedPost = JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
      const actualizadas = storedPost.map((p: any) => 
        (p.idPostulacion === id || p.empleoId === id) && p.empleador === empleadorName
          ? { ...p, estado: nuevoEstado }
          : p
      );
      localStorage.setItem('oficiosya_postulaciones', JSON.stringify(actualizadas));
      return;
    }
    const { error } = await supabase.from('postulaciones').update({ estado: nuevoEstado }).eq('id', id);
    if (error) throw error;
  },

  async createPostulacion(postulacion: any): Promise<any> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
      stored.push(postulacion);
      localStorage.setItem('oficiosya_postulaciones', JSON.stringify(stored));
      
      // Emitir notificación para el cliente
      emitirNotificacion({
        tipo: 'mensaje',
        titulo: `¡Nueva postulación recibida!`,
        descripcion: `${postulacion.candidato} se ha postulado para realizar tu trabajo.`
      });
      
      return postulacion;
    }
    
    // Convert camelCase properties to lowercase for PostgreSQL compatibility
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

    emitirNotificacion({
      tipo: 'mensaje',
      titulo: `¡Nueva postulación recibida!`,
      descripcion: `${postulacion.candidato} se ha postulado para realizar tu trabajo.`
    });

    return data;
  },

  async getMisPostulaciones(candidatoName: string): Promise<any[]> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
      return stored.filter((p: any) => p.candidato === candidatoName);
    }
    const { data, error } = await supabase.from('postulaciones').select('*').eq('candidato', candidatoName).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async deletePostulacion(empleoId: number | string, candidatoName: string): Promise<void> {
    if (isMock) {
      const stored = JSON.parse(localStorage.getItem('oficiosya_postulaciones') || '[]');
      const filtered = stored.filter((p: any) => !(p.empleoId === empleoId && p.candidato === candidatoName));
      localStorage.setItem('oficiosya_postulaciones', JSON.stringify(filtered));
      return;
    }
    const { error } = await supabase.from('postulaciones').delete().match({ empleoId: empleoId, candidato: candidatoName });
    if (error) throw error;
  },

  // --- REVIEWS ---
  async getReviewsForProfessional(professionalId: string): Promise<any[]> {
    if (isMock) {
      const allReviews = JSON.parse(localStorage.getItem('oficiosya_resenas') || '[]');
      return allReviews.filter((r: any) => r.profesionalId === professionalId || r.professional_id === professionalId);
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map to application format
    return (data || []).map(r => ({
      id: r.id,
      profesionalId: r.professional_id,
      clienteNombre: r.client_name,
      clienteAvatar: 'https://i.pravatar.cc/150?u=' + r.client_name, // default placeholder avatar
      rating: r.rating,
      texto: r.review_text,
      trabajoTitulo: 'Servicio realizado',
      fecha: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  },

  async createReview(review: { professional_id: string; job_id: number | string; client_name: string; rating: number; review_text: string }): Promise<void> {
    if (isMock) {
      const allReviews = JSON.parse(localStorage.getItem('oficiosya_resenas') || '[]');
      const newReview = {
        id: `resena_${Date.now()}`,
        profesionalId: review.professional_id,
        clienteNombre: review.client_name,
        clienteAvatar: 'https://i.pravatar.cc/150?u=' + review.client_name,
        rating: review.rating,
        texto: review.review_text,
        trabajoTitulo: 'Servicio realizado',
        fecha: new Date().toISOString().split('T')[0]
      };
      allReviews.push(newReview);
      localStorage.setItem('oficiosya_resenas', JSON.stringify(allReviews));
      return;
    }
    const { error } = await supabase.from('reviews').insert([review]);
    if (error) throw error;
  },

  // --- CLIENTES (CRM) ---
  async getClientes(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
    }
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
      return JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
    }
  },

  async saveCliente(cliente: any): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
    const exists = stored.some((c: any) => c.id === cliente.id);
    const updated = exists ? stored.map((c: any) => c.id === cliente.id ? cliente : c) : [cliente, ...stored];
    localStorage.setItem('oficiosya_clientes_v2', JSON.stringify(updated));

    if (!isMock) {
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
    }
  },

  async deleteCliente(id: string): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_clientes_v2') || '[]');
    localStorage.setItem('oficiosya_clientes_v2', JSON.stringify(stored.filter((c: any) => c.id !== id)));

    if (!isMock) {
      try {
        await supabase.from('clientes').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting cliente from Supabase:', err);
      }
    }
  },

  // --- OBRAS (CRM) ---
  async getObras(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
    }
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
      return JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
    }
  },

  async saveObra(obra: any): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
    const exists = stored.some((o: any) => o.id === obra.id);
    const updated = exists ? stored.map((o: any) => o.id === obra.id ? obra : o) : [obra, ...stored];
    localStorage.setItem('oficiosya_obras_v2', JSON.stringify(updated));

    if (!isMock) {
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
    }
  },

  async deleteObra(id: string): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
    localStorage.setItem('oficiosya_obras_v2', JSON.stringify(stored.filter((o: any) => o.id !== id)));

    if (!isMock) {
      try {
        await supabase.from('obras').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting obra from Supabase:', err);
      }
    }
  },

  // --- PRESUPUESTOS ---
  async getPresupuestos(): Promise<any[]> {
    if (isMock) {
      return JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
    }
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
      return JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
    }
  },

  async savePresupuesto(presupuesto: any): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
    const exists = stored.some((p: any) => p.id === presupuesto.id);
    const updated = exists ? stored.map((p: any) => p.id === presupuesto.id ? presupuesto : p) : [presupuesto, ...stored];
    localStorage.setItem('oficiosya_presupuestos_guardados', JSON.stringify(updated));

    if (!isMock) {
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
    }
  },

  async deletePresupuesto(id: string): Promise<void> {
    const stored = JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
    localStorage.setItem('oficiosya_presupuestos_guardados', JSON.stringify(stored.filter((p: any) => p.id !== id)));

    if (!isMock) {
      try {
        await supabase.from('presupuestos').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting presupuesto from Supabase:', err);
      }
    }
  }
};
