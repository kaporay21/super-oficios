-- La sección "Certificados & Matrícula" (subida del profesional en
-- configuracion-profesional, y aprobación del admin en el modal de
-- "Cotejo y Asignación de Insignias") nunca funcionó de punta a punta:
-- ninguna de estas columnas existía en la base. El código las escribía
-- igual, pero updateProfile() las ignoraba en silencio y
-- updateUserVerification() tiraba un error atajado solo por un
-- console.error -- confirmado en vivo, "el certificado no sube" era
-- literalmente cierto: se veía en pantalla (estado de React) pero nunca
-- llegaba a Supabase.
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS certificados JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nro_matricula TEXT,
  ADD COLUMN IF NOT EXISTS matriculado_verificado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS estado_certificados TEXT DEFAULT 'Pendiente';
