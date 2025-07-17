
-- 1. DROP FUNZIONI E TRIGGER collegati all'assegnazione ruoli/profili/permessi
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_complete_setup ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.assign_user_role();
DROP FUNCTION IF EXISTS public.handle_new_user_profile();
DROP FUNCTION IF EXISTS public.handle_complete_user_setup();
DROP FUNCTION IF EXISTS public.user_has_permission();

-- 2. DROP TABELLE DI RUOLI E PERMESSI
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;

-- 3. DROP ENUM PERSONALIZZATI
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS permission_type CASCADE;

-- 4. Lascia SOLO user_profiles, se vuoi tieni anche user_profiles così com’è.
-- (Non la tocco, ma se vuoi semplificare ancora dimmelo)

-- FINE MIGRAZIONE: ora la registrazione invierà solo su user_profiles senza automazioni.
