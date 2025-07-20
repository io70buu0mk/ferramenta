import { useEffect, useState } from "react";
import CartSection from '../components/user/CartSection';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import Notifications from '../components/user/Notifications';
import { FiBell } from 'react-icons/fi';


type UserProfile = { id: string, email: string, nome: string, cognome: string, nome_utente: string, numero_telefono: string | null };

export default function ClienteArea() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificheCount, setNotificheCount] = useState(0);
  const navigate = useNavigate();

  // Polling per badge notifiche non lette
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchCount = async () => {
      if (!profile) return;
      const { data, error } = await supabase
        .from("notifications")
        .select("id, is_read")
        .eq("user_id", profile.id)
        .eq("is_read", false);
      if (!error && data) setNotificheCount(data.length);
    };
    fetchCount();
    interval = setInterval(fetchCount, 1000);
    return () => clearInterval(interval);
  }, [profile]);

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
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-500">Area Cliente</div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[#b43434] underline">Home</a>
            <button
              className="relative flex items-center justify-center w-10 h-10 bg-white border border-[#b43434] rounded-full hover:bg-[#f8e8e3] transition"
              aria-label="Notifiche"
              title="Notifiche"
              onClick={() => setShowNotifications(true)}
            >
              <FiBell size={24} className="text-[#b43434]" />
              {notificheCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notificheCount}</span>
              )}
            </button>
            <button
              className="bg-white text-[#b43434] border border-[#b43434] px-4 py-2 rounded hover:bg-[#f8e8e3] transition"
              onClick={async () => { await supabase.auth.signOut(); window.location.replace("/"); }}>
              Logout
            </button>
          </div>
        </div>
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
        {/* Modal notifiche */}
        {showNotifications && (
          <Notifications userId={profile.id} onClose={() => setShowNotifications(false)} />
        )}
      </div>
    </div>
  );
}
