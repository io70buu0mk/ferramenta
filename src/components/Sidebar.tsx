
import { Users, Home, ShoppingCart, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", text: "Home", icon: Home },
  { href: "/client", text: "Area Clienti", icon: Users },
  { href: "/admin", text: "Area Admin", icon: Settings },
];

export const Sidebar = ({
  collapsed,
  setCollapsed,
  userRole,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  userRole: string;
}) => (
  <aside
    className={cn(
      "transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col py-6 px-3 gap-4",
      collapsed ? "w-[60px]" : "w-[210px]",
      "min-h-screen sticky top-0 z-30"
    )}
  >
    <button
      className="mb-8 self-end text-gray-400 hover:text-[#b43434] transition"
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? "Espandi" : "Collassa"}
    >
      <span className="text-xl">{collapsed ? "»" : "«"}</span>
    </button>
    {links.map((l) => (
      <a
        href={l.href}
        className={cn(
          "flex items-center px-3 py-2 rounded-md gap-2 hover:bg-[#f8e8e0] transition-colors",
          collapsed ? "justify-center" : "justify-start"
        )}
        key={l.text}
      >
        <l.icon size={22} className="text-[#b43434]" />
        {!collapsed && (
          <span className="font-semibold text-gray-800">{l.text}</span>
        )}
      </a>
    ))}
    <div className="flex-1"></div>
    {!collapsed && (
      <div className="mt-auto">
        <div className="text-[12px] text-gray-400 mb-2">Ruolo attuale:</div>
        <span className="font-bold text-[#b43434]">{userRole}</span>
      </div>
    )}
  </aside>
);
