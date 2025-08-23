import AdminCategoriesPage from "./AdminCategoriesPage";
  import { showToastFeedback } from '@/components/ui/ToastFeedback';
import React from 'react';
import { Button } from '@/components/ui/button';
// Lista prodotti con tab/filtri per stato e badge colorati
function ProductListUnified({ userId }: { userId: string }) {
  const { products, loading: productsLoading, deleteProduct, updateProduct } = useProducts({ all: true });
  const navigate = useNavigate();
  type ProductTab = 'draft' | 'published' | 'archived' | 'deleted' | 'purchased';
  const [tab, setTab] = React.useState<ProductTab>('draft');
  const [search, setSearch] = React.useState('');

  // Recupera i product_id acquistati da Supabase
  const [purchasedProductIds, setPurchasedProductIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function fetchPurchasedProductIds() {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id');
      if (!error && data) {
        // Rimuovi duplicati
        const ids = Array.from(new Set(data.map((item: any) => item.product_id)));
        setPurchasedProductIds(ids);
      }
    }
    fetchPurchasedProductIds();
  }, []);

  const filtered = products.filter(p => {
    const status = (p.status || 'draft');
    const matchesSearch = !search || (p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
    if (tab === 'purchased') {
      return purchasedProductIds.includes(p.id) && matchesSearch;
    }
    return status === tab && matchesSearch;
  });

  const badge = (status: string) => {
    switch (status) {
      case 'draft': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Bozza</span>;
      case 'published': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Pubblicato</span>;
      case 'archived': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">Archiviato</span>;
      case 'deleted': return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Eliminato</span>;
      default: return null;
    }
  };

  return (
    <div className="relative w-full">
      {/* Header sticky con tab grandi e floating action button */}
      <div className="sticky top-0 z-10 bg-white/95 border-b border-neutral-200 pb-2 mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-6 pt-4">
          <h1 className="text-3xl font-bold text-neutral-900 flex-1">Gestione Prodotti</h1>
          {/* Pulsante aggiunta prodotto rimosso dalla barra */}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button className={`px-5 py-2 rounded-full font-semibold text-base transition ${tab==='draft' ? 'bg-yellow-400 text-white shadow' : 'bg-neutral-100 text-neutral-700 hover:bg-yellow-100'}`} onClick={()=>setTab('draft')}>Bozze</button>
          <button className={`px-5 py-2 rounded-full font-semibold text-base transition ${tab==='published' ? 'bg-green-500 text-white shadow' : 'bg-neutral-100 text-neutral-700 hover:bg-green-100'}`} onClick={()=>setTab('published')}>Pubblicati</button>
          <button className={`px-5 py-2 rounded-full font-semibold text-base transition ${tab==='archived' ? 'bg-gray-400 text-white shadow' : 'bg-neutral-100 text-neutral-700 hover:bg-gray-100'}`} onClick={()=>setTab('archived')}>Archiviati</button>
          <button className={`px-5 py-2 rounded-full font-semibold text-base transition ${tab==='deleted' ? 'bg-red-500 text-white shadow' : 'bg-neutral-100 text-neutral-700 hover:bg-red-100'}`} onClick={()=>setTab('deleted')}>Eliminati</button>
      <button className={`px-5 py-2 rounded-full font-semibold text-base transition ${tab==='purchased' ? 'bg-blue-500 text-white shadow' : 'bg-neutral-100 text-neutral-700 hover:bg-blue-100'}`} onClick={()=>setTab('purchased')}>Acquistati</button>
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Cerca per nome o categoria..."
            className="px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-amber-400 text-base min-w-[220px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Lista prodotti a card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {productsLoading ? (
          <div className="col-span-full text-gray-400 text-center py-12">Caricamento prodotti...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-gray-400 text-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Package size={48} className="text-neutral-300 mb-2" />
              <span className="text-lg font-medium">Nessun prodotto in questa sezione</span>
              <span className="text-sm text-neutral-500">Aggiungi un nuovo prodotto per iniziare</span>
            </div>
          </div>
        ) : (
          filtered.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-neutral-100 hover:shadow-lg transition">
              <div className="flex gap-4 items-center">
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt="img" className="w-20 h-20 object-cover rounded-xl border" />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center rounded-xl border bg-neutral-100 text-neutral-300">
                    <Package size={36} />
                  </div>
                )}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="font-bold text-lg text-neutral-900 truncate">{product.name || 'Senza nome'}</span>
                  <span className="text-sm text-neutral-500 truncate">{product.category}</span>
                  {badge(product.status || 'draft')}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Button size="sm" variant="outline" onClick={()=>navigate(`/admin/${userId}/products/edit/${product.id}`)}>
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (product.status !== 'deleted') {
                        await updateProduct(product.id, { status: 'deleted' });
                        showToastFeedback('info', 'Prodotto eliminato', 'Il prodotto è stato spostato nella sezione Eliminati.');
                      } else {
                        await deleteProduct(product.id);
                        showToastFeedback('error', 'Prodotto eliminato definitivamente', 'Il prodotto è stato rimosso dal database.');
                      }
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating action button sempre visibile, circolare, in basso a destra */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
        onClick={() => navigate(`/admin/${userId}/products/new?redirect=auto`)}
        aria-label="Nuovo prodotto"
        title="Aggiungi nuovo prodotto"
      >
        <Plus size={32} />
      </button>
      {/* Floating action button mobile */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full shadow-lg p-4 md:hidden"
        onClick={() => (document.querySelector('button:contains("Nuovo prodotto")') as HTMLElement)?.click()}
        aria-label="Nuovo prodotto"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// importazione duplicata rimossa
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { countries } from "@/utils/countries";
import { CountryPhoneInput } from "@/components/admin/CountryPhoneInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  User, 
  LogOut, 
  Home, 
  Mail, 
  Phone, 
  AtSign, 
  Shield, 
  Settings,
  Package,
  Users,
  MessageSquare,
  BarChart3,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Activity,
  Menu,
  Percent
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useProducts } from "@/hooks/useProducts";
import { useMessages } from "@/hooks/useMessages";
import { useAdminStats } from "@/hooks/useAdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import PurchasedProductsAdminSection from "@/components/admin/PurchasedProductsAdminSection";
import { AdvancedAnalytics } from "@/components/admin/AdvancedAnalytics";
import { CommunicationCenter } from "@/components/admin/CommunicationCenter";

import { ProductCreateButton } from "@/components/products/ProductCreateButton";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import TestPaymentForm from "@/components/admin/TestPaymentForm";

type UserProfile = {
  nome: string;
  cognome: string;
  email: string;
  numero_telefono: string | null;
  nome_utente: string;
  created_at: string;
};

const adminMenuItems = [
  { id: "dashboard", title: "Dashboard", description: "Panoramica generale" },
  { id: "categories", title: "Categorie", description: "Gestione categorie" },
  { id: "products", title: "Prodotti", description: "Gestione catalogo" },
  { id: "promotions", title: "Promozioni", description: "Gestione sconti e offerte" },
  { id: "users", title: "Utenti", description: "Gestione utenti" },
  { id: "communication", title: "Comunicazioni", description: "Messaggi e notifiche" },
  { id: "analytics", title: "Analytics", description: "Statistiche avanzate" },
  { id: "settings", title: "Impostazioni", description: "Configurazione sistema" },
];

export default function AdminDashboard() {
  // Stato per la modale bozze
  const [showDraftModal, setShowDraftModal] = useState(false);
  // Stato per titolo notifica di prova
  const [testTitle, setTestTitle] = useState('');
  // Stato per lista admin con token FCM
  const [adminList, setAdminList] = useState([]);
  const { userId, section } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { role, isAdmin } = useUserRole(user);
  const { products, loading: productsLoading, deleteProduct } = useProducts();
  const { messages, loading: messagesLoading } = useMessages();
  const { stats, loading: statsLoading } = useAdminStats();
  // Determina la sezione attiva dall'URL, default "dashboard"
  const sectionFromUrl = section || location.pathname.split('/')[3] || "dashboard";
  const [activeTab, setActiveTab] = useState(sectionFromUrl);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Sincronizza activeTab con l'URL
  useEffect(() => {
    if (sectionFromUrl !== activeTab) {
      setActiveTab(sectionFromUrl);
    }
    // eslint-disable-next-line
  }, [sectionFromUrl]);

  // DEBUG: logga lo stato di caricamento, profilo e ruolo
  console.log('DEBUG AdminDashboard:', { loading, profile, user, isAdmin: isAdmin(), activeTab, sectionFromUrl });

  // Stato e logica per configurazione telefono notifiche e invio SMS di prova
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  // Stato per il selettore paese/telefono
  const [country, setCountry] = useState(countries.find(c => c.code === "IT")!);
  const [phoneRaw, setPhoneRaw] = useState("");


  // Gestione auth: chiama checkAuth solo su mount e su cambio userId, e aggiungi listener per cambiamenti auth
  useEffect(() => {
    let ignore = false;
    checkAuth();
    // Listener per cambiamenti di autenticazione
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) {
        if (!session) {
          navigate("/auth");
        } else {
          checkAuth();
        }
      }
    });
    return () => {
      ignore = true;
      subscription.subscription.unsubscribe();
    };
  }, [userId, navigate]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Verifica che l'userId nell'URL corrisponda all'utente loggato
      if (userId && userId !== session.user.id) {
        console.error("Accesso negato: userId non corrispondente");
        navigate(`/admin/${session.user.id}`);
        return;
      }

      // Se non c'è userId nell'URL, reindirizza con l'ID corretto
      if (!userId) {
        navigate(`/admin/${session.user.id}`);
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
        return;
      }

      setProfile(userProfile);
    } catch (error) {
      console.error("Errore autenticazione:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const fetchPhone = async () => {
      const { data } = await supabase
        .from('configurazione_generale')
        .select('valore')
        .eq('chiave', 'numero_telefono_notifiche')
        .single();
      if (data && data.valore) {
        setPhoneNumber(data.valore);
        setPhoneRaw(data.valore.replace(country.dial, ""));
        setEditMode(false);
      } else {
        setEditMode(true);
      }
    };
    fetchPhone();
  }, []);

  // Spinner di caricamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  // Mostra errore se non autorizzato, senza redirect loop
  if (!profile || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">
              Errore: accesso negato o profilo non caricato.<br />
              <b>DEBUG:</b><br />
              <pre style={{textAlign:'left',fontSize:'12px',overflow:'auto'}}>
                {JSON.stringify({
                  loading,
                  profile,
                  user,
                  role,
                  isAdmin: isAdmin(),
                  userId: user?.id,
                }, null, 2)}
              </pre>
              <br />
              <b>Note:</b><br />
              - Se <code>profile</code> è null, l'utente non ha un profilo in <code>user_profiles</code>.<br />
              - <code>role</code> restituito da useUserRole: <b>{role}</b><br />
              - <code>isAdmin()</code>: <b>{String(isAdmin())}</b><br />
              - <code>user.id</code>: <b>{user?.id}</b><br />
            </p>
            <Button 
              onClick={() => navigate(`/cliente/${userId}`)} 
              className="w-full"
            >
              Vai all'area cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 w-full flex px-2 sm:px-0">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (userId) {
                navigate(`/admin/${userId}/${tab}`);
              }
            }}
            profile={profile}
            userId={userId || ''}
            onLogout={handleLogout}
            onNavigateHome={() => navigate("/")}
            onNavigateCliente={() => navigate(`/cliente/${userId}`)}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-2xl font-bold text-neutral-800 truncate">
                      Pannello Admin
                    </h1>
                    <p className="text-neutral-600 text-xs md:text-sm truncate">Ciao, {profile.nome}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4"
                  >
                    <Home size={14} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/cliente/${userId}`)}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4"
                  >
                    <User size={14} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Cliente</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4"
                  >
                    <LogOut size={14} className="md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-40">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="h-8 w-8" />
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-800">
                      {adminMenuItems.find(item => item.id === activeTab)?.title || "Dashboard"}
                    </h1>
                    <p className="text-neutral-600">
                      {adminMenuItems.find(item => item.id === activeTab)?.description || "Pannello di controllo amministratore"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-800">{profile.nome} {profile.cognome}</p>
                    <p className="text-xs text-neutral-600">Amministratore</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-3 md:px-6 lg:px-6 py-4 md:py-8">
            <Tabs
              value={activeTab}
              onValueChange={tab => {
                setActiveTab(tab);
                if (userId) {
                  navigate(`/admin/${userId}/${tab}`);
                }
              }}
              className="space-y-4 md:space-y-6"
            >
              {/* Mobile Tab Navigation */}
              <div className="lg:hidden">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-white/80 backdrop-blur-sm border border-neutral-200/50 h-auto p-1">
                  <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/dashboard`)}>
                    <Activity size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/products`)}>
                    <Package size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Prodotti</span>
                    <span className="sm:hidden">Prod</span>
                  </TabsTrigger>
                  <TabsTrigger value="promotions" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/promotions`)}>
                    <Percent size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Promozioni</span>
                    <span className="sm:hidden">Promo</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/users`)}>
                    <Users size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Utenti</span>
                    <span className="sm:hidden">User</span>
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/communication`)}>
                    <MessageSquare size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Comunicazioni</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/analytics`)}>
                    <BarChart3 size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm" onClick={() => userId && navigate(`/admin/${userId}/settings`)}>
                    <Settings size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Impostazioni</span>
                    <span className="sm:hidden">Set</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
                {/* ...dashboard info... */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-600">Utenti Totali</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-800">
                        {statsLoading ? "..." : stats.totalUsers}
                      </div>
                      <p className="text-xs text-green-600">utenti registrati</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-600">Prodotti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-800">
                        {statsLoading ? "..." : stats.totalProducts}
                      </div>
                      <p className="text-xs text-blue-600">prodotti nel catalogo</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-600">Messaggi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-800">
                        {messagesLoading ? "..." : messages.length}
                      </div>
                      <p className="text-xs text-amber-600">
                        {statsLoading ? "..." : stats.unreadMessages} non letti
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-600">Attività</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-neutral-800">
                        {statsLoading ? "..." : stats.recentActivities.length}
                      </div>
                      <p className="text-xs text-purple-600">attività recenti</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell size={20} />
                        Attività Recenti
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statsLoading ? (
                          <div className="text-center py-4 text-neutral-500">Caricamento...</div>
                        ) : stats.recentActivities.length > 0 ? (
                          stats.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.type === 'user' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-neutral-800">{activity.description}</p>
                                <p className="text-xs text-neutral-600">
                                  {formatDistanceToNow(new Date(activity.timestamp), { 
                                    addSuffix: true, 
                                    locale: it 
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-neutral-500">Nessuna attività recente</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 size={20} />
                        Statistiche Rapide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Utenti Attivi</span>
                            <span className="font-medium">78%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-[78%]"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Prodotti Venduti</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full w-[65%]"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Soddisfazione</span>
                            <span className="font-medium">92%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full w-[92%]"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>


              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-6">
                <AdminCategoriesPage />
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <ProductListUnified userId={userId || user?.id || ''} />
              </TabsContent>

              {/* Promotions Tab */}
              <TabsContent value="promotions" className="space-y-4 md:space-y-6">
                <PromotionsManager />
              </TabsContent>

              {/* Products Tab - rimosso PurchasedProductsAdminSection, ora gestito dal filtro */}

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4 md:space-y-6">
                <UserManagement />
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-4 md:space-y-6">
                <div className="w-full flex flex-col items-center">
                  <CommunicationCenter />
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4 md:space-y-6">
                <AdvancedAnalytics />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-800">Impostazioni Sistema</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader>
                      <CardTitle>Invia messaggio di prova (SMS)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="flex flex-col gap-4 p-2 max-w-md mx-auto" style={{minWidth:280}} onSubmit={async e => {
                        e.preventDefault();
                        setSendingTest(true);
                        setTestResult(null);
                        try {
                          // Invia SMS manuale direttamente tramite edge function Supabase
                          const smsPayload = {
                            numero: '+393899822879',
                            messaggio: `${testTitle}\n${testMessage}`
                          };
                          console.log('[DEBUG SMS] Invio payload a Supabase:', smsPayload);
                          const res = await fetch('https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/send-sms', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(smsPayload),
        });
                          if (res.ok) {
                            setTestResult('success');
                            setTestTitle('');
                            setTestMessage('');
                          } else {
                            setTestResult('error');
                          }
                        } catch (err) {
                          setTestResult('error');
                        }
                        setSendingTest(false);
                        setTimeout(() => setTestResult(null), 3000);
                      }}>
                        <label className="font-medium text-neutral-700" htmlFor="sms-title">Titolo</label>
                        <input
                          id="sms-title"
                          type="text"
                          className="border border-neutral-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={testTitle}
                          onChange={e => setTestTitle(e.target.value)}
                          placeholder="Titolo"
                          required
                        />
                        <label className="font-medium text-neutral-700" htmlFor="sms-body">Corpo del messaggio</label>
                        <textarea
                          id="sms-body"
                          className="border border-neutral-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                          value={testMessage}
                          onChange={e => setTestMessage(e.target.value)}
                          placeholder="Corpo del messaggio"
                          required
                          rows={4}
                        />
                        <Button type="submit" disabled={sendingTest || !testTitle || !testMessage} variant="outline" className="mt-2">
                          {sendingTest ? 'Invio...' : 'Invia SMS'}
                        </Button>
                        {testResult === 'success' && <span className="text-green-600 text-sm ml-2">SMS inviato!</span>}
                        {testResult === 'error' && <span className="text-red-600 text-sm ml-2">Errore invio SMS</span>}
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader>
                      <CardTitle>Sicurezza</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-neutral-500">
                        <Shield size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="text-sm">Impostazioni sicurezza in sviluppo</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                    <CardHeader>
                      <CardTitle>Pagamento di test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TestPaymentForm />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

  {/* Modal eliminato: ora la modifica porta alla pagina dettaglio prodotto */}
      </div>
    </SidebarProvider>
  );
}
