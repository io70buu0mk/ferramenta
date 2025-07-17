
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'chat' | string; // supporta custom
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carica tutte le notifiche dell'utente loggato
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le notifiche',
        variant: 'destructive',
      });
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [toast]);

  // Segna una notifica come letta
  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    }
  }, []);

  // API semplice per aggiungere una notifica
  const addNotification = useCallback(async (params: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'chat' | string;
    link?: string;
  }) => {
    const { userId, title, message, type, link } = params;
    const { error } = await (supabase as any)
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          link: link || null,
        },
      ]);
    if (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile creare la notifica',
        variant: 'destructive',
      });
    } else {
      fetchNotifications();
    }
  }, [toast, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    // opzionale: polling o realtime
    // eslint-disable-next-line
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    addNotification,
    refetch: fetchNotifications
  };
}