
-- Rimozione tabelle custom
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Rimozione tipi custom
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS permission_type CASCADE;

-- Rimozione funzioni custom
DROP FUNCTION IF EXISTS assign_user_role CASCADE;
DROP FUNCTION IF EXISTS handle_new_user_profile CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS handle_complete_user_setup CASCADE;
DROP FUNCTION IF EXISTS user_has_permission CASCADE;

-- Rimozione eventuali policies residue (sulle tabelle appena droppate)
-- Non serve altro: le policy saranno droppate con le tabelle stesse

