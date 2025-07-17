
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AdvancedAnalytics } from "@/components/admin/AdvancedAnalytics";
import { CommunicationCenter } from "@/components/admin/CommunicationCenter";

import { ProductForm } from "@/components/admin/ProductForm";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

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
  { id: "products", title: "Prodotti", description: "Gestione catalogo" },
  { id: "promotions", title: "Promozioni", description: "Gestione sconti e offerte" },
  { id: "users", title: "Utenti", description: "Gestione utenti" },
  { id: "communication", title: "Comunicazioni", description: "Messaggi e notifiche" },
  { id: "analytics", title: "Analytics", description: "Statistiche avanzate" },
  { id: "settings", title: "Impostazioni", description: "Configurazione sistema" },
];

export default function AdminDashboard() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { role, isAdmin } = useUserRole(user);
  const { products, loading: productsLoading, deleteProduct } = useProducts();
  const { messages, loading: messagesLoading, markAsRead } = useMessages();
  const { stats, loading: statsLoading } = useAdminStats();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    checkAuth();
  }, [userId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!profile || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">Accesso negato - Permessi amministratore richiesti</p>
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
      <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 w-full flex">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
              {/* Mobile Tab Navigation */}
              <div className="lg:hidden">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-white/80 backdrop-blur-sm border border-neutral-200/50 h-auto p-1">
                  <TabsTrigger value="dashboard" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <Activity size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <Package size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Prodotti</span>
                    <span className="sm:hidden">Prod</span>
                  </TabsTrigger>
                  <TabsTrigger value="promotions" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <Percent size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Promozioni</span>
                    <span className="sm:hidden">Promo</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <Users size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Utenti</span>
                    <span className="sm:hidden">User</span>
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <MessageSquare size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Comunicazioni</span>
                    <span className="sm:hidden">Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <BarChart3 size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 py-2 text-xs md:text-sm">
                    <Settings size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Impostazioni</span>
                    <span className="sm:hidden">Set</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
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

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-neutral-800">Gestione Prodotti</h2>
                  <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
                    <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <Download size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Esporta</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <Upload size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Importa</span>
                    </Button>
                    <Button 
                      onClick={() => setProductFormOpen(true)}
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 flex-shrink-0"
                    >
                      <Plus size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Nuovo</span>
                      <span className="sm:hidden">+</span>
                    </Button>
                  </div>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Cerca prodotti..."
                          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={16} />
                        Filtri
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productsLoading ? (
                        <div className="text-center py-12 text-neutral-500">Caricamento prodotti...</div>
                      ) : products.length > 0 ? (
                        <div className="grid gap-4">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                              <div className="flex-1">
                                <h3 className="font-medium text-neutral-800">{product.name}</h3>
                                <p className="text-sm text-neutral-600">{product.category}</p>
                                <p className="text-sm text-neutral-500">
                                  Prezzo: €{product.price} - Stock: {product.stock_quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductFormOpen(true);
                                  }}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-neutral-500">
                          <Package size={48} className="mx-auto mb-4 text-neutral-300" />
                          <p className="text-lg font-medium mb-2">Nessun prodotto trovato</p>
                          <p className="text-sm">Inizia aggiungendo il tuo primo prodotto</p>
                          <Button 
                            onClick={() => setProductFormOpen(true)}
                            className="mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                          >
                            Aggiungi Prodotto
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Promotions Tab */}
              <TabsContent value="promotions" className="space-y-4 md:space-y-6">
                <PromotionsManager />
              </TabsContent>

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
                      <CardTitle>Configurazione Generale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-neutral-500">
                        <Settings size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="text-sm">Impostazioni in sviluppo</p>
                      </div>
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ProductForm
          open={productFormOpen}
          onOpenChange={(open) => {
            setProductFormOpen(open);
            if (!open) setEditingProduct(null);
          }}
          product={editingProduct}
        />
      </div>
    </SidebarProvider>
  );
}
