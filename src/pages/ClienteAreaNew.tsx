import { useEffect, useState } from "react";
import CartSection from '../components/user/CartSection';
import PurchasedProductsSection from '../components/user/PurchasedProductsSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, Mail, Phone, AtSign, Bell, Settings, CheckCircle, XCircle } from "lucide-react";
import Notifications from '../components/user/Notifications';
import { useUserRole } from "@/hooks/useUserRole";
import EmailConfirmationAlert from "@/components/auth/EmailConfirmationAlert";

type UserProfile = {
  nome: string;
  cognome: string;
  email: string;
  numero_telefono: string | null;
  nome_utente: string;
  created_at: string;
};

export default function ClienteAreaNew() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificheCount, setNotificheCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, isAdmin } = useUserRole(user);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ nome: "", cognome: "", nome_utente: "", numero_telefono: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, [userId]);

  // Polling per badge notifiche non lette (nuova tabella user_notifications)
  useEffect(() => {
    if (!user) return;
    let interval: NodeJS.Timeout;
    const fetchCount = async () => {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (!error && data) setNotificheCount(data.length);
    };
    fetchCount();
    interval = setInterval(fetchCount, 1000);
    return () => clearInterval(interval);
  }, [user]);


  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.replace("/auth");
        return;
      }

      // Valorizza user per abilitare la campanella notifiche
      setUser(session.user);

      // Carica il profilo utente
      const { data: userProfile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Errore nel caricamento profilo:", error);
        setShowProfileModal(true);
        return;
      }

      if (!userProfile) {
        setShowProfileModal(true);
        return;
      }

      setProfile(userProfile);
    } catch (error) {
      console.error("Errore autenticazione:", error);
      window.location.replace("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia to-cemento/20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-senape"></div>
      </div>
    );
  }

  // Modale per inserimento profilo se mancante
  if (showProfileModal) {
    return (
      <Dialog open={showProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completa il tuo profilo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Nome" value={profileData.nome} onChange={e => setProfileData(p => ({ ...p, nome: e.target.value }))} />
            <Input placeholder="Cognome" value={profileData.cognome} onChange={e => setProfileData(p => ({ ...p, cognome: e.target.value }))} />
            <Input placeholder="Nome utente" value={profileData.nome_utente} onChange={e => setProfileData(p => ({ ...p, nome_utente: e.target.value }))} />
            <Input placeholder="Telefono" value={profileData.numero_telefono} onChange={e => setProfileData(p => ({ ...p, numero_telefono: e.target.value }))} />
            <Button className="w-full" onClick={async () => {
              setSavingProfile(true);
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;
              await supabase.from("user_profiles").insert({
                id: session.user.id,
                nome: profileData.nome,
                cognome: profileData.cognome,
                nome_utente: profileData.nome_utente,
                numero_telefono: profileData.numero_telefono,
                email: session.user.email,
                role: "cliente"
              });
              setSavingProfile(false);
              setShowProfileModal(false);
              window.location.reload();
            }}>{savingProfile ? "Salvataggio..." : "Salva profilo"}</Button>
          </div>
        </DialogContent>

      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-cemento/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="text-senape" size={32} />
            <div>
              <h1 className="text-3xl font-oswald font-bold text-antracite">
                Area Cliente
              </h1>
              <p className="text-cemento">Benvenuto nella tua area personale</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            {/* Pulsante impostazioni */}
            <button
              className="relative flex items-center justify-center w-10 h-10 bg-white border border-[#b43434] rounded-full hover:bg-[#f8e8e3] transition disabled:opacity-50"
              aria-label="Impostazioni"
              title="Impostazioni"
              disabled={!user}
              onClick={() => setShowSettings(true)}
            >
              <Settings size={22} className="text-[#b43434]" />
            </button>
        {/* Modale impostazioni */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl w-full bg-white/95 rounded-2xl shadow-2xl p-8 border-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-antracite mb-2">Modifica dati personali</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-5 mt-4"
              onSubmit={async e => {
                e.preventDefault();
                setSavingProfile(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                await supabase.from("user_profiles").update({
                  nome: profileData.nome || profile?.nome,
                  cognome: profileData.cognome || profile?.cognome,
                  nome_utente: profileData.nome_utente || profile?.nome_utente,
                  numero_telefono: profileData.numero_telefono || profile?.numero_telefono,
                }).eq('id', session.user.id);
                setSavingProfile(false);
                setShowSettings(false);
                window.location.reload();
              }}
            >
              <div className="flex flex-col md:flex-row gap-5">
                <Input placeholder="Nome" value={profileData.nome || profile?.nome || ''} onChange={e => setProfileData(p => ({ ...p, nome: e.target.value }))} className="flex-1 text-base px-4 py-3" />
                <Input placeholder="Cognome" value={profileData.cognome || profile?.cognome || ''} onChange={e => setProfileData(p => ({ ...p, cognome: e.target.value }))} className="flex-1 text-base px-4 py-3" />
              </div>
              <div className="flex flex-col md:flex-row gap-5">
                <Input placeholder="Nome utente" value={profileData.nome_utente || profile?.nome_utente || ''} onChange={e => setProfileData(p => ({ ...p, nome_utente: e.target.value }))} className="flex-1 text-base px-4 py-3" />
                <Input placeholder="Telefono" value={profileData.numero_telefono || profile?.numero_telefono || ''} onChange={e => setProfileData(p => ({ ...p, numero_telefono: e.target.value }))} className="flex-1 text-base px-4 py-3" />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <Input placeholder="Email" value={profile?.email || ''} disabled className="flex-1 bg-transparent border-none text-base" />
                {user?.email_confirmed_at ? (
                  <span className="flex items-center text-green-600 text-xs gap-1"><CheckCircle size={16}/> Confermata</span>
                ) : (
                  <span className="flex items-center text-red-500 text-xs gap-1"><XCircle size={16}/> Non confermata</span>
                )}
              </div>
              <Button type="submit" className="w-full text-base py-3 mt-2" disabled={savingProfile}>
                {savingProfile ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
            <button
              className="relative flex items-center justify-center w-10 h-10 bg-white border border-[#b43434] rounded-full hover:bg-[#f8e8e3] transition disabled:opacity-50"
              aria-label="Notifiche"
              title="Notifiche"
              disabled={!user}
              onClick={() => {
                console.log('[DEBUG] Click campanella, user:', user);
                setShowNotifications(true);
              }}
            >
              <Bell size={22} className="text-[#b43434]" />
              {notificheCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notificheCount}</span>
              )}
            </button>
            <Button 
              variant="outline" 
              onClick={() => window.location.replace("/")}
              className="flex items-center gap-2"
            >
              <Home size={18} />
              Home
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        {/* Modal notifiche */}
        {showNotifications && (
          !user ? (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8">Caricamento utente...</div>
            </div>
          ) : (
            <>
              {console.log('[DEBUG] Montata finestra Notifications, userId:', user.id)}
              <Notifications userId={user.id} onClose={() => setShowNotifications(false)} />
            </>
          )
        )}
        </div>

        {/* Email Confirmation Alert */}
        {userId && <EmailConfirmationAlert userId={userId} />}

        {/* Benvenuto + Storico ordini */}
        <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-senape/10 to-ruggine/10">
            <CardTitle className="text-2xl text-antracite font-oswald">
              Benvenuto, {profile?.nome} {profile?.cognome}!
            </CardTitle>
            <CardDescription className="text-lg flex items-center gap-2">
              È un piacere averti nella famiglia Ferramenta Lucini
            </CardDescription>
            <div className="mt-4">
              <Button variant="outline" onClick={() => window.location.replace('/i-miei-ordini')}>
                Visualizza i tuoi ordini
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Informazioni profilo */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Carrello separato */}
          <div className="mb-8">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-antracite">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-13z" stroke="#b43434" strokeWidth="2"/><circle cx="9" cy="20" r="1" fill="#b43434"/><circle cx="18" cy="20" r="1" fill="#b43434"/></svg>
                  Carrello
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CartSection />
              </CardContent>
            </Card>
            {/* Prodotti acquistati */}
            {user && <PurchasedProductsSection userId={user.id} />}
          </div>
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-antracite">
                <User size={20} />
                Informazioni personali e contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User size={18} className="text-senape" />
                <div>
                  <p className="font-medium text-antracite">Nome completo</p>
                  <p className="text-cemento">{profile.nome} {profile.cognome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AtSign size={18} className="text-senape" />
                <div>
                  <p className="font-medium text-antracite">Nome utente</p>
                  <p className="text-cemento">@{profile.nome_utente}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={18} className="text-senape" />
                <div>
                  <p className="font-medium text-antracite">Email</p>
                  <p className="text-cemento">{profile.email}</p>
                </div>
              </div>
              {profile.numero_telefono && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={18} className="text-senape" />
                  <div>
                    <p className="font-medium text-antracite">Telefono</p>
                    <p className="text-cemento">{profile.numero_telefono}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat privata con amministratore */}
        <div className="my-12">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-antracite">Chat con l'amministrazione</CardTitle>
              <CardDescription>Comunicazioni dirette con lo staff</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Sezione chat rimossa */}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-cemento text-sm">
            Cliente dal {new Date(profile.created_at).toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>
    </div>
  );
}
