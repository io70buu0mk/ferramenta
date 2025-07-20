

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Notification = {
  id: string; // id user_notifications
  notification_id: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carica tutte le notifiche dell'utente loggato (join user_notifications + notifications)
  const fetchNotifications = useCallback(async (userId?: string) => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_notifications')
      .select('id, notification_id, user_id, is_read, created_at, notifications(title, message, type, link)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le notifiche',
        variant: 'destructive',
      });
      setNotifications([]);
    } else {
      setNotifications((data || []).map((row: any) => ({
        id: row.id,
        notification_id: row.notification_id,
        user_id: row.user_id,
        is_read: row.is_read,
        created_at: row.created_at,
        title: row.notifications?.title,
        message: row.notifications?.message,
        type: row.notifications?.type,
        link: row.notifications?.link,
      })));
    }
    setLoading(false);
  }, [toast]);

  // Segna una notifica come letta
  const markAsRead = useCallback(async (userNotificationId: string) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', userNotificationId);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === userNotificationId ? { ...n, is_read: true } : n));
    }
  }, []);

  // API per aggiungere una notifica multipla
  const addNotification = useCallback(async (params: {
    userIds: string[];
    title: string;
    message: string;
    type: string;
    link?: string;
  }) => {
    const { userIds, title, message, type, link } = params;
    // 1. Crea la notifica generica
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert([
        { title, message, type, link: link || null }
      ])
      .select();
    if (notifError || !notifData || !notifData[0]) {
      toast({
        title: 'Errore',
        description: 'Impossibile creare la notifica',
        variant: 'destructive',
      });
      return;
    }
    const notification_id = notifData[0].id;
    // 2. Crea una riga user_notifications per ogni destinatario
    const inserts = userIds.map(uid => ({
      notification_id,
      user_id: uid,
      is_read: false
    }));
    const { error: userNotifError } = await supabase
      .from('user_notifications')
      .insert(inserts);
    if (userNotifError) {
      toast({
        title: 'Errore',
        description: 'Impossibile associare la notifica agli utenti',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    notifications,
    loading,
    markAsRead,
    addNotification,
    refetch: fetchNotifications
  };
}