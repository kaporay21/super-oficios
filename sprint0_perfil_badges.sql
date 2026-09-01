-- Dos preferencias del profesional que se muestran como badge en sus
-- tarjetas de búsqueda: si cobra la visita/presupuesto y si acepta pagos
-- en cuotas/semanales. Se marcan desde "Editar Perfil Público".
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS cobra_presupuesto BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS acepta_pagos_semanales BOOLEAN NOT NULL DEFAULT false;
