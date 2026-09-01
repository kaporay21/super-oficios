-- Tabla de reportes bidireccionales (cliente <-> profesional), usada por
-- createReporte/getReportes/updateReporteEstado (ya implementadas en el
-- código, nunca se creó la tabla). Sin esto, el botón "Reportar" explota
-- con excepción en cualquier uso real.
CREATE TABLE IF NOT EXISTS public.reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reportador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  reportado_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reportes_select" ON public.reportes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Reportes_insert" ON public.reportes FOR INSERT WITH CHECK (auth.uid() = reportador_id);
CREATE POLICY "Reportes_update" ON public.reportes FOR UPDATE USING (auth.role() = 'authenticated');

-- Dueño real de cada cliente/obra del mini-CRM del profesional. Antes
-- getClientes/getObras traían TODAS las filas de la plataforma sin
-- filtrar -- cualquier profesional veía (y podía borrar) los clientes y
-- obras de los demás. Ambas tablas están vacías en producción hoy, así
-- que no hace falta backfill.
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS profesional_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS profesional_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clientes_select" ON public.clientes;
CREATE POLICY "Clientes_select" ON public.clientes FOR SELECT USING (auth.uid() = profesional_id);
DROP POLICY IF EXISTS "Clientes_write" ON public.clientes;
CREATE POLICY "Clientes_write" ON public.clientes FOR ALL USING (auth.uid() = profesional_id) WITH CHECK (auth.uid() = profesional_id);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Obras_select" ON public.obras;
CREATE POLICY "Obras_select" ON public.obras FOR SELECT USING (auth.uid() = profesional_id);
DROP POLICY IF EXISTS "Obras_write" ON public.obras;
CREATE POLICY "Obras_write" ON public.obras FOR ALL USING (auth.uid() = profesional_id) WITH CHECK (auth.uid() = profesional_id);
