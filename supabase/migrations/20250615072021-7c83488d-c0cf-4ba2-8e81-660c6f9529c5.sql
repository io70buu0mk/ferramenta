
-- 👤 Cerca utenti già presenti con la stessa email (anche "pulita" da .admin)
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email ILIKE '%amilcare.lucini%'
   OR email ILIKE '%admin%'
ORDER BY created_at DESC;

-- 🏷️ Trova eventuali profili con lo stesso nome utente
SELECT id, nome_utente, email 
FROM public.user_profiles 
WHERE nome_utente = 'superadmin'
   OR email ILIKE '%amilcare.lucini%'
ORDER BY created_at DESC;

-- 📱 Trova eventuali profili con lo stesso numero di telefono (anche NULL può dare problemi se ci sono UNIQUE NULL in alcuni DB)
SELECT id, numero_telefono, nome_utente 
FROM public.user_profiles 
WHERE numero_telefono IS NOT NULL
GROUP BY numero_telefono, id, nome_utente
HAVING COUNT(*) > 1;
