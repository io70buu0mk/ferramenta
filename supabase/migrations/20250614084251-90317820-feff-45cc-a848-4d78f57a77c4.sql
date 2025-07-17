
-- Crea la tabella profili utente
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente', -- Valori: 'cliente', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Popola il profilo quando un utente si registra, assegnando il ruolo in base all’email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  is_admin BOOLEAN;
BEGIN
  email_prefix := split_part(NEW.email, '@', 1);
  is_admin := (LEFT(email_prefix, 6) = '.admin');
  INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, CASE WHEN is_admin THEN 'admin' ELSE 'cliente' END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Abilita Row Level Security per la tabella profili
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Ogni utente può vedere solo il proprio profilo
CREATE POLICY "Self can view profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Ogni utente può aggiornare solo il proprio profilo
CREATE POLICY "Self can update profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

