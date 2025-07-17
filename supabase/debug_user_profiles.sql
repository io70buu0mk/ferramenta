-- Debug: Mostra tutti gli utenti e i loro ruoli
SELECT id, nome, cognome, email, nome_utente, role FROM public.user_profiles ORDER BY role, nome;

-- Debug: Conta quanti utenti per ruolo
SELECT role, COUNT(*) FROM public.user_profiles GROUP BY role;

-- Debug: Mostra le policy attive sulla tabella user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Debug: Mostra i primi 10 record della tabella user_profiles
SELECT * FROM public.user_profiles LIMIT 10;
