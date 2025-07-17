-- Aggiorna i ruoli degli utenti per la chat admin/cliente
-- Imposta 'admin' per chi ha email che contiene 'admin' o nome_utente che contiene 'admin'
UPDATE public.user_profiles
SET role = 'admin'
WHERE (LOWER(email) LIKE '%admin%' OR LOWER(nome_utente) LIKE '%admin%');

-- Imposta 'cliente' per tutti gli altri utenti che non sono admin
UPDATE public.user_profiles
SET role = 'cliente'
WHERE role IS NULL OR role NOT IN ('admin', 'cliente');

-- (Opzionale) Mostra la situazione dopo la modifica
SELECT id, nome, cognome, email, nome_utente, role FROM public.user_profiles ORDER BY role, nome;
