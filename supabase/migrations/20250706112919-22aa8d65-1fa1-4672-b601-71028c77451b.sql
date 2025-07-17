-- Crea tabella categorie
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS per categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di vedere le categorie
CREATE POLICY "Everyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Policy per permettere agli admin di gestire le categorie
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.id = auth.uid() 
  AND user_profiles.role = 'Amministratore'
));

-- Aggiorna policy prodotti per essere più specifica
DROP POLICY "Everyone can view active products" ON public.products;

CREATE POLICY "Everyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- Inserisci alcune categorie di default
INSERT INTO public.categories (name, description) VALUES 
('Trapani', 'Trapani elettrici e a batteria'),
('Martelli', 'Martelli di varie dimensioni'),
('Cacciaviti', 'Set e cacciaviti singoli'),
('Chiavi', 'Chiavi inglesi e a bussola'),
('Misuratori', 'Metri, livelle e strumenti di misura');