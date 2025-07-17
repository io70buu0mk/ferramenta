import React from 'react';
import UserAdminGroupChat from '@/components/user/UserAdminGroupChat';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function UserChatArea() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <div className="p-8 text-center text-neutral-500">Effettua il login per accedere alla chat.</div>;
  }

  return <UserAdminGroupChat user={user} />;
}
