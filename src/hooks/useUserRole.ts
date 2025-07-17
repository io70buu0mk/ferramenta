
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Gestisce i cambiamenti dell'utente solo quando l'ID cambia davvero
  useEffect(() => {
    const newUserId = user?.id || null;
    
    if (newUserId !== userId) {
      setUserId(newUserId);
      
      if (!newUserId) {
        setRole(null);
        setLoading(false);
        return;
      }
      
      // Inizializza loading solo quando cambia utente
      setLoading(true);
    }
  }, [user, userId]);

  // Fetch del ruolo solo quando userId cambia
  useEffect(() => {
    if (!userId) return;

    const fetchUserRole = async () => {
      try {
        console.log('🔍 Recupero ruolo per utente:', userId);
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Errore recupero profilo:', profileError);
          const isAdminEmail = user?.email?.includes('.admin') || false;
          setRole(isAdminEmail ? 'Amministratore' : 'Cliente');
        } else {
          console.log('✅ Ruolo recuperato dal database:', profile.role);
          const normalizedRole = profile.role === 'amministratore' ? 'Amministratore' : 'Cliente';
          setRole(normalizedRole);
        }
      } catch (error) {
        console.error('💥 Errore generico recupero ruolo:', error);
        const isAdminEmail = user?.email?.includes('.admin') || false;
        setRole(isAdminEmail ? 'Amministratore' : 'Cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId, user?.email]);

  const hasPermission = useCallback(async () => false, []);
  
  const isAdmin = useCallback(() => {
    const result = role === 'Amministratore';
    console.log('🔎 Controllo admin - Ruolo corrente:', role, '- È admin:', result);
    return result;
  }, [role]);

  // Memoizza il risultato per evitare re-render inutili
  const memoizedResult = useMemo(() => ({
    role,
    loading,
    hasPermission,
    isAdmin
  }), [role, loading, hasPermission, isAdmin]);

  return memoizedResult;
}
