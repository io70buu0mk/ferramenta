import React, { useState } from 'react';
import { useAdminUserChat } from '@/hooks/useAdminUserChat';
import { useUserRole } from '@/hooks/useUserRole';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface Props {
  user: User;
}

export default function UserAdminGroupChat({ user }: Props) {
  const { messages, loading, sendMessage } = useAdminUserChat(user.id);
  const { role } = useUserRole(user);
  const [msg, setMsg] = useState('');

  const handleSend = async () => {
    if (!msg) return;
    await sendMessage({
      sender_id: user.id,
      sender_role: role === 'Amministratore' ? 'admin' : 'user',
      sender_name: role === 'Amministratore' ? user.email : undefined,
      content: msg,
    });
    setMsg('');
  };

  return (
    <div className="border rounded-lg p-4 bg-white/90">
      <h2 className="font-bold mb-2">Chat Assistenza</h2>
      <div className="h-64 overflow-y-auto border rounded mb-2 bg-gray-50 p-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">Nessun messaggio</p>
        ) : (
          messages.map(m => (
            <div key={m.id} className="mb-2">
              <span className="font-semibold text-sm">
                {m.sender_role === 'admin'
                  ? (role === 'Amministratore' ? m.sender_name || 'Admin' : 'Messaggio da amministratore')
                  : (role === 'Amministratore' ? m.sender_name || 'Utente' : 'Tu')}
              </span>
              <span className="ml-2 text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
              <div className="ml-4">{m.content}</div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Scrivi un messaggio..."
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !msg}>
          Invia
        </Button>
      </div>
    </div>
  );
}
