-- "Gestión de Oficios" y "Reglas de Puntos y Fidelización" en Configuración
-- (admin) eran 100% decorativas: los botones "Añadir", "Guardar Reglas" y
-- las "X" de borrar no tenían ningún onClick, y las listas mostradas eran
-- arrays hardcodeados en el componente, sin tabla detrás.

-- 1. Oficios: catálogo editable desde admin. Se siembra con la lista que
--    hoy usa toda la app (OFICIOS_CORE en src/lib/constants.ts) para no
--    perder nada -- el resto del sitio (buscadores, formularios) sigue
--    usando esa constante por ahora; esta tabla es la gestión desde admin,
--    no reemplaza todavía los selectores del resto del sitio.
CREATE TABLE IF NOT EXISTS public.oficios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.oficios (nombre) VALUES
  ('Plomería'), ('Electricidad'), ('Albañilería'), ('Pintura'), ('Carpintería'),
  ('Gasista'), ('Cerrajería'), ('Durlock / Yeso'), ('Aire Acondicionado'),
  ('Jardinería'), ('Fumigación'), ('Herrería'), ('Techista / Impermeabilización'),
  ('Fletes y Mudanzas'), ('Limpieza'), ('Otro')
ON CONFLICT (nombre) DO NOTHING;

ALTER TABLE public.oficios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Oficios Select Publico" ON public.oficios;
CREATE POLICY "Oficios Select Publico"
ON public.oficios FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Oficios Admin Escribe" ON public.oficios;
CREATE POLICY "Oficios Admin Escribe"
ON public.oficios FOR ALL
USING ( (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com') )
WITH CHECK ( (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com') );

-- 2. Reglas de puntos: los valores (20, 25, 50, 100...) estaban
--    hardcodeados en cada lugar del código que otorga puntos
--    (registrarPuntos/otorgarPuntosUnaVez). Esta tabla los centraliza;
--    registrarPuntos() ahora consulta acá antes de aplicar el hardcodeado
--    como fallback, así que editar "Reglas de Puntos" en admin cambia de
--    verdad cuánto gana cada acción, sin tocar código.
CREATE TABLE IF NOT EXISTS public.reglas_puntos (
  clave TEXT PRIMARY KEY,
  etiqueta TEXT NOT NULL,
  puntos INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.reglas_puntos (clave, etiqueta, puntos) VALUES
  ('completar_perfil', 'Completar perfil al 100%', 50),
  ('trabajo_finalizado', 'Finalizar un trabajo', 20),
  ('resena_recibida', 'Recibir una reseña', 25),
  ('verificacion_dni', 'Identidad verificada (DNI aprobado)', 100),
  ('verificacion_matricula', 'Matrícula / certificado aprobado', 50),
  ('compartir_perfil', 'Compartir tu perfil', 50),
  ('referido', 'Invitar a un nuevo usuario', 100)
ON CONFLICT (clave) DO NOTHING;

ALTER TABLE public.reglas_puntos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ReglasPuntos Select Publico" ON public.reglas_puntos;
CREATE POLICY "ReglasPuntos Select Publico"
ON public.reglas_puntos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "ReglasPuntos Admin Escribe" ON public.reglas_puntos;
CREATE POLICY "ReglasPuntos Admin Escribe"
ON public.reglas_puntos FOR ALL
USING ( (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com') )
WITH CHECK ( (auth.jwt() ->> 'email') IN ('gonzalohumacata1992@gmail.com', 'gonzalo@gmail.com', 'pedro@gmail.com') );
