
-- Ricreo l'enum user_role se non esiste
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('Cliente', 'Moderato', 'Amministratore', 'Super Amministratore');
  END IF;
END$$;

-- Ricreo anche permission_type se necessario
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_type') THEN
    CREATE TYPE public.permission_type AS ENUM (
      'visualizzare_prodotti',
      'gestire_prodotti', 
      'pubblicare_modifiche',
      'modificare_permessi',
      'chat_clienti',
      'chat_staff'
    );
  END IF;
END$$;
