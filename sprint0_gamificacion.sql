-- Puntos, logros y visitas de perfil: el código (registrarPuntos,
-- desbloquearLogro, getLogros, getOrCreatePuntosProfesional,
-- getEstadisticasPerfil, getActividadReciente) ya estaba bien escrito,
-- pero ninguna de estas 4 tablas se había creado nunca.

CREATE TABLE IF NOT EXISTS public.puntos_profesional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL UNIQUE REFERENCES public.perfiles(id) ON DELETE CASCADE,
  puntos_totales NUMERIC NOT NULL DEFAULT 0,
  puntos_canjeados NUMERIC NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT 'Bronce',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transacciones_puntos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  accion TEXT NOT NULL,
  puntos NUMERIC NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.logros_profesional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  desbloqueado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  visitante_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.puntos_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puntos_all" ON public.puntos_profesional FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.transacciones_puntos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transacciones_all" ON public.transacciones_puntos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.logros_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logros_all" ON public.logros_profesional FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Insert abierto a cualquiera (incluso sin sesión): un visitante anónimo
-- de /profesional/[id] también tiene que poder generar una vista.
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ProfileViews_select" ON public.profile_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ProfileViews_insert" ON public.profile_views FOR INSERT WITH CHECK (true);
