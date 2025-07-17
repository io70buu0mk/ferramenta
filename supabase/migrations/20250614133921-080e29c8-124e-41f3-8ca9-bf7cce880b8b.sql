
-- Prima elimino eventuali conflitti esistenti
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP FUNCTION IF EXISTS public.assign_user_role();
DROP FUNCTION IF EXISTS public.user_has_permission(uuid, permission_type);

-- Elimino le tabelle se esistono
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.user_roles;

-- Elimino i tipi se esistono
DROP TYPE IF EXISTS public.permission_type;
DROP TYPE IF EXISTS public.user_role;

-- Ricreo tutto da capo
CREATE TYPE public.user_role AS ENUM ('Cliente', 'Moderato', 'Amministratore', 'Super Amministratore');

CREATE TYPE public.permission_type AS ENUM (
  'visualizzare_prodotti',
  'gestire_prodotti', 
  'pubblicare_modifiche',
  'modificare_permessi',
  'chat_clienti',
  'chat_staff'
);

-- Tabella per i ruoli utente
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'Cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabella per definire i permessi per ogni ruolo
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role user_role NOT NULL,
  permission permission_type NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(role, permission)
);

-- Popolo i permessi per ogni ruolo
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

-- Abilito RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy per user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per role_permissions
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

-- Funzione per assegnare ruolo
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger AS $$
DECLARE
  email_prefix TEXT;
  assigned_role user_role;
BEGIN
  email_prefix := split_part(NEW.email, '@', 1);
  
  IF email_prefix LIKE '%.admin' THEN
    assigned_role := 'Amministratore';
  ELSE
    assigned_role := 'Cliente';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per assegnare ruolo
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_user_role();

-- Funzione per verificare permessi
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
