-- La tabla "presupuestos" resultó ser una tabla legacy no relacionada con el
-- Presupuestador de Obras: su "id" es bigint autoincremental (la app genera
-- ids de texto tipo 'pres_' + Date.now()) y tiene una columna "id_trabajo"
-- obligatoria (NOT NULL, sin default) que no aplica acá -- el Presupuestador
-- es una herramienta privada de cotización del profesional, no está ligada
-- a una publicación de trabajo. En vez de forzar esa tabla ajena, creamos
-- una tabla dedicada para esta feature.
CREATE TABLE IF NOT EXISTS public.presupuestos_obra (
  id TEXT PRIMARY KEY,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre TEXT,
  cliente TEXT,
  telefono TEXT,
  nota TEXT,
  total_mano_obra NUMERIC,
  cant_materiales INTEGER,
  total NUMERIC,
  mano_obra JSONB DEFAULT '[]'::jsonb,
  materiales JSONB DEFAULT '[]'::jsonb,
  fecha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.presupuestos_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PresupuestosObra_select" ON public.presupuestos_obra FOR SELECT USING (auth.uid() = profesional_id);
CREATE POLICY "PresupuestosObra_write" ON public.presupuestos_obra FOR ALL USING (auth.uid() = profesional_id) WITH CHECK (auth.uid() = profesional_id);
