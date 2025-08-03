-- Aggiunge colonne created_at e updated_at a order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- (Opzionale) Aggiorna i valori esistenti
UPDATE public.order_items SET created_at = now(), updated_at = now() WHERE created_at IS NULL OR updated_at IS NULL;
