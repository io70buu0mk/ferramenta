
-- Rimuovo i trigger vecchi che causano conflitti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Rimuovo le funzioni vecchie
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Aggiorno la funzione per gestire sia ruoli che profili in un solo trigger
CREATE OR REPLACE FUNCTION public.handle_complete_user_setup()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  email_domain TEXT;
  assigned_role user_role;
  cleaned_email TEXT;
BEGIN
  -- Separo prefisso e dominio
  email_prefix := split_part(NEW.email, '@', 1);
  email_domain := split_part(NEW.email, '@', 2);
  
  -- Controllo se l'email contiene ".admin" e assegno il ruolo
  IF email_prefix LIKE '%.admin' THEN
    assigned_role := 'Amministratore';
    -- Rimuovo ".admin" dal prefisso e ricostruisco l'email
    cleaned_email := replace(email_prefix, '.admin', '') || '@' || email_domain;
  ELSE
    assigned_role := 'Cliente';
    cleaned_email := NEW.email;
  END IF;
  
  -- Aggiorno l'email dell'utente se necessario
  IF cleaned_email != NEW.email THEN
    UPDATE auth.users 
    SET email = cleaned_email, 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('original_email', NEW.email)
    WHERE id = NEW.id;
  END IF;
  
  -- Inserisco il ruolo
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  -- Creo il profilo utente con l'email pulita
  INSERT INTO public.user_profiles (id, nome, cognome, email, numero_telefono, nome_utente)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'cognome', 
    cleaned_email,
    NEW.raw_user_meta_data->>'numero_telefono',
    NEW.raw_user_meta_data->>'nome_utente'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creo un solo trigger che gestisce tutto
CREATE TRIGGER on_auth_user_created_complete_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_complete_user_setup();
