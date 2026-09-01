-- Crea las tablas de Centro de Disputas y Log de Auditoría del panel admin.
-- Ambas ya son usadas por el código (crearDisputaResolucion/getDisputasCliente,
-- registrarAuditoria/getAuditLogs) pero nunca se crearon en la base real.
--
-- De paso: 'perfiles' tampoco tenía ninguna columna de estado de cuenta.
-- El botón Suspender/Habilitar del admin actualizaba solo el estado en
-- memoria del navegador (updateUserStatus era un console.log sin ningún
-- UPDATE real) y getAllUsers devolvía 'Activo' hardcodeado para todos.
-- Se agregan las columnas para que suspender/eliminar cuentas sea real.

ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS estado_cuenta TEXT NOT NULL DEFAULT 'Activo';
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

-- 1. Disputas / Centro de Resolución (cliente <-> profesional <-> admin)
CREATE TABLE IF NOT EXISTS public.disputas_resolucion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_trabajo_id UUID REFERENCES public.ordenes_trabajo(id) ON DELETE SET NULL,
  cliente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo_solucion TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  monto_reclamado NUMERIC,
  estado TEXT NOT NULL DEFAULT 'en_proceso', -- en_proceso | escalado_admin | resuelto_cliente | resuelto_profesional | acuerdo | rechazado
  resolucion_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.disputas_resolucion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Disputas_select" ON public.disputas_resolucion
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Disputas_insert" ON public.disputas_resolucion
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Disputas_update" ON public.disputas_resolucion
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. Log de auditoría de acciones del admin
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  accion TEXT NOT NULL,
  riesgo TEXT NOT NULL DEFAULT 'Bajo', -- Bajo | Medio | Alto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AuditLogs_select" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "AuditLogs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
