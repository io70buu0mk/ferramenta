
-- Aggiorno la funzione per assegnare il ruolo E modificare l'email
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  assigned_role user_role;
  cleaned_email TEXT;
BEGIN
  email_prefix := split_part(NEW.email, '@', 1);
  
  -- Controllo se l'email contiene ".admin" e assegno il ruolo
  IF email_prefix LIKE '%.admin' THEN
    assigned_role := 'Amministratore';
    -- Rimuovo ".admin" dall'email
    cleaned_email := replace(NEW.email, '.admin@', '@');
  ELSE
    assigned_role := 'Cliente';
    cleaned_email := NEW.email;
  END IF;
  
  -- Aggiorno l'email dell'utente rimuovendo ".admin" se presente
  IF cleaned_email != NEW.email THEN
    UPDATE auth.users 
    SET email = cleaned_email, 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('original_email', NEW.email)
    WHERE id = NEW.id;
  END IF;
  
  -- Inserisco il ruolo
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggiorno anche la funzione per gestire i profili utente per usare l'email pulita
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
DECLARE
  final_email TEXT;
BEGIN
  -- Uso l'email già pulita dal trigger precedente
  final_email := NEW.email;
  
  INSERT INTO public.user_profiles (id, nome, cognome, email, numero_telefono, nome_utente)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'cognome', 
    final_email,
    NEW.raw_user_meta_data->>'numero_telefono',
    NEW.raw_user_meta_data->>'nome_utente'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
