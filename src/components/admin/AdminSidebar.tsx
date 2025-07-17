import { NavLink, useLocation } from "react-router-dom";
import { 
  Activity, 
  Package, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Home,
  User,
  LogOut,
  Shield,
  Percent
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: {
    nome: string;
    cognome: string;
  };
  userId: string;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateCliente: () => void;
}

const adminMenuItems = [
  { 
    id: "dashboard", 
    title: "Dashboard", 
    icon: Activity,
    description: "Panoramica generale"
  },
  { 
    id: "products", 
    title: "Prodotti", 
    icon: Package,
    description: "Gestione catalogo"
  },
  {
    id: "promotions",
    title: "Promozioni",
    icon: Percent,
    description: "Gestione sconti e offerte"
  },
  { 
    id: "users", 
    title: "Utenti", 
    icon: Users,
    description: "Gestione utenti"
  },
  { 
    id: "communication", 
    title: "Comunicazioni", 
    icon: MessageSquare,
    description: "Messaggi e notifiche"
  },
  { 
    id: "analytics", 
    title: "Analytics", 
    icon: BarChart3,
    description: "Statistiche avanzate"
  },
  { 
    id: "settings", 
    title: "Impostazioni", 
    icon: Settings,
    description: "Configurazione sistema"
  },
];

export function AdminSidebar({ 
  activeTab, 
  onTabChange, 
  profile, 
  userId, 
  onLogout, 
  onNavigateHome, 
  onNavigateCliente 
}: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar 
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-neutral-200/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-neutral-800 truncate">
                Admin Panel
              </h2>
              <p className="text-sm text-neutral-600 truncate">
                {profile.nome} {profile.cognome}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Menu Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={`${
                      activeTab === item.id 
                        ? "bg-amber-50 text-amber-700 border-r-2 border-amber-400" 
                        : "hover:bg-neutral-50"
                    } transition-colors`}
                  >
                    <button
                      onClick={() => onTabChange(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2"
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      {!collapsed && (
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-neutral-500">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigazione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={onNavigateHome}
                    className="w-full justify-start gap-3 h-auto py-2"
                  >
                    <Home size={20} />
                    {!collapsed && <span>Home</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={onNavigateCliente}
                    className="w-full justify-start gap-3 h-auto py-2"
                  >
                    <User size={20} />
                    {!collapsed && <span>Area Cliente</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={onLogout}
                    className="w-full justify-start gap-3 h-auto py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}