-- Versión 2: la anterior no dejó ninguna política creada (el diagnóstico
-- dio "no rows"), así que esta corre paso a paso y termina mostrando el
-- resultado para confirmar que quedó bien. Si el SQL Editor muestra algún
-- error ROJO en cualquier paso, copiá el mensaje completo -- es la pista
-- que necesito.

-- Paso 1: habilitar RLS (si ya estaba habilitado, no hace nada)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Paso 2: borrar cualquier política vieja sobre perfiles, sea del comando
-- que sea (UPDATE, ALL, etc.) -- la versión anterior solo borraba las de
-- UPDATE, y si la vieja era de tipo ALL no la tocaba.
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'perfiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.perfiles', pol.policyname);
  END LOOP;
END $$;

-- Paso 3: recrear las políticas necesarias -- estas cuatro (select/insert/
-- update/delete) cubren todo lo que la app necesita, ya que antes no
-- quedó ninguna. Sin una política de SELECT explícita, con RLS habilitado
-- nadie vería ningún perfil (rompería toda la app), así que esta es
-- pública de lectura como ya lo era.
CREATE POLICY "Perfiles Select Publico"
ON public.perfiles FOR SELECT
USING (true);

CREATE POLICY "Perfiles Insert Propio"
ON public.perfiles FOR INSERT
WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Perfiles Delete Admin"
ON public.perfiles FOR DELETE
USING ( (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com') );

-- Paso 4: el trigger de protección de campos sensibles (igual que antes,
-- por si el CREATE OR REPLACE anterior no había llegado a correr).
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

-- Paso 5: auto-verificación -- esto es lo que quiero que me pegues.
SELECT
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'perfiles' AND relnamespace = 'public'::regnamespace) AS rls_habilitado,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'perfiles') AS cantidad_politicas,
  (SELECT string_agg(policyname || ' [' || cmd || ']', ', ') FROM pg_policies WHERE schemaname = 'public' AND tablename = 'perfiles') AS politicas;
