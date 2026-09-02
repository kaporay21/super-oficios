-- El flujo "Subir DNI" del profesional (configuracion-profesional/page.tsx,
-- handleSubirDNI) nunca se migró a Supabase: el archivo no se subía a
-- ningún lado y todo se guardaba en localStorage del propio navegador
-- (oficiosya_profesional_perfil / oficiosya_verificaciones). El admin lee
-- todo de Supabase (getAllUsers), así que jamás veía nada -- confirmado
-- reportado en vivo por el usuario: "subí el DNI pero en admin no lo veo".
--
-- El DNI es un documento de identidad (nombre completo, número, foto de la
-- cara) -- a diferencia de avatars/certificates/trabajos/portfolio, que son
-- públicos a propósito, el bucket de DNI tiene que ser PRIVADO: solo el
-- propio profesional y los admins pueden verlo. El admin lo visualiza con
-- URLs firmadas de corta duración (createSignedUrl), no con URL pública.

-- 1. Columnas para guardar la ruta (no la URL pública, que no existe en un
--    bucket privado) del DNI subido.
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS dni_frontal_path TEXT,
  ADD COLUMN IF NOT EXISTS dni_dorso_path TEXT;

-- 2. Bucket privado "dni"
INSERT INTO storage.buckets (id, name, public)
VALUES ('dni', 'dni', false)
ON CONFLICT (id) DO NOTHING;

-- 3. El profesional puede subir/actualizar/leer solo su propia carpeta
--    (el path se guarda como "{auth.uid()}/frente.ext" y "{auth.uid()}/dorso.ext").
DROP POLICY IF EXISTS "DNI Storage Own Insert" ON storage.objects;
CREATE POLICY "DNI Storage Own Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'dni' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "DNI Storage Own Update" ON storage.objects;
CREATE POLICY "DNI Storage Own Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'dni' AND (storage.foldername(name))[1] = auth.uid()::text );

DROP POLICY IF EXISTS "DNI Storage Own Select" ON storage.objects;
CREATE POLICY "DNI Storage Own Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dni' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 4. Los admins (mismo criterio de ADMIN_EMAILS que usa el resto de la app)
--    pueden ver el DNI de cualquier profesional para cotejarlo.
DROP POLICY IF EXISTS "DNI Storage Admin Select" ON storage.objects;
CREATE POLICY "DNI Storage Admin Select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dni'
  AND (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com')
);
