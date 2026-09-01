-- La tabla presupuestos existía con literalmente una sola columna (id) --
-- getPresupuestos/savePresupuesto en supabase.ts siempre asumieron nombre,
-- cliente, telefono, nota, total_mano_obra, cant_materiales, total,
-- mano_obra, materiales y fecha, pero ninguna existía. Cada guardado desde
-- el Presupuestador de Obras fallaba en silencio (el catch solo hace
-- console.warn) mientras la UI mostraba "¡Guardado con éxito!".
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS cliente TEXT;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS nota TEXT;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS total_mano_obra NUMERIC;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS cant_materiales INTEGER;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS mano_obra JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS materiales JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS fecha TEXT;
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
