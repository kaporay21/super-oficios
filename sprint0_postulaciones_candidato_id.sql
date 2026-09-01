-- Bug: el botón "Chatear" en candidatos-empleo no podía abrir una
-- conversación real con el candidato -- postulaciones solo guardaba su
-- nombre como texto, nunca su id de usuario.
ALTER TABLE public.postulaciones ADD COLUMN IF NOT EXISTS candidato_id UUID REFERENCES public.perfiles(id);

-- De paso: sin el id del empleador tampoco se lo podía notificar de una
-- postulación nueva (ver notificaciones en createPostulacion/supabase.ts).
ALTER TABLE public.postulaciones ADD COLUMN IF NOT EXISTS empleador_id UUID REFERENCES public.perfiles(id);
