
-- Correggo la logica per rimuovere ".admin" dall'email
CREATE OR REPLACE FUNCTION public.assign_user_role()
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
