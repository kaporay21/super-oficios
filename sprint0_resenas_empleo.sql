-- Reseñas del empleador en la Bolsa de Empleo: no existía ningún flujo
-- para que el candidato califique cómo fue el proceso de postulación
-- (comunicación, seriedad, trato), a diferencia del Muro de servicios que
-- sí tiene reseñas al profesional. Se habilita una vez que el empleador
-- responde la postulación (Aceptado o Rechazado) -- no mientras sigue "En
-- revisión", y no se puede calificar dos veces la misma postulación.
CREATE TABLE IF NOT EXISTS public.resenas_empleo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  postulacion_id BIGINT UNIQUE NOT NULL REFERENCES public.postulaciones(id) ON DELETE CASCADE,
  empleo_id BIGINT,
  empleador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resenas_empleo ENABLE ROW LEVEL SECURITY;

-- Públicas de lectura (igual que resenas_inteligentes) -- sirven para que
-- otros candidatos vean qué tan bien trata este empleador a los postulantes
-- antes de postularse ellos mismos.
DROP POLICY IF EXISTS "ResenasEmpleo Select Publico" ON public.resenas_empleo;
CREATE POLICY "ResenasEmpleo Select Publico"
ON public.resenas_empleo FOR SELECT
USING (true);

-- Solo el propio candidato de esa postulación puede crear su reseña.
DROP POLICY IF EXISTS "ResenasEmpleo Insert Propio" ON public.resenas_empleo;
CREATE POLICY "ResenasEmpleo Insert Propio"
ON public.resenas_empleo FOR INSERT
WITH CHECK (auth.uid() = candidato_id);
