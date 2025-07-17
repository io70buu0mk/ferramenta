import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  Mail,
  Plus,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import AdminChat from './AdminChat';
import { supabase } from '@/integrations/supabase/client';
// Wrapper per ottenere l'adminId corrente e passarlo ad AdminChat
function AdminChatWrapper() {
  const [adminId, setAdminId] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminId(data?.user?.id || null);
    });
  }, []);
  if (!adminId) return <div className="p-8 text-center text-neutral-500">Effettua il login come amministratore per accedere alla chat.</div>;
  return <AdminChat adminId={adminId} />;
}

import { useMessages } from '@/hooks/useMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { useUsers } from '@/hooks/useUsers';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';


export function CommunicationCenter() {
  // State per la modale e i campi della nuova tipologia
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeValue, setNewTypeValue] = useState('');
  const [newTypeColorIdx, setNewTypeColorIdx] = useState(0);
  const { messages, loading: messagesLoading, sendMessage } = useMessages();
  const { notifications, markAsRead, addNotification } = useNotifications();
  const navigate = useNavigate();
  const { users } = useUsers();

  // Palette di colori (max 20)
  const colorPalette = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
    { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    { bg: 'bg-neutral-100', text: 'text-neutral-800', border: 'border-neutral-300' },
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
    { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' },
  ];

  // Tipologie predefinite (non modificabili nel nome)
  const defaultTypes = [
    { value: 'info', label: 'Info', color: colorPalette[0] },
    { value: 'warning', label: 'Attenzione', color: colorPalette[1] },
    { value: 'error', label: 'Errore', color: colorPalette[2] },
    { value: 'success', label: 'Successo', color: colorPalette[3] },
  ];

  // Tipologie custom (gestite in localStorage)
  const [customTypes, setCustomTypes] = useState<{ value: string, label: string, color: typeof colorPalette[0] }[]>([]);

  // Carica customTypes da localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customNotificationTypes');
    if (saved) setCustomTypes(JSON.parse(saved));
  }, []);
  // Salva customTypes su localStorage
  useEffect(() => {
    localStorage.setItem('customNotificationTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  // Unione tipi
  const messageTypes = [
    ...defaultTypes,
    ...customTypes
  ];
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipient_ids: [] as string[],
    type: 'info', // default tipologia
    toAll: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'system' | 'chat'>('system');

  const handleSendMessage = async () => {
    try {
      if (newMessage.toAll) {
        for (const user of users) {
          await sendMessage({
            recipient_id: user.id,
            subject: newMessage.subject,
            content: newMessage.content,
            message_type: 'system', // non chat!
            type: newMessage.type
          });
        }
      } else if (newMessage.recipient_ids.length > 0) {
        for (const id of newMessage.recipient_ids) {
          await sendMessage({
            recipient_id: id,
            subject: newMessage.subject,
            content: newMessage.content,
            message_type: 'system',
            type: newMessage.type
          });
        }
      } else {
        return;
      }
      setNewMessage({
        subject: '',
        content: '',
        recipient_ids: [],
        type: 'info',
        toAll: false
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Errore invio messaggio:', error);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      case 'success':
        return <Check size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className="w-full max-w-[200vw] mx-auto py-10 flex flex-col items-center">
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">Centro Comunicazioni</h2>
        <p className="text-base text-neutral-600 mb-4">Gestisci messaggi, notifiche e comunicazioni agli utenti</p>
        <Button
          className="flex items-center gap-2 px-6 py-3 text-base rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-md"
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare size={20} />
          Apri Chat
        </Button>
      </div>
      <div className="flex flex-row flex-nowrap justify-center items-start gap-16 w-full min-h-[400px] px-8">
        {/* Colonna sinistra: invio notifiche */}
        <div className="flex-1 max-w-xl">
          <Card className="h-full shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus size={18} />
                Invia nuova comunicazione
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium">Destinatari</label>
                <div className="flex flex-col gap-1 max-h-28 overflow-y-auto border rounded p-1 bg-neutral-50">
                  <label className="flex items-center gap-2 font-medium">
                    <Checkbox
                      checked={newMessage.toAll}
                      onCheckedChange={(checked) => setNewMessage(prev => ({ ...prev, toAll: !!checked, recipient_ids: checked ? users.map(u => u.id) : [] }))}
                    />
                    Tutti
                  </label>
                  {!newMessage.toAll && users.map(user => (
                    <label key={user.id} className="flex items-center gap-2 text-xs">
                      <Checkbox
                        checked={newMessage.recipient_ids.includes(user.id)}
                        onCheckedChange={(checked) => {
                          setNewMessage(prev => {
                            const ids = checked
                              ? [...prev.recipient_ids, user.id]
                              : prev.recipient_ids.filter(id => id !== user.id);
                            return { ...prev, recipient_ids: ids };
                          });
                        }}
                      />
                      {user.nome} {user.cognome}
                    </label>
                  ))}
                </div>

                <label className="text-xs font-semibold mt-3 mb-1">Tipologia</label>
                <div className="flex items-center gap-2">
                  <Select value={newMessage.type} onValueChange={(value) => setNewMessage(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-white border border-neutral-300 rounded px-2 py-1 min-w-[140px] focus:ring-2 focus:ring-blue-200 outline-none flex items-center gap-2">
                      <SelectValue>
                        {(() => {
                          const t = messageTypes.find(t => t.value === newMessage.type);
                          return t ? (
                            <span className={`inline-flex items-center gap-1`}>
                              <span className={`inline-block w-4 h-4 rounded ${t.color.bg} ${t.color.border} border mr-1`} />
                              <span className={`font-semibold text-xs ${t.color.text}`}>{t.label}</span>
                            </span>
                          ) : null;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-neutral-200 rounded shadow-lg">
                      {messageTypes.map(t => (
                        <SelectItem key={t.value} value={t.value} className="flex items-center gap-2">
                          <span className={`inline-block w-4 h-4 rounded ${t.color.bg} ${t.color.border} border mr-1`} />
                          <span className={`font-semibold text-xs ${t.color.text}`}>{t.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => setShowTypeModal(true)} title="Gestisci tipologie" className="ml-1 px-2 py-1 text-xs h-7">Gestisci</Button>
                </div>

        {/* Modale gestione tipologie */}
        <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
          <DialogContent className="max-w-md w-full p-0 bg-white rounded-xl shadow-2xl border border-neutral-200">
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle className="text-xl font-bold">Gestione tipologie di notifica</DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">Puoi aggiungere nuove tipologie, modificare nome/colore delle custom e cambiare solo il colore delle predefinite.</DialogDescription>
            </DialogHeader>
            <div className="px-4 pb-4 pt-2">
              {/* Elenco tipologie */}
              <div>
                <div className="font-semibold mb-3 text-base">Tipologie attuali</div>
                <div className="flex flex-col gap-2">
                  {messageTypes.map((t, idx) => (
                    <div key={t.value} className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5">
                      <span className={`min-w-[70px] px-2 py-1 rounded text-xs font-bold border ${t.color.bg} ${t.color.text} ${t.color.border} shadow-sm`}>{t.label}</span>
                      {idx < defaultTypes.length ? (
                        <>
                          <span className="text-xs text-neutral-400 ml-1">(predefinita)</span>
                          <select
                            className="ml-2 border border-neutral-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-200 outline-none transition"
                            value={t.color && t.color.bg}
                            onChange={e => {
                              const newColor = colorPalette.find(c => c.bg === e.target.value) || colorPalette[0];
                              const updated = [...defaultTypes];
                              updated[idx] = { ...updated[idx], color: newColor };
                              setCustomTypes(c => [...c]);
                            }}
                          >
                            {colorPalette.map(c => (
                              <option key={c.bg} value={c.bg}>{c.bg.replace('bg-', '')}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <Input
                            className="w-32 text-xs border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 outline-none"
                            value={t.label}
                            onChange={e => {
                              setCustomTypes(types => types.map(ct => ct.value === t.value ? { ...ct, label: e.target.value } : ct));
                            }}
                          />
                          <select
                            className="ml-2 border border-neutral-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-blue-200 outline-none transition"
                            value={t.color.bg}
                            onChange={e => {
                              setCustomTypes(types => types.map(ct => ct.value === t.value ? { ...ct, color: colorPalette.find(c => c.bg === e.target.value) || colorPalette[0] } : ct));
                            }}
                          >
                            {colorPalette.map(c => (
                              <option key={c.bg} value={c.bg}>{c.bg.replace('bg-', '')}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Separatore elegante */}
              <div className="my-4 border-t border-dashed border-neutral-300" />
              {/* Aggiungi nuova tipologia */}
              <div>
                <div className="font-semibold mb-2 text-base">Aggiungi nuova tipologia</div>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!newTypeLabel.trim() || !newTypeValue.trim()) return;
                  if (messageTypes.some(t => t.value === newTypeValue)) return;
                  setCustomTypes(types => [...types, { value: newTypeValue, label: newTypeLabel, color: colorPalette[newTypeColorIdx] }]);
                  setNewTypeLabel('');
                  setNewTypeValue('');
                  setNewTypeColorIdx(0);
                }} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome tipologia"
                      value={newTypeLabel}
                      onChange={e => setNewTypeLabel(e.target.value)}
                      className="w-40 border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <Input
                      placeholder="Valore univoco (es: custom-blue)"
                      value={newTypeValue}
                      onChange={e => setNewTypeValue(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                      className="w-40 border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 items-center mt-1">
                    {colorPalette.map((c, idx) => (
                      <button
                        type="button"
                        key={c.bg}
                        className={`w-6 h-6 rounded border-2 transition-all duration-100 ${c.bg} ${c.border} ${newTypeColorIdx === idx ? 'ring-2 ring-blue-500 scale-110' : 'hover:ring-2 hover:ring-blue-200'}`}
                        onClick={() => setNewTypeColorIdx(idx)}
                        aria-label={c.bg}
                      />
                    ))}
                  </div>
                  <Button type="submit" size="sm" className="mt-2 w-fit self-end px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition">Aggiungi</Button>
                </form>
              </div>
            </div>
            <DialogFooter className="px-4 pb-4 pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setShowTypeModal(false)} className="rounded px-4 py-1.5 border border-neutral-300 hover:bg-neutral-100">Chiudi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
                <label className="text-xs font-semibold mt-3 mb-1">Oggetto</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Oggetto"
                  className="bg-white border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <label className="text-xs font-semibold mt-3 mb-1">Messaggio</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Scrivi qui..."
                  rows={3}
                  className="bg-white border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.subject || !newMessage.content || (!newMessage.toAll && newMessage.recipient_ids.length === 0)}
                  className={`w-full mt-4 py-2 rounded font-semibold text-base shadow-sm transition ${(() => {
                    const t = messageTypes.find(t => t.value === newMessage.type);
                    return t ? `${t.color.bg} ${t.color.text}` : 'bg-blue-100 text-blue-700';
                  })()}`}
                >
                  <Send size={16} className="mr-2" />
                  Invia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Colonna destra: notifiche */}
        <div className="flex-1 max-w-xl">
          <Card className="h-full shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell size={18} />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <button
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${notifTab === 'system' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600 hover:bg-blue-50'}`}
                  onClick={() => setNotifTab('system')}
                >
                  Notifiche di sistema
                </button>
                <button
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${notifTab === 'chat' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600 hover:bg-green-50'}`}
                  onClick={() => setNotifTab('chat')}
                >
                  Notifiche chat
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notifTab === 'system' ? (
                  notifications.length > 0 ? notifications.filter(n => n.type !== 'chat').map((notification) => {
                    const typeDef = messageTypes.find(t => t.value === notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors ${typeDef ? typeDef.color.border : 'border-blue-300'} ${!notification.is_read ? (typeDef ? typeDef.color.bg + ' ' + typeDef.color.text : 'bg-blue-50') : 'border-neutral-200'}`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.link) navigate(notification.link);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                          <Badge className={typeDef ? `${typeDef.color.bg} ${typeDef.color.text}` : 'bg-blue-100 text-blue-700'}>
                              {getNotificationIcon(notification.type)}
                              {typeDef ? typeDef.label : notification.type}
                            </Badge>
                            <h4 className="font-medium text-sm text-neutral-800">
                              {notification.title}
                            </h4>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-700 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: it
                          })}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-neutral-500">
                      <Bell size={40} className="md:w-12 md:h-12 mx-auto mb-4 text-neutral-300" />
                      <p className="text-base md:text-lg font-medium mb-2">Nessuna notifica</p>
                      <p className="text-xs md:text-sm">Le notifiche di sistema appariranno qui</p>
                    </div>
                  )
                ) : (
                  notifications.filter(n => n.type === 'chat').length > 0 ? notifications.filter(n => n.type === 'chat').map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors ${!notification.is_read ? 'border-green-300 bg-green-50' : 'border-neutral-200'}`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) navigate(notification.link);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <MessageSquare size={14} className="inline mr-1" /> Chat
                          </Badge>
                          <h4 className="font-medium text-sm text-neutral-800">
                            {notification.title}
                          </h4>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-700 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: it
                        })}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-neutral-500">
                      <MessageSquare size={40} className="md:w-12 md:h-12 mx-auto mb-4 text-neutral-300" />
                      <p className="text-base md:text-lg font-medium mb-2">Nessuna notifica chat</p>
                      <p className="text-xs md:text-sm">Le notifiche delle chat appariranno qui</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Statistiche rapide in basso, compatte */}
      <div className="flex flex-wrap gap-2 mt-10 justify-center">
        <div className="flex items-center gap-1 px-3 py-2 rounded bg-white/80 border border-neutral-200/50 text-xs">
          <MessageSquare size={16} className="text-blue-600" />
          <span className="font-bold">{messages.length}</span> messaggi
        </div>
        {/* Rimosso conteggio messaggi non letti: la proprietà is_read non esiste più */}
        <div className="flex items-center gap-1 px-3 py-2 rounded bg-white/80 border border-neutral-200/50 text-xs">
          <Bell size={16} className="text-purple-600" />
          <span className="font-bold">{notifications.length}</span> notifiche
        </div>
        <div className="flex items-center gap-1 px-3 py-2 rounded bg-white/80 border border-neutral-200/50 text-xs">
          <Users size={16} className="text-green-600" />
          <span className="font-bold">{users.length}</span> utenti attivi
        </div>
      </div>
      {/* Modal chat */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="full-screen-modal flex flex-col bg-white z-50 max-w-5xl w-[90vw] h-[90vh] min-h-[600px] min-w-[350px] p-0">
          <DialogTitle asChild>
            <div className="flex items-center gap-3 px-8 py-6 border-b bg-gradient-to-r from-green-400/80 to-green-600/80 w-full relative">
              <MessageSquare size={28} className="text-white drop-shadow" />
              <span className="text-2xl font-bold text-white drop-shadow">Chat privata tra amministratori</span>
              {/* Pulsante X in alto a destra */}
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border-2 border-white text-white font-bold bg-green-700/70 hover:bg-green-800/90 transition-all text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Chiudi chat"
              >
                ✕
              </button>
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="sr-only">Chat privata tra amministratori. Seleziona una conversazione o avviane una nuova.</div>
          </DialogDescription>
          <div className="flex-1 flex flex-col bg-neutral-50 overflow-y-auto min-h-0 min-w-0 w-full h-full">
            <div className="flex-1 min-h-0 min-w-0 flex flex-col w-full h-full">
              {/* Chat solo tra amministratori */}
              <AdminChatWrapper />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}