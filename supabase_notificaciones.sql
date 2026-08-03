-- 1. Crear tabla de Notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('trabajo', 'mensaje', 'sistema', 'alerta')),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  referencia_id UUID, -- Opcional: ID del trabajo o chat asociado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad
-- Política para que un usuario pueda ver solo SUS propias notificaciones
CREATE POLICY "Notificaciones_select" 
ON public.notificaciones FOR SELECT 
USING (auth.uid() = usuario_id);

-- Política para que el sistema o el usuario puedan marcar como leída (actualizar)
CREATE POLICY "Notificaciones_update" 
ON public.notificaciones FOR UPDATE 
USING (auth.uid() = usuario_id);

-- Política para poder borrar notificaciones antiguas si quisieran
CREATE POLICY "Notificaciones_delete" 
ON public.notificaciones FOR DELETE 
USING (auth.uid() = usuario_id);

-- Política para insertar notificaciones (generalmente lo hace el backend o funciones seguras, pero damos permiso de inserción para el usuario en desarrollo si hace falta. Para mayor seguridad en producción esto lo harían triggers o service_role)
CREATE POLICY "Notificaciones_insert" 
ON public.notificaciones FOR INSERT 
WITH CHECK (true);
