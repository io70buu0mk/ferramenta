-- Fix RLS policies to be case-insensitive for role matching

-- Update products policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (EXISTS ( 
  SELECT 1
  FROM user_profiles
  WHERE (user_profiles.id = auth.uid()) 
    AND (LOWER(user_profiles.role) = 'amministratore')
));

-- Update categories policies  
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS ( 
  SELECT 1
  FROM user_profiles
  WHERE (user_profiles.id = auth.uid()) 
    AND (LOWER(user_profiles.role) = 'amministratore')
));

-- Update messages policies
DROP POLICY IF EXISTS "Recipients can update message status" ON public.messages;
CREATE POLICY "Recipients can update message status" 
ON public.messages 
FOR UPDATE 
USING (
  (auth.uid() = recipient_id) 
  OR (EXISTS ( 
    SELECT 1
    FROM user_profiles
    WHERE (user_profiles.id = auth.uid()) 
      AND (LOWER(user_profiles.role) = 'amministratore')
  ))
);

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (
  (auth.uid() = sender_id) 
  OR (auth.uid() = recipient_id) 
  OR (EXISTS ( 
    SELECT 1
    FROM user_profiles
    WHERE (user_profiles.id = auth.uid()) 
      AND (LOWER(user_profiles.role) = 'amministratore')
  ))
);