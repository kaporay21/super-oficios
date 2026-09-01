-- El sistema de "Reseñas Inteligentes" (puntualidad, resolvió el problema,
-- dejó limpio, volvería a contratar) ya estaba implementado en el código
-- (createResenaInteligente, getResenasProfesional, puedeDejarResena,
-- calcularIndiceConfianza) pero la tabla nunca se creó -- por eso ninguna
-- reseña se podía guardar y el Índice de Confianza siempre calculaba el
-- puntaje de "rating" en 0.

CREATE TABLE IF NOT EXISTS public.resenas_inteligentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_trabajo_id UUID REFERENCES public.ordenes_trabajo(id) ON DELETE SET NULL,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  puntualidad NUMERIC NOT NULL,
  resolvio_problema NUMERIC NOT NULL,
  dejo_limpio NUMERIC NOT NULL,
  volveria_contratar BOOLEAN NOT NULL DEFAULT true,
  comentario TEXT,
  rating_promedio NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resenas_inteligentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ResenasInteligentes_select" ON public.resenas_inteligentes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "ResenasInteligentes_insert" ON public.resenas_inteligentes
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);
