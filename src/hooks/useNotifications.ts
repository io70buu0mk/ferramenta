

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
    adminId: string;
  }) => {
    const { userIds, title, message, type, link, adminId } = params;
    console.log('[DEBUG] addNotification - params:', params);
    // 1. Crea la notifica generica
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert([
        { title, message, type, link: link || null, created_by: adminId }
      ])
      .select();
    console.log('[DEBUG] addNotification - notifData:', notifData, 'notifError:', notifError);
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
    console.log('[DEBUG] addNotification - userNotifError:', userNotifError);
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

/**
 * Carica tutte le notifiche inviate dall'admin e lo stato di lettura per ogni utente destinatario
 * Restituisce: [{ id, title, message, type, created_at, destinatari: [{ userId, nome, cognome, is_read }] }]
 */
export async function fetchAdminNotifications(adminId: string) {
  console.log('[useNotifications] fetchAdminNotifications chiamata con adminId:', adminId);
  if (!adminId) {
    console.log('[useNotifications] adminId non fornito, ritorno array vuoto');
    return [];
  }
  // Query: prendi tutte le notifiche create da adminId, con join su user_notifications e user_profiles
  const { data, error } = await supabase
    .from('notifications')
    .select(`id, title, message, type, created_at, user_notifications(user_id, is_read, user_profiles(id, nome, cognome))`)
    .eq('created_by', adminId)
    .order('created_at', { ascending: false });
  console.log('[useNotifications] Risultato query supabase:', { data, error });
  if (error) {
    console.error('[useNotifications] Errore fetchAdminNotifications:', error);
    return [];
  }
  // Mappa i destinatari per ogni notifica usando user_profiles
  const mapped = (data || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    created_at: n.created_at,
    destinatari: (n.user_notifications || []).map((u: any) => ({
      userId: u.user_id,
      nome: u.user_profiles?.nome || '',
      cognome: u.user_profiles?.cognome || '',
      is_read: u.is_read
    }))
  }));
  console.log('[useNotifications] Notifiche inviate mappate:', mapped);
  return mapped;
}