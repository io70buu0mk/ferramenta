
-- Sostituisco la funzione esistente aggiungendo RAISE NOTICE su ogni step con blocco EXCEPTION per debug

CREATE OR REPLACE FUNCTION public.handle_complete_user_setup()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  email_domain TEXT;
  assigned_role user_role;
  cleaned_email TEXT;
BEGIN
  RAISE NOTICE 'Step 1: Avvio trigger per user %', NEW.id;

  -- Separo prefisso e dominio
  email_prefix := split_part(NEW.email, '@', 1);
  email_domain := split_part(NEW.email, '@', 2);
  RAISE NOTICE 'Step 2: Prefix: %, Domain: %', email_prefix, email_domain;

  -- Controllo se l'email contiene ".admin" e assegno il ruolo
  IF email_prefix LIKE '%.admin' THEN
    assigned_role := 'Amministratore';
    cleaned_email := replace(email_prefix, '.admin', '') || '@' || email_domain;
    RAISE NOTICE 'Step 3: Email .admin rilevata. Assegno ruolo Amministratore, email pulita: %', cleaned_email;
  ELSE
    assigned_role := 'Cliente';
    cleaned_email := NEW.email;
    RAISE NOTICE 'Step 3: Nuovo utente Cliente. Email: %', cleaned_email;
  END IF;

  -- Aggiorno l'email dell'utente se necessario
  IF cleaned_email != NEW.email THEN
    RAISE NOTICE 'Step 4: Aggiorno email auth.users da % a %', NEW.email, cleaned_email;
    BEGIN
      UPDATE auth.users 
      SET email = cleaned_email, 
          raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('original_email', NEW.email)
      WHERE id = NEW.id;
      RAISE NOTICE 'Step 4: Email aggiornata con successo';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Errore aggiornamento email auth.users: %', SQLERRM;
      -- Continua per il debug ma risolleva per i casi di errore seri
      RAISE;
    END;
  END IF;

  -- Inserisco il ruolo
  RAISE NOTICE 'Step 5: Inserisco ruolo % per user %', assigned_role, NEW.id;
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, assigned_role);
    RAISE NOTICE 'Step 5: Ruolo inserito!';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Errore insert user_roles: %', SQLERRM;
    RAISE;
  END;

  -- Creo il profilo utente con l'email pulita
  RAISE NOTICE 'Step 6: Inserisco profilo user %', NEW.id;
  BEGIN
    INSERT INTO public.user_profiles (id, nome, cognome, email, numero_telefono, nome_utente)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'cognome', 
      cleaned_email,
      NEW.raw_user_meta_data->>'numero_telefono',
      NEW.raw_user_meta_data->>'nome_utente'
    );
    RAISE NOTICE 'Step 6: Profilo utente inserito!';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Errore insert user_profiles: %', SQLERRM;
    RAISE;
  END;

  RAISE NOTICE 'Step 7: Trigger terminato OK!';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
