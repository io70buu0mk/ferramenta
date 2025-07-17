-- Creo la tabella per i prodotti
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Abilito RLS sulla tabella prodotti
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare i prodotti (tutti possono vedere prodotti attivi)
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

-- Policy per gestire i prodotti (solo amministratori)
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'Amministratore'
    )
  );

-- Creo la tabella per i messaggi/comunicazioni
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  message_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Abilito RLS sui messaggi
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy per vedere i propri messaggi
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'Amministratore'
    )
  );

-- Policy per inviare messaggi
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy per aggiornare messaggi (solo il destinatario può marcare come letto)
CREATE POLICY "Recipients can update message status" ON public.messages
  FOR UPDATE USING (
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'Amministratore'
    )
  );