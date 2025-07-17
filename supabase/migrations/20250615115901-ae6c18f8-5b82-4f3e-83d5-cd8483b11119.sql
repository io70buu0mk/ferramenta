
-- ENUM ruoli
CREATE TYPE public.user_role AS ENUM ('Cliente', 'Moderato', 'Amministratore', 'Super Amministratore');

-- ENUM permessi
CREATE TYPE public.permission_type AS ENUM (
  'visualizzare_prodotti',
  'gestire_prodotti', 
  'pubblicare_modifiche',
  'modificare_permessi',
  'chat_clienti',
  'chat_staff'
);

-- Tabella profili utente dettagliata
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  numero_telefono TEXT,
  nome_utente TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella ruoli utente
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'Cliente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabella permessi per ruolo
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  permission permission_type NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(role, permission)
);

-- Popolamento matrice permessi/ruoli
INSERT INTO public.role_permissions (role, permission, granted, requires_approval) VALUES
-- Cliente
('Cliente', 'visualizzare_prodotti', true, false),
('Cliente', 'gestire_prodotti', false, false),
('Cliente', 'pubblicare_modifiche', false, false),
('Cliente', 'modificare_permessi', false, false),
('Cliente', 'chat_clienti', true, false),
('Cliente', 'chat_staff', false, false),
-- Moderato
('Moderato', 'visualizzare_prodotti', true, false),
('Moderato', 'gestire_prodotti', true, true),
('Moderato', 'pubblicare_modifiche', false, false),
('Moderato', 'modificare_permessi', false, false),
('Moderato', 'chat_clienti', false, false),
('Moderato', 'chat_staff', true, false),
-- Amministratore
('Amministratore', 'visualizzare_prodotti', true, false),
('Amministratore', 'gestire_prodotti', true, false),
('Amministratore', 'pubblicare_modifiche', true, false),
('Amministratore', 'modificare_permessi', false, false),
('Amministratore', 'chat_clienti', true, false),
('Amministratore', 'chat_staff', true, false),
-- Super Amministratore
('Super Amministratore', 'visualizzare_prodotti', true, false),
('Super Amministratore', 'gestire_prodotti', true, false),
('Super Amministratore', 'pubblicare_modifiche', true, false),
('Super Amministratore', 'modificare_permessi', true, false),
('Super Amministratore', 'chat_clienti', true, false),
('Super Amministratore', 'chat_staff', true, false);

-- Abilita RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: ognuno vede solo il proprio profilo (solo SELECT)
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: ognuno può aggiornare solo il proprio profilo (solo UPDATE)
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: ognuno può creare solo il proprio profilo (solo INSERT)
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy user_roles e role_permissions
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

-- Funzione assegnazione ruolo automatica + email .admin
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  email_domain TEXT;
  assigned_role user_role;
  cleaned_email TEXT;
BEGIN
  email_prefix := split_part(NEW.email, '@', 1);
  email_domain := split_part(NEW.email, '@', 2);

  IF email_prefix LIKE '%.admin' THEN
    assigned_role := 'Amministratore';
    cleaned_email := replace(email_prefix, '.admin', '') || '@' || email_domain;
  ELSE
    assigned_role := 'Cliente';
    cleaned_email := NEW.email;
  END IF;

  IF cleaned_email != NEW.email THEN
    UPDATE auth.users 
    SET email = cleaned_email, 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('original_email', NEW.email)
    WHERE id = NEW.id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per inserire profilo user automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
DECLARE
  final_email TEXT;
BEGIN
  final_email := NEW.email;
  INSERT INTO public.user_profiles (
    id, nome, cognome, email, numero_telefono, nome_utente
  ) VALUES (
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

-- Trigger su auth.users
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_user_role();

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Funzione per controllo permessi
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name permission_type)
RETURNS BOOLEAN AS $$
DECLARE
  user_role_value user_role;
  has_permission BOOLEAN DEFAULT FALSE;
BEGIN
  SELECT role INTO user_role_value
  FROM public.user_roles
  WHERE user_roles.user_id = user_has_permission.user_id;
  
  SELECT granted INTO has_permission
  FROM public.role_permissions
  WHERE role = user_role_value AND permission = permission_name;

  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

