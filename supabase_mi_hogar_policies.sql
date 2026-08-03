-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase

-- Habilitar RLS en las tablas
ALTER TABLE public.mi_hogar_propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_hogar_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mi_hogar_mantenimientos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores por si existen (para evitar errores al volver a correr el script)
DROP POLICY IF EXISTS "Propiedades_select" ON public.mi_hogar_propiedades;
DROP POLICY IF EXISTS "Propiedades_insert" ON public.mi_hogar_propiedades;
DROP POLICY IF EXISTS "Propiedades_update" ON public.mi_hogar_propiedades;
DROP POLICY IF EXISTS "Propiedades_delete" ON public.mi_hogar_propiedades;

DROP POLICY IF EXISTS "Comprobantes_select" ON public.mi_hogar_comprobantes;
DROP POLICY IF EXISTS "Comprobantes_insert" ON public.mi_hogar_comprobantes;
DROP POLICY IF EXISTS "Comprobantes_update" ON public.mi_hogar_comprobantes;
DROP POLICY IF EXISTS "Comprobantes_delete" ON public.mi_hogar_comprobantes;

DROP POLICY IF EXISTS "Mantenimientos_select" ON public.mi_hogar_mantenimientos;
DROP POLICY IF EXISTS "Mantenimientos_insert" ON public.mi_hogar_mantenimientos;
DROP POLICY IF EXISTS "Mantenimientos_update" ON public.mi_hogar_mantenimientos;
DROP POLICY IF EXISTS "Mantenimientos_delete" ON public.mi_hogar_mantenimientos;

-- Políticas para mi_hogar_propiedades
CREATE POLICY "Propiedades_select" ON public.mi_hogar_propiedades FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Propiedades_insert" ON public.mi_hogar_propiedades FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Propiedades_update" ON public.mi_hogar_propiedades FOR UPDATE USING (auth.uid() = cliente_id);
CREATE POLICY "Propiedades_delete" ON public.mi_hogar_propiedades FOR DELETE USING (auth.uid() = cliente_id);

-- Políticas para mi_hogar_comprobantes
CREATE POLICY "Comprobantes_select" ON public.mi_hogar_comprobantes FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Comprobantes_insert" ON public.mi_hogar_comprobantes FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Comprobantes_update" ON public.mi_hogar_comprobantes FOR UPDATE USING (auth.uid() = cliente_id);
CREATE POLICY "Comprobantes_delete" ON public.mi_hogar_comprobantes FOR DELETE USING (auth.uid() = cliente_id);

-- Políticas para mi_hogar_mantenimientos
CREATE POLICY "Mantenimientos_select" ON public.mi_hogar_mantenimientos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Mantenimientos_insert" ON public.mi_hogar_mantenimientos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Mantenimientos_update" ON public.mi_hogar_mantenimientos FOR UPDATE USING (auth.uid() = cliente_id);
CREATE POLICY "Mantenimientos_delete" ON public.mi_hogar_mantenimientos FOR DELETE USING (auth.uid() = cliente_id);
