import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Conversation, ChatMessage } from '../types/chat';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook per la chat user-admin (gruppo: utente + tutti gli admin)
export function useAdminUserChat(userId: string | null) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Recupera o crea la conversazione user-admin
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('conversations')
      .select('*')
      .eq('type', 'user-admin')
      .eq('user_id', userId)
      .single()
      .then(async ({ data, error }) => {
        if (data) {
          setConversation(data);
        } else {
          // Se non esiste, la crea
          const { data: newConv } = await supabase
            .from('conversations')
            .insert([{ type: 'user-admin', user_id: userId }])
            .select()
            .single();
          setConversation(newConv);
        }
        setLoading(false);
      });
  }, [userId]);

  // Carica messaggi e subscribe realtime
  useEffect(() => {
    if (!conversation) return;
    setLoading(true);
    supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Invia messaggio
  const sendMessage = useCallback(async (msg: Omit<ChatMessage, 'id' | 'created_at' | 'conversation_id'>) => {
    if (!conversation) return;
    await supabase.from('chat_messages').insert([
      { ...msg, conversation_id: conversation.id }
    ]);
  }, [conversation]);

  return { conversation, messages, loading, sendMessage };
}
