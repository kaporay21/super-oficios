-- Bug: el envío de "Notificaciones Masivas" del admin sí insertaba
-- notificaciones reales, pero el historial que ve el admin vivía solo en
-- useState y se vaciaba en cada recarga de página.
CREATE TABLE IF NOT EXISTS public.campanas_masivas_historial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  destinatarios TEXT NOT NULL,
  enviados INTEGER NOT NULL DEFAULT 0,
  admin_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.campanas_masivas_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CampanasMasivasHistorial_all" ON public.campanas_masivas_historial FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
