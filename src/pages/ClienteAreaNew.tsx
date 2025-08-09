import { useEffect, useState } from "react";
import WishlistModal from '../components/user/WishlistModal';
import { useCart } from "../hooks/useCart";
import { usePublicProducts } from "../hooks/usePublicProducts";
import CartSection from '../components/user/CartSection';
import PurchasedProductsSection from '../components/user/PurchasedProductsSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, Mail, Phone, AtSign, Bell, Settings, CheckCircle, XCircle, Star, FileText, MapPin, ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import RecentOrdersSection from '../components/user/RecentOrdersSection';
import Notifications from '../components/user/Notifications';
import { useUserRole } from "@/hooks/useUserRole";
import EmailConfirmationAlert from "../components/auth/EmailConfirmationAlert";

export default function ClienteArea() {
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  // Hook preferiti e prodotti pubblici
  const { wishlist, wishlistDispatch } = useCart();
  const { products } = usePublicProducts();

type UserProfile = {
  id?: string;
  nome: string;
  cognome: string;
  email: string;
  numero_telefono: string | null;
  nome_utente: string;
  created_at: string;
  ruolo?: string;
};
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificheCount, setNotificheCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, isAdmin } = useUserRole(user);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ nome: "", cognome: "", nome_utente: "", numero_telefono: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [invoices, setInvoices] = useState<any[] | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [errorInvoices, setErrorInvoices] = useState<string | null>(null);

  // Sincronizza profileData con profile quando si apre la modale
  useEffect(() => {
    if (showSettings && profile) {
      setProfileData({
        nome: profile.nome || "",
        cognome: profile.cognome || "",
        nome_utente: profile.nome_utente || "",
        numero_telefono: profile.numero_telefono || ""
      });
    }
  }, [showSettings, profile]);

  // Controlla se ci sono modifiche rispetto ai dati originali
  const isProfileChanged = profile && (
    profileData.nome !== profile.nome ||
    profileData.cognome !== profile.cognome ||
    profileData.nome_utente !== profile.nome_utente ||
    (profileData.numero_telefono || "") !== (profile.numero_telefono || "")
  );

  // Funzione per salvataggio profilo (modale moderna)
  const handleProfileSave = async () => {
    setSavingProfile(true);
    if (!user) return;
    await supabase.from("user_profiles").update({
      nome: profileData.nome,
      cognome: profileData.cognome,
      nome_utente: profileData.nome_utente,
      numero_telefono: profileData.numero_telefono
    }).eq("id", user.id);
    setSavingProfile(false);
    setShowSettings(false);
    // Aggiorna i dati a schermo
    setProfile({ ...profile, ...profileData });
  };

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

  const handleDownloadInvoices = async () => {
    setLoadingInvoices(true);
    setErrorInvoices(null);
    console.log('[Scarica Fatture] Avvio fetch...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      console.log('[Scarica Fatture] Token JWT:', accessToken);
      const resp = await fetch('https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/get-invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('[Scarica Fatture] Response status:', resp.status);
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[Scarica Fatture] Errore HTTP:', errText);
        throw new Error('Errore nel recupero delle fatture: ' + errText);
      }
      const data = await resp.json();
      console.log('[Scarica Fatture] Dati ricevuti:', data);
      setInvoices(data);
    } catch (e: any) {
      console.error('[Scarica Fatture] Errore:', e);
      setErrorInvoices(e.message || 'Errore sconosciuto');
    } finally {
      setLoadingInvoices(false);
      console.log('[Scarica Fatture] Fine fetch.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8e8e3] to-[#f5f5f7] py-8 px-2 sm:px-4">
      {/* Modale moderna per modifica profilo (coerente con notifiche) */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg p-0 rounded-3xl border-2 border-[#f8e8e3] shadow-2xl bg-white">
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#f8e8e3] bg-gradient-to-br from-[#f8e8e3] to-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <Settings size={28} className="text-[#b43434]" />
              <span className="text-xl font-bold text-[#b43434]">Modifica profilo</span>
            </div>
            {/* Solo la X stilizzata per chiudere */}
            <button className="text-2xl text-[#b43434] hover:bg-[#f8e8e3] rounded-full w-10 h-10 flex items-center justify-center transition border-2 border-[#f8e8e3]" onClick={() => setShowSettings(false)} title="Chiudi">
              <span style={{ fontWeight: 'bold', fontSize: 22, color: '#b43434' }}>×</span>
            </button>
          </div>
          <form className="px-8 py-8 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleProfileSave(); }}>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#b43434]">Nome</label>
              <Input value={profileData.nome} onChange={e => setProfileData(p => ({ ...p, nome: e.target.value }))} placeholder="Nome" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#b43434]">Cognome</label>
              <Input value={profileData.cognome} onChange={e => setProfileData(p => ({ ...p, cognome: e.target.value }))} placeholder="Cognome" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#b43434]">Nome utente</label>
              <Input value={profileData.nome_utente} onChange={e => setProfileData(p => ({ ...p, nome_utente: e.target.value }))} placeholder="Nome utente" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#b43434]">Telefono</label>
              <Input value={profileData.numero_telefono || ""} onChange={e => setProfileData(p => ({ ...p, numero_telefono: e.target.value }))} placeholder="Telefono" />
            </div>
            <div className="flex gap-4 mt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowSettings(false)}>Annulla</Button>
              <Button type="submit" className="flex-1 bg-[#b43434] hover:bg-[#a12d2d] text-white font-bold" disabled={savingProfile || !isProfileChanged}>{savingProfile ? "Salvataggio..." : "Salva"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="max-w-4xl mx-auto relative rounded-3xl shadow-2xl bg-white/90 p-2 sm:p-6">
        {/* HEADER UTENTE MODERNO */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b-2 border-[#f8e8e3] pb-6">
          <div className="flex items-center gap-4 w-full">
            {/* Avatar utente */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b43434] to-[#f8e8e3] flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white">
              {profile.nome && profile.cognome ? (profile.nome[0] + profile.cognome[0]).toUpperCase() : <User size={36} />}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-[#b43434]">{profile.nome} {profile.cognome}</span>
              <span className="text-base text-neutral-500">{profile.email}</span>
              {/* Badge stato account */}
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#f8e8e3] text-[#b43434] shadow">{isAdmin ? 'Amministratore' : 'Cliente'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-end w-full sm:w-auto">
            {/* Pulsante modifica profilo */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-base text-neutral-700 font-semibold shadow transition" title="Modifica profilo" onClick={() => setShowSettings(true)}>
              <Settings size={18} /> Modifica profilo
            </button>
            {/* Pulsante area admin se admin */}
            {isAdmin && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#b43434] bg-[#f8e8e3] hover:bg-[#f3d1c3] text-base text-[#b43434] font-bold shadow transition" onClick={() => navigate('/admin')}>
                <User size={18} /> Vai all'area amministratore
              </button>
            )}
          </div>
        </div>
        {/* AZIONI RAPIDE */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-[#b43434] font-semibold shadow hover:bg-neutral-200 transition text-sm"
            onClick={() => navigate('/')}
          >
            <Home size={18} /> Home
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b43434] text-white font-semibold shadow hover:bg-[#a12d2d] transition text-sm"
            onClick={() => navigate('/order-review')}
          >
            <ArrowUpToLine size={18} /> Nuovo ordine
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-[#b43434] font-semibold shadow hover:bg-neutral-200 transition text-sm"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={18} /> Notifiche
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-[#b43434] font-semibold shadow hover:bg-neutral-200 transition text-sm"
            onClick={() => handleDownloadInvoices()}
          >
            <FileText size={18} /> Scarica fatture
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 text-[#b43434] font-semibold shadow hover:bg-neutral-200 transition text-sm"
            onClick={() => navigate('/prodotti')}
          >
            <span role="img" aria-label="prodotti">🛒</span> Vai ai prodotti
          </button>
        </div>
        {/* Lista fatture utente */}
        {invoices && invoices.length === 0 && (
          <div className="my-4 bg-yellow-100 border border-yellow-300 rounded-xl p-4 shadow flex items-center gap-4">
            <span className="text-yellow-800 font-medium">Nessuna fattura collegata al tuo account.</span>
            {isAdmin && (
              <button
                className="ml-auto px-3 py-1 rounded bg-[#b43434] text-white font-semibold hover:bg-[#a12d2d] transition text-sm"
                onClick={async () => {
                  try {
                    // Chiamata a una funzione di test (da implementare lato backend)
                    const { data: { session } } = await supabase.auth.getSession();
                    const accessToken = session?.access_token;
                    const resp = await fetch('https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/create-test-invoice', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    if (!resp.ok) throw new Error('Errore creazione fattura di test');
                    alert('Fattura di test creata! Ricarica la pagina per visualizzarla.');
                  } catch (e: any) {
                    alert('Errore: ' + (e.message || 'Errore sconosciuto'));
                  }
                }}
              >
                Crea fattura di test
              </button>
            )}
          </div>
        )}
        {invoices && (
          <div className="my-4 bg-white/80 rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-2 text-[#b43434]">Le tue fatture</h3>
            {invoices.length === 0 && <div>Nessuna fattura trovata.</div>}
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center gap-2">
                  <a href={inv.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Fattura #{inv.number || inv.id} ({(inv.amount/100).toFixed(2)} €)
                  </a>
                  <span className="text-xs text-neutral-500">{new Date(inv.created * 1000).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {errorInvoices && <div className="text-red-600 my-2">{errorInvoices}</div>}
        {/* SEZIONI PRINCIPALI */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Carrello e prodotti acquistati */}
          <div className="mb-8">
            <Card className="bg-white/95 backdrop-blur-2xl shadow-2xl border-0 rounded-2xl">
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
          {/* Info personali e contatti */}
          <Card className="bg-white/95 backdrop-blur-2xl shadow-2xl border-0 rounded-2xl">
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
        {/* SEZIONI EXTRA */}
        <div className="grid gap-6 mb-10 grid-cols-1 sm:grid-cols-2">
          {/* Consigliati per te */}
          <div className="rounded-2xl bg-gradient-to-br from-[#f8e8e3] to-white shadow-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-[#b43434] text-base">Consigliati per te</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-300 text-2xl">☆</div>
              <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-300 text-2xl">☆</div>
              <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-300 text-2xl">☆</div>
            </div>
            <span className="text-xs text-neutral-400">Nessun suggerimento disponibile</span>
          </div>
          {/* Documenti e indirizzi */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-[#f8e8e3] shadow-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-[#b43434] text-base">Documenti & Indirizzi</span>
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#b43434] font-medium transition text-sm">
                <span role="img" aria-label="prodotti">🛒</span> Vai ai prodotti
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#b43434] font-medium transition text-sm">
                <FileText size={18} /> Scarica documenti
              </button>
            </div>
            <span className="text-xs text-neutral-400">Gestione documenti e indirizzi in arrivo</span>
          </div>
          {/* Preferiti - attivo */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-[#f8e8e3] shadow-lg p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-[#b43434] text-base">Preferiti</span>
              <span className="ml-auto text-xs text-neutral-500 cursor-pointer hover:underline" onClick={() => setShowWishlistModal(true)}>Vedi tutto</span>
            </div>
            {/* Lista prodotti preferiti */}
            {(() => {
              const preferiti = products && wishlist.items.length > 0 ? products.filter(p => wishlist.items.includes(p.id)) : [];
              if (!preferiti.length) {
                return <span className="text-xs text-neutral-400">Nessun preferito</span>;
              }
              return (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {preferiti.slice(0, 3).map(p => (
                    <div key={p.id} className="w-32 h-32 bg-neutral-100 rounded-lg flex flex-col items-center justify-center p-2 shadow">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded object-cover mb-2" />}
                      <div className="font-medium text-xs text-center truncate w-full">{p.name}</div>
                      <div className="text-xs text-neutral-500">€{p.price?.toFixed(2)}</div>
                      <button className="mt-1 text-xs text-pink-600 border border-pink-400 rounded px-2 py-1 hover:bg-pink-100 transition" onClick={() => wishlistDispatch({ type: 'REMOVE_WISHLIST', id: p.id })}>Rimuovi</button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          {/* Modale preferiti completo */}
          <WishlistModal open={showWishlistModal} onOpenChange={setShowWishlistModal} />
          {/* Ordini recenti */}
          <RecentOrdersSection userId={user?.id} onViewAll={() => navigate('/user-orders')} />
        </div>
        {/* Modal notifiche */}
        {showNotifications && (
          !user ? (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8">Caricamento utente...</div>
            </div>
          ) : (
            <>
              <Notifications userId={user.id} onClose={() => setShowNotifications(false)} />
            </>
          )
        )}
        {/* Email Confirmation Alert */}
        {userId && <EmailConfirmationAlert userId={userId} />}
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
