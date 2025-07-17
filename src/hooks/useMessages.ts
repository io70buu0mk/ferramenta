import { useState, useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Vecchia definizione Message rimossa, ora usiamo solo la nuova
export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'user_group' | 'admin_private';
  content: string;
  created_at: string;
};

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // fetchMessages legacy rimossa, usiamo solo la versione aggiornata con filtri
  const fetchMessages = async (filter?: {
    recipient_id?: string;
    message_type?: 'user_group' | 'admin_private';
    admin_pair?: { me: string; other: string };
  }) => {
    try {
      let query = supabase
        .from('messages')
        .select('id,sender_id,recipient_id,message_type,content,created_at')
        .order('created_at', { ascending: true });

      if (filter?.message_type === 'user_group' && filter.recipient_id) {
        query = query.eq('recipient_id', filter.recipient_id).eq('message_type', 'user_group');
      } else if (filter?.message_type === 'admin_private' && filter.admin_pair) {
        const { me, other } = filter.admin_pair;
        query = query.eq('message_type', 'admin_private')
          .or(`and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Errore caricamento messaggi:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i messaggi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // markAsRead rimosso: la tabella non ha più is_read

  // sendMessage legacy rimossa, usiamo solo la versione aggiornata
  const sendMessage = async (messageData: {
    recipient_id: string;
    subject: string;
    content: string;
    message_type: 'user_group' | 'admin_private' | 'system';
    type?: 'info' | 'warning' | 'error' | 'success' | 'chat' | string; // supporta custom
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            recipient_id: messageData.recipient_id,
            subject: messageData.subject,
            content: messageData.content,
            message_type: messageData.message_type
          } as any
        ])
        .select()
        .single();

      if (error) throw error;

      // Notifica il destinatario
      if (messageData.message_type === 'system') {
        await addNotification({
          userId: messageData.recipient_id,
          title: messageData.subject,
          message: messageData.content,
          type: messageData.type || 'info',
          link: undefined
        });
      } else {
        await addNotification({
          userId: messageData.recipient_id,
          title: 'Nuovo messaggio',
          message: messageData.content,
          type: 'chat',
          link: `/chat/${data?.id || ''}`
        });
      }

      toast({
        title: "Successo",
        description: "Messaggio inviato con successo",
      });
      return data;
    } catch (error) {
      console.error('Errore invio messaggio:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive",
      });
      throw error;
    }
  };

  // useEffect lasciato commentato: la fetch va fatta con i parametri giusti

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage
  };
}