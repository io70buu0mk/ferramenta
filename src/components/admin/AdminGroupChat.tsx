import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export default function AdminGroupChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel('admin-group-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (payload.new.message_type === 'admin_group') {
          const msg: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
          };
          setMessages(msgs => [...msgs, msg]);
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('id,sender_id,content,created_at')
      .eq('message_type', 'admin_group')
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user) return;
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: null,
      content: newMsg,
      message_type: 'admin_group',
      subject: '',
    });
    setNewMsg('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return <div className="p-8 text-center text-neutral-500">Effettua il login come amministratore per accedere alla chat.</div>;

  return (
    <div className="flex flex-col h-full max-h-[70vh] border rounded-lg bg-white">
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? <div>Caricamento...</div> :
          messages.length === 0 ? <div className="text-neutral-400">Nessun messaggio</div> :
            messages.map(msg => (
              <div key={msg.id} className={`mb-2 ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-2xl ${msg.sender_id === user.id ? 'bg-green-200' : 'bg-neutral-100'}`}>
                  <span className="block text-sm font-semibold">{msg.sender_id === user.id ? 'Tu' : msg.sender_id}</span>
                  <span className="block whitespace-pre-line">{msg.content}</span>
                  <span className="block text-xs text-neutral-400 mt-1">{new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
        }
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t bg-neutral-50">
        <Textarea
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Scrivi un messaggio..."
          rows={2}
          className="flex-1"
        />
        <Button type="submit" disabled={!newMsg.trim()}>Invia</Button>
      </form>
    </div>
  );
}
