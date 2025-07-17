
-- Aggiorniamo le policy RLS per permettere l'inserimento durante la registrazione
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Nuova policy per permettere l'inserimento durante la registrazione
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy per permettere agli utenti di vedere solo il proprio profilo
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy per permettere agli utenti di aggiornare solo il proprio profilo
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
