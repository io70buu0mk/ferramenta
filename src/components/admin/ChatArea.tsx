import React from 'react';
import { AdminUserChat } from './AdminUserChat';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function ChatArea() {
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

  return <AdminUserChat currentUser={user} />;
}
