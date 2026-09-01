-- Favoritos: el cliente guarda profesionales para volver a encontrarlos
-- rápido, sin buscar de nuevo (patrón "guardar/favoritos" de TaskRabbit).
CREATE TABLE IF NOT EXISTS public.favoritos_profesional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(cliente_id, profesional_id)
);
ALTER TABLE public.favoritos_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FavoritosProfesional_all" ON public.favoritos_profesional FOR ALL USING (auth.uid() = cliente_id) WITH CHECK (auth.uid() = cliente_id);
