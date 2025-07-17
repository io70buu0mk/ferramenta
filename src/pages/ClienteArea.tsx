import { useEffect, useState } from "react";
import CartSection from '../components/user/CartSection';
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

type UserProfile = { id: string, email: string, nome: string, cognome: string, nome_utente: string, numero_telefono: string | null };

export default function ClienteArea() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.replace("/auth");
        return;
      }
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(prof);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setProfile(null);
        return;
      }
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
          setProfile(null);
          setLoading(false);
          return;
        }
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(prof);
        setLoading(false);
      });
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-2">
      <div className="bg-white rounded-lg shadow max-w-xl w-full p-8">
        <div className="mb-2 text-sm text-gray-500">Area Cliente</div>
        <div className="mb-4 text-xl font-bold text-[#b43434]">{profile.email}</div>
        <div className="grid gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded flex-col items-start">
            <span className="mb-2 font-semibold">Carrello</span>
            <CartSection />
          </div>
          <div className="bg-gray-50 p-3 rounded flex justify-between items-center">
            <span>Preferiti</span>
            <span className="text-gray-400">[nessun preferito]</span>
          </div>
          <div className="bg-gray-50 p-3 rounded flex justify-between items-center">
            <span>Ordini effettuati</span>
            <span className="text-gray-400">[nessun ordine]</span>
          </div>
        </div>
        {/* Notifiche utente: ban unico per chat e sistema */}
        <div className="mb-6">
          <div className="font-bold text-lg mb-2 text-[#b43434]">Notifiche</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="text-neutral-400 text-sm">Nessuna notifica</div>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors flex flex-col ${!n.is_read ? 'border-[#b43434] bg-red-50' : 'border-neutral-200'}`}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${n.type === 'chat' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{n.type === 'chat' ? 'Chat' : 'Sistema'}</span>
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.is_read && <span className="ml-2 w-2 h-2 bg-[#b43434] rounded-full"></span>}
                </div>
                <div className="text-xs text-neutral-700 mb-1">{n.message}</div>
                <div className="text-xs text-neutral-400">{new Date(n.created_at).toLocaleString('it-IT')}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <a href="/" className="text-[#b43434] underline">Home</a>
          <button
            className="bg-white text-[#b43434] border border-[#b43434] px-4 py-2 rounded hover:bg-[#f8e8e3] transition"
            onClick={async () => { await supabase.auth.signOut(); window.location.replace("/"); }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
