-- Faltó en sprint0_dni_verificacion.sql: sin política de DELETE, el
-- profesional no puede reemplazar su propio DNI si necesita volver a
-- subirlo (el upsert:true en la subida hace un update sobre el mismo path,
-- pero un DELETE explícito -- limpieza, o el propio profesional borrando
-- una carga errónea -- quedaba bloqueado).
DROP POLICY IF EXISTS "DNI Storage Own Delete" ON storage.objects;
CREATE POLICY "DNI Storage Own Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'dni' AND (storage.foldername(name))[1] = auth.uid()::text );
