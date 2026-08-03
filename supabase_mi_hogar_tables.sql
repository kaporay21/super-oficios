-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase

-- 1. Crear tabla de Propiedades
CREATE TABLE IF NOT EXISTS public.mi_hogar_propiedades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  direccion TEXT,
  tipo TEXT,
  superficie_m2 INTEGER,
  anio_construccion INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla de Comprobantes vinculada a Propiedades
CREATE TABLE IF NOT EXISTS public.mi_hogar_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  propiedad_id UUID NOT NULL REFERENCES public.mi_hogar_propiedades(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descripcion TEXT,
  url_archivo TEXT,
  monto NUMERIC,
  fecha_documento DATE,
  fecha_vencimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear tabla de Mantenimientos vinculada a Propiedades
CREATE TABLE IF NOT EXISTS public.mi_hogar_mantenimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  propiedad_id UUID NOT NULL REFERENCES public.mi_hogar_propiedades(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  frecuencia TEXT,
  proxima_fecha DATE,
  completado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. (Opcional) Activar RLS para seguridad si la base de datos lo requiere
-- ALTER TABLE public.mi_hogar_propiedades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.mi_hogar_comprobantes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.mi_hogar_mantenimientos ENABLE ROW LEVEL SECURITY;
