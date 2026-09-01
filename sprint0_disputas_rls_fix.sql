-- La política de INSERT de disputas_resolucion exigía auth.uid() = cliente_id,
-- pero "Escalar a disputa" lo ejecuta el admin (no el cliente): su sesión
-- nunca va a coincidir con cliente_id, así que el insert siempre fallaba
-- por RLS. No hay forma de chequear "es admin" en una política porque el
-- rol de admin en esta app se decide por email en el código (isEmailAdmin),
-- nunca se escribe perfiles.rol = 'admin' en la base real -- así que se
-- relaja a autenticado, igual que ya funciona el resto de las tablas que
-- el admin necesita escribir con la sola anon key.
DROP POLICY IF EXISTS "Disputas_insert" ON public.disputas_resolucion;
CREATE POLICY "Disputas_insert" ON public.disputas_resolucion
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
