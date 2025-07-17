
-- Creo la tabella per i profili utente con tutti i campi richiesti
CREATE TABLE public.user_profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome text NOT NULL,
  cognome text NOT NULL,
  email text NOT NULL,
  numero_telefono text UNIQUE,
  nome_utente text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Abilito RLS sulla tabella
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo il proprio profilo
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy per permettere agli utenti di aggiornare solo il proprio profilo
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy per permettere la creazione del profilo durante la registrazione
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Funzione per gestire la creazione automatica del profilo utente
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nome, cognome, email, numero_telefono, nome_utente)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'cognome', 
    NEW.email,
    NEW.raw_user_meta_data->>'numero_telefono',
    NEW.raw_user_meta_data->>'nome_utente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare automaticamente il profilo quando si registra un nuovo utente
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
