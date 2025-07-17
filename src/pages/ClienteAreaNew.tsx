import { useEffect, useState } from "react";
import CartSection from '../components/user/CartSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserAdminGroupChat from '@/components/user/UserAdminGroupChat';
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, Mail, Phone, AtSign } from "lucide-react";
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
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hasAdminChat, setHasAdminChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const { role, isAdmin } = useUserRole(user);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ nome: "", cognome: "", nome_utente: "", numero_telefono: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, [userId]);

  // Controlla se esiste una conversazione user-admin per abilitare la chat
  useEffect(() => {
    const checkAdminChat = async () => {
      if (!user) return;
      // Usa il client JS non tipizzato per accedere a tabelle custom
      const { data: conv } = await (supabase as any)
        .from('conversations')
        .select('id')
        .eq('type', 'user-admin')
        .eq('user_id', user.id)
        .maybeSingle();
      setHasAdminChat(!!conv);
    };
    checkAdminChat();
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.replace("/auth");
        return;
      }

      setUser(session.user);

      // Verifica che l'userId nell'URL corrisponda all'utente loggato
      if (userId && userId !== session.user.id) {
        console.error("Accesso negato: userId non corrispondente");
        window.location.replace(`/cliente/${session.user.id}`);
        return;
      }

      // Se non c'è userId nell'URL, reindirizza con l'ID corretto
      if (!userId) {
        window.location.replace(`/cliente/${session.user.id}`);
        return;
      }

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
          
          <div className="flex gap-3">
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
              {hasAdminChat && user ? (
                <UserAdminGroupChat user={user} />
              ) : (
                <div className="text-neutral-400 text-center py-8">Nessuna conversazione attiva con l'amministrazione.<br/>Riceverai qui i messaggi quando uno staff ti contatterà.</div>
              )}
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
