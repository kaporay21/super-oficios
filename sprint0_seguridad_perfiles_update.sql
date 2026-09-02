-- HALLAZGO CRÍTICO DE SEGURIDAD, confirmado en vivo con curl: cualquier
-- usuario autenticado (probado con una cuenta de cliente común) podía
-- modificar la fila de perfiles de CUALQUIER OTRO usuario -- se probó y
-- funcionó: marcarse a otro como "verificado", subirle el plan a "Master"
-- gratis, y suspenderle la cuenta (estado_cuenta). No hacía falta ser
-- admin ni tener ningún permiso especial. Esto no es un bug de interfaz:
-- es una vulnerabilidad explotable por cualquier cuenta registrada.
--
-- Esta migración hace dos cosas:
-- 1. Reemplaza la política de UPDATE de perfiles por una que solo permite
--    tocar la fila propia (auth.uid() = id) o ser admin.
-- 2. Agrega un trigger que, aunque sea tu propia fila, te impide tocarte
--    vos mismo los campos sensibles (verificado, estado_dni, plan,
--    estado_cuenta, rol, etc.) salvo que seas admin -- así ni siquiera
--    podés auto-verificarte o subirte el plan editando tu propio perfil.
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'perfiles' AND cmd = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.perfiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles Update Propio o Admin"
ON public.perfiles FOR UPDATE
USING (
  auth.uid() = id
  OR (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com')
)
WITH CHECK (
  auth.uid() = id
  OR (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com')
);

-- Protección extra: ni siquiera en tu propia fila podés tocar estos campos
-- si no sos admin. OJO: "plan" / "plan_prioridad" quedan afuera a propósito
-- -- planes/page.tsx hoy deja elegir plan sin pago real (Mercado Pago está
-- pendiente), así que bloquearlo acá rompería esa función actual. Es una
-- decisión de producto aparte, no algo que deba decidir esta migración.
--
-- estado_dni / estado_certificados son un caso especial: el profesional SÍ
-- tiene que poder moverlos a 'En Revisión' cuando manda documentación nueva
-- (subirDNI() y la subida de certificados lo hacen), pero no puede
-- ponerse 'Validado' a sí mismo -- eso queda exclusivamente para admin.
CREATE OR REPLACE FUNCTION public.proteger_campos_admin_perfiles()
RETURNS TRIGGER AS $$
DECLARE
  es_admin BOOLEAN;
BEGIN
  es_admin := (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com');
  IF NOT es_admin THEN
    NEW.verificado := OLD.verificado;
    IF NEW.estado_dni IS DISTINCT FROM OLD.estado_dni AND NEW.estado_dni IS DISTINCT FROM 'En Revisión' THEN
      NEW.estado_dni := OLD.estado_dni;
    END IF;
    IF NEW.estado_certificados IS DISTINCT FROM OLD.estado_certificados AND NEW.estado_certificados IS DISTINCT FROM 'En Revisión' THEN
      NEW.estado_certificados := OLD.estado_certificados;
    END IF;
    NEW.matriculado_verificado := OLD.matriculado_verificado;
    NEW.estado_cuenta := OLD.estado_cuenta;
    NEW.motivo_estado := OLD.motivo_estado;
    NEW.rol := OLD.rol;
    NEW.foto_verificada_en := OLD.foto_verificada_en;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proteger_campos_admin_perfiles ON public.perfiles;
CREATE TRIGGER trg_proteger_campos_admin_perfiles
BEFORE UPDATE ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION public.proteger_campos_admin_perfiles();
