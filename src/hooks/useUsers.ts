import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  numero_telefono: string | null;
  nome_utente: string;
  role: string;
  created_at: string;
  updated_at: string | null;
};

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[useUsers] Fetched users:', data, error);
      if (error) throw error;
      setUsers(data || []);
      setTimeout(() => {
        console.log('[useUsers] Stato users dopo set:', data || []);
      }, 100);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Successo",
        description: "Ruolo utente aggiornato con successo",
      });
    } catch (error) {
      console.error('Errore aggiornamento ruolo:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== userId));

      toast({
        title: "Successo",
        description: "Utente eliminato con successo",
      });
    } catch (error) {
      console.error('Errore eliminazione utente:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'utente",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Implementazione per attivare/disattivare utente
      // Nota: Questa funzionalità richiede una colonna is_active nella tabella user_profiles
      toast({
        title: "Info",
        description: "Funzionalità in sviluppo",
      });
    } catch (error) {
      console.error('Errore toggle status utente:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updateUserRole,
    deleteUser,
    toggleUserStatus,
    refetch: fetchUsers
  };
}