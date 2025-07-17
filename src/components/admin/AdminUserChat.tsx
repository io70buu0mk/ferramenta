import React, { useState, useMemo } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useUsers } from '@/hooks/useUsers';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';

export function AdminUserChat({ currentUser }) {
  const { messages, sendMessage, loading } = useMessages();
  const { users } = useUsers();
  const { role } = useUserRole(currentUser);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newMsg, setNewMsg] = useState('');

  // DEBUG LOG
  console.log('[AdminUserChat] users:', users);
  console.log('[AdminUserChat] currentUser:', currentUser, 'role:', role);

  // L'admin può chattare con chiunque, l'utente solo con admin
  const isAdmin = role === 'amministratore' || role === 'admin';
  const adminUser = users.find(u => u.role === 'amministratore' || u.role === 'admin');

  // Lista conversazioni disponibili
  const chatUsers = useMemo(() => {
    if (isAdmin) {
      return users.filter(u => u.id !== currentUser.id);
    } else {
      return adminUser ? [adminUser] : [];
    }
  }, [isAdmin, users, currentUser.id, adminUser]);

  // Messaggi della conversazione selezionata
  const chatMessages = useMemo(() => {
    if (!selectedUserId) return [];
    return messages.filter(m =>
      (m.sender_id === currentUser.id && m.recipient_id === selectedUserId) ||
      (m.sender_id === selectedUserId && m.recipient_id === currentUser.id)
    );
  }, [messages, selectedUserId, currentUser.id]);

  const handleSend = async () => {
    if (!newMsg || !selectedUserId) return;
    await sendMessage({
      recipient_id: selectedUserId,
      content: newMsg,
      message_type: 'user_group'
    });
    setNewMsg('');
  };

  return (
    <div className="flex h-full">
      {/* Lista utenti/conversazioni */}
      <div className="w-64 border-r bg-neutral-50 p-4 overflow-y-auto">
        <h3 className="font-bold mb-4">Conversazioni</h3>
        <ul className="space-y-2">
          {chatUsers.map(u => (
            <li key={u.id}>
              <Button
                variant={selectedUserId === u.id ? 'default' : 'outline'}
                className="w-full flex items-center gap-2"
                onClick={() => setSelectedUserId(u.id)}
              >
                <User size={16} />
                {u.nome} {u.cognome}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          {selectedUserId ? (
            <>
              <div className="mb-4">
                <h4 className="font-semibold">Chat con {chatUsers.find(u => u.id === selectedUserId)?.nome}</h4>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto flex flex-col">
                {chatMessages.length === 0 && <div className="text-neutral-400">Nessun messaggio</div>}
                {chatMessages.map((msg, idx) => {
                  const isMine = msg.sender_id === currentUser.id;
                  const sender = isMine
                    ? { nome: 'Tu', cognome: '' }
                    : chatUsers.find(u => u.id === msg.sender_id) || { nome: 'Utente', cognome: '' };
                  const time = msg.created_at ? new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm flex flex-col ${isMine ? 'bg-green-200 text-right items-end' : 'bg-white border text-left items-start'}`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <span className="text-base whitespace-pre-line">{msg.content}</span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          {!isMine && <span className="font-semibold text-green-700">{sender.nome} {sender.cognome}</span>}
                          <span>{time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-neutral-400 flex items-center justify-center h-full">Seleziona una conversazione</div>
          )}
        </div>
        {/* Input invio messaggio */}
        {selectedUserId && (
          <form className="flex gap-2 p-4 border-t bg-neutral-50" onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <Textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Scrivi un messaggio..."
              rows={2}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMsg || loading}>Invia</Button>
          </form>
        )}
      </div>
    </div>
  );
}
