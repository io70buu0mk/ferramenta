import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Plus, X, Settings } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

// Tipi base
interface User {
  id: string;
  nome: string;
  cognome: string;
  role: string;
}

interface Props {
  adminId: string;
}

export default function AdminChat({ adminId }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { messages, loading: loadingMessages, sendMessage } = useChat(selectedConversation?.id || null);

  // Carica utenti e conversazioni
  useEffect(() => {
    const fetchUsersAndConvs = async () => {
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("id, nome, cognome, role");
      console.log("USERS DATA (debug):", usersData, usersError);
      if (usersData) {
        setUsers(usersData);
        setTimeout(() => {
          console.log('[AdminChat] Stato users dopo set:', usersData);
        }, 100);
      } else setUsers([]);

      // Recupera tutte le conversazioni dove l'admin è coinvolto (come partecipante o user-admin)
      const { data: convParts } = await (supabase as any)
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', adminId);
      let convIds = convParts?.map((c: any) => c.conversation_id) || [];
      let { data: convs } = convIds.length > 0
        ? await (supabase as any)
            .from('conversation_with_participants')
            .select('*')
            .in('id', convIds)
        : { data: [] };
      setConversations(convs || []);
    };
    fetchUsersAndConvs();
  }, [adminId]);

  // Invia messaggio
  const handleSend = async () => {
    if (!message || !selectedConversation) return;
    setLoading(true);
    await sendMessage({
      conversation_id: selectedConversation.id,
      sender_id: adminId,
      sender_role: 'admin',
      sender_name: users.find(u => u.id === adminId)?.nome || 'Admin',
      content: message,
    });
    setMessage("");
    setLoading(false);
  };

  // Avvia una nuova chat privata (admin-admin o admin-user)
  const handleStartNewChat = async () => {
    if (!newChatUserId) return;
    setShowNewChat(false);
    setLoading(true);
    let conv = null;
    // Decodifica userId e ruolo dal valore selezionato
    let [targetId, role] = newChatUserId.split('-');
    // Forza minuscolo
    let myRole = (role === 'admin') ? 'amministratore' : 'cliente';
    let otherRole = (role === 'admin') ? 'amministratore' : 'cliente';
    if (targetId === adminId) {
      myRole = (role === 'admin') ? 'amministratore' : 'cliente';
      otherRole = (role === 'admin') ? 'cliente' : 'amministratore';
    }
    // Cerca una conversazione tra questi due utenti con questi ruoli
    const { data: convParts1 } = await (supabase as any)
      .from('conversation_participants')
      .select('conversation_id,role_in_conversation')
      .eq('user_id', adminId)
      .eq('role_in_conversation', myRole);
    const { data: convParts2 } = await (supabase as any)
      .from('conversation_participants')
      .select('conversation_id,role_in_conversation')
      .eq('user_id', targetId)
      .eq('role_in_conversation', otherRole);
    const ids1 = convParts1?.map((c: any) => c.conversation_id) || [];
    const ids2 = convParts2?.map((c: any) => c.conversation_id) || [];
    const common = ids1.filter((id: string) => ids2.includes(id));
    let { data: convs } = common.length > 0
      ? await (supabase as any).from('conversations').select('*').in('id', common)
      : { data: [] };
    conv = (convs || [])[0];
    if (!conv) {
      // Crea nuova conversazione
      const { data: newConv } = await (supabase as any).from('conversations').insert([{ type: 'admin-admin' }]).select().single();
      await (supabase as any).from('conversation_participants').insert([
        { conversation_id: newConv.id, user_id: adminId, role_in_conversation: myRole },
        { conversation_id: newConv.id, user_id: targetId, role_in_conversation: otherRole }
      ]);
      conv = newConv;
    }
    setSelectedConversation(conv);
    setLoading(false);
  };

  return (
    <div className="flex h-full min-h-[500px] bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar conversazioni */}
      <div className="w-80 border-r bg-neutral-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-lg">Conversazioni</span>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setShowSettings(true)} title="Impostazioni chat">
              <Settings size={20} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setShowNewChat(true)} title="Nuova chat">
              <Plus size={20} />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center text-neutral-400 py-8">Nessuna conversazione</div>
          )}
          <ul>
            {conversations.map(conv => {
              const partecipanti = (conv.participants || []).filter((p: any) => p.user_id !== adminId);
              const adminPartecipants = partecipanti.filter((p: any) => p.role_in_conversation === 'amministratore');
              const clientPartecipants = partecipanti.filter((p: any) => p.role_in_conversation === 'cliente');
              let label = partecipanti.length > 0 ? partecipanti.map((p: any) => `${p.nome} ${p.cognome}`).join(', ') : 'Conversazione';
              let badge = null;
              let avatar = <UserIcon size={24} className="text-green-600" />;
              let style = '';
              if (adminPartecipants.length > 0 && clientPartecipants.length === 0) {
                badge = <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">admin</span>;
                avatar = <UserIcon size={24} className="text-green-600" />;
                style = 'border-l-4 border-green-500 bg-green-50';
              } else if (clientPartecipants.length > 0 && adminPartecipants.length === 0) {
                badge = <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">cliente</span>;
                avatar = <UserIcon size={24} className="text-blue-600" />;
                style = 'border-l-4 border-blue-500 bg-blue-50';
              } else if (adminPartecipants.length > 0 && clientPartecipants.length > 0) {
                badge = <span className="ml-2 text-xs bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded px-2 py-0.5">admin/cliente</span>;
                avatar = <UserIcon size={24} className="text-purple-600" />;
                style = 'border-l-4 border-purple-500 bg-purple-50';
              }
              return (
                <li key={conv.id}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-100 transition text-left ${selectedConversation?.id === conv.id ? 'bg-green-100 font-semibold' : ''} ${style}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    {avatar}
                    <span className="truncate flex-1">{label}</span>
                    {badge}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* Area messaggi */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header area messaggi */}
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-white min-h-[60px]">
          {selectedConversation ? (
            (() => {
              // Trova i partecipanti diversi da me
              const partecipanti = (selectedConversation.participants || []).filter((p: any) => p.user_id !== adminId);
              // Se non ci sono partecipanti diversi da me, prendi comunque il mio profilo
              let label = '';
              if (partecipanti.length > 0) {
                label = partecipanti.map((p: any) => `${p.nome} ${p.cognome}`).join(', ');
              } else if (selectedConversation.participants && selectedConversation.participants.length === 1) {
                // Chat con se stessi
                const p = selectedConversation.participants[0];
                label = `${p.nome} ${p.cognome}`;
              } else {
                label = 'Conversazione';
              }
              const adminPartecipants = partecipanti.filter((p: any) => p.role_in_conversation === 'amministratore');
              const clientPartecipants = partecipanti.filter((p: any) => p.role_in_conversation === 'cliente');
              let avatar = <UserIcon size={28} className="text-green-600" />;
              let badge = null;
              if (adminPartecipants.length > 0 && clientPartecipants.length === 0) {
                badge = <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">admin</span>;
                avatar = <UserIcon size={28} className="text-green-600" />;
              } else if (clientPartecipants.length > 0 && adminPartecipants.length === 0) {
                badge = <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">cliente</span>;
                avatar = <UserIcon size={28} className="text-blue-600" />;
              } else if (adminPartecipants.length > 0 && clientPartecipants.length > 0) {
                badge = <span className="ml-2 text-xs bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded px-2 py-0.5">admin/cliente</span>;
                avatar = <UserIcon size={28} className="text-purple-600" />;
              }
              return (
                <>
                  {avatar}
                  <span className="font-bold text-lg">{label}</span>
                  {badge}
                  <Button size="icon" variant="ghost" className="ml-auto" onClick={() => setSelectedConversation(null)} title="Chiudi">
                    <X size={20} />
                  </Button>
                </>
              );
            })()
          ) : (
            <span className="text-neutral-400">Seleziona una conversazione</span>
          )}
        </div>
        {/* Messaggi */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-neutral-50">
          {!selectedConversation || messages.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">Nessun messaggio</div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map(m => {
                const isMine = m.sender_id === adminId;
                const sender = isMine ? 'Tu' : (users.find(u => u.id === m.sender_id)?.nome || 'Admin');
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm flex flex-col ${isMine ? 'bg-green-200 text-right items-end' : 'bg-white border text-left items-start'}`}
                      style={{ wordBreak: 'break-word' }}>
                      <span className="text-base whitespace-pre-line">{m.content}</span>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        {!isMine && <span className="font-semibold text-green-700">{sender}</span>}
                        <span>{new Date(m.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Input invio messaggio */}
        {selectedConversation && (
          <form className="flex gap-2 p-4 border-t bg-white" onSubmit={e => { e.preventDefault(); handleSend(); }}>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={!message || loading}>Invia</Button>
          </form>
        )}
      </div>
      {/* Modal nuova chat */}
      {showNewChat && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setShowNewChat(false)}><X size={20} /></button>
            <h3 className="font-bold mb-2 flex items-center gap-2"><Plus size={18}/> Nuova chat</h3>
            <Input
              placeholder="Cerca utente o admin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-48 overflow-y-auto mb-2">
              {/* Sezione amministratori */}
              <div className="mb-2">
                <div className="text-xs font-bold text-green-700 mb-1 pl-1">Amministratori</div>
                {users.filter(u => u.role === 'amministratore' && (`${u.nome} ${u.cognome}`.toLowerCase().includes(search.toLowerCase()) || search === ""))
                  .map(u => (
                    <button
                      key={u.id + '-admin'}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-green-100 flex items-center gap-2 ${newChatUserId === u.id + '-admin' ? 'bg-green-200 border border-green-400' : ''}`}
                      onClick={() => setNewChatUserId(u.id + '-admin')}
                    >
                      <UserIcon size={20} className="text-green-600" />
                      <span className="font-semibold text-green-800">{u.nome} {u.cognome}</span>
                      <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">admin</span>
                    </button>
                  ))}
                {users.filter(u => u.role === 'amministratore' && (`${u.nome} ${u.cognome}`.toLowerCase().includes(search.toLowerCase()) || search === "")).length === 0 && (
                  <div className="text-neutral-300 text-xs italic pl-2">Nessun amministratore</div>
                )}
              </div>
              {/* Sezione clienti */}
              <div className="mb-2">
                <div className="text-xs font-bold text-blue-700 mb-1 pl-1">Clienti</div>
                {users.filter(u => ((u.role !== 'amministratore') || u.role === 'amministratore') && (`${u.nome} ${u.cognome}`.toLowerCase().includes(search.toLowerCase()) || search === ""))
                  .map(u => (
                    <button
                      key={u.id + '-cliente'}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-blue-100 flex items-center gap-2 ${newChatUserId === u.id + '-cliente' ? 'bg-blue-200 border border-blue-400' : ''}`}
                      onClick={() => setNewChatUserId(u.id + '-cliente')}
                    >
                      <UserIcon size={20} className="text-blue-600" />
                      <span className="font-semibold text-blue-800">{u.nome} {u.cognome}</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">cliente</span>
                    </button>
                  ))}
                {users.filter(u => ((u.role !== 'amministratore') || u.role === 'amministratore') && (`${u.nome} ${u.cognome}`.toLowerCase().includes(search.toLowerCase()) || search === "")).length === 0 && (
                  <div className="text-neutral-300 text-xs italic pl-2">Nessun cliente</div>
                )}
              </div>
              {/* Nessun risultato globale */}
              {users.filter(u => (`${u.nome} ${u.cognome}`.toLowerCase().includes(search.toLowerCase()) || search === "")).length === 0 && (
                <div className="text-neutral-400 text-center py-4">Nessun risultato</div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleStartNewChat} disabled={!newChatUserId}>Avvia</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewChat(false)}>Annulla</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal impostazioni chat */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setShowSettings(false)}><X size={20} /></button>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> Gestione chat</h3>
            <div className="max-h-64 overflow-y-auto mb-4">
              <ul>
                {conversations.map(conv => {
                  const partecipanti = (conv.participants || []).filter((p: any) => p.user_id !== adminId);
                  const label = partecipanti.length > 0 ? partecipanti.map((p: any) => `${p.nome} ${p.cognome}`).join(', ') : 'Conversazione';
                  return (
                    <li key={conv.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="truncate flex-1">{label}</span>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        await (supabase as any).from('conversation_participants').delete().eq('conversation_id', conv.id);
                        await (supabase as any).from('chat_messages').delete().eq('conversation_id', conv.id);
                        await (supabase as any).from('conversations').delete().eq('id', conv.id);
                        setConversations(conversations.filter(c => c.id !== conv.id));
                        setSelectedConversation(null);
                      }}>Elimina</Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>Chiudi</Button>
          </div>
        </div>
      )}
    </div>
  );
}
