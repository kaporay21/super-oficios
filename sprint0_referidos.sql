-- Fase 2 (ronda de crecimiento): sistema de referidos real. El código de
-- referido se deriva de la propia PK (columna generada), así que es único
-- automáticamente y no requiere trigger ni backfill.
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS codigo_referido TEXT
  GENERATED ALWAYS AS (UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))) STORED;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS referido_por UUID REFERENCES public.perfiles(id);
