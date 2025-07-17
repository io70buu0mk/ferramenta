import { useEffect, useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, ConversationType, ConversationParticipant, ChatMessage } from '../types/chat';

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    (supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }: any) => {
        setMessages(data || []);
        setLoading(false);
      });
    // Realtime subscription
    const channel = (supabase as any)
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (msg: Omit<ChatMessage, 'id' | 'created_at'>) => {
    // Invia il messaggio
    const { data, error } = await (supabase as any).from('chat_messages').insert([msg]).select().single();
    if (!error && data) {
      // Notifica il destinatario (solo se diverso dal mittente)
      const recipientId = msg.sender_role === 'admin' ?
        // Se admin, cerca l'altro partecipante
        (await (supabase as any)
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', msg.conversation_id)
          .neq('user_id', msg.sender_id)
        ).data?.[0]?.user_id :
        // Se user, notifica l'admin (assumiamo che admin sia partecipante)
        (await (supabase as any)
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', msg.conversation_id)
          .neq('user_id', msg.sender_id)
        ).data?.[0]?.user_id;
      if (recipientId) {
        await addNotification({
          userId: recipientId,
          title: 'Nuovo messaggio in chat',
          message: msg.content,
          type: 'chat',
          link: `/chat/${msg.conversation_id}`
        });
      }
    }
  }, [addNotification]);

  return { messages, loading, sendMessage };
}

// Funzione per creare conversazione user-admin
export async function createUserAdminConversation(user_id: string) {
  const { data, error } = await (supabase as any).from('conversations').insert([
    { type: 'user-admin', user_id }
  ]).select().single();
  if (error) throw error;
  return data as Conversation;
}

// Funzione per creare conversazione admin-admin
export async function createAdminAdminConversation(admin1: string, admin2: string) {
  const { data: conv, error } = await (supabase as any).from('conversations').insert([
    { type: 'admin-admin' }
  ]).select().single();
  if (error) throw error;
  const conversation_id = conv.id;
  await (supabase as any).from('conversation_participants').insert([
    { conversation_id, user_id: admin1, role_in_conversation: 'amministratore' },
    { conversation_id, user_id: admin2, role_in_conversation: 'amministratore' }
  ]);
  return conv as Conversation;
}
