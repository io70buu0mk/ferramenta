
import React from "react";
import { ShoppingCart, MessageCircle, Users, Settings, Home, Heart } from "lucide-react";
import { useCart } from '../hooks/useCart';
import { RoleSelector } from "./RoleSelector";

export const Navbar = ({
  userRole,
  onRoleChange,
}: {
  userRole: string;
  onRoleChange: (role: string) => void;
}) => {
  const { state, wishlist } = useCart();
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.items.length;
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <nav className="w-full bg-white shadow-lg h-auto flex flex-col sm:flex-row px-3 sm:px-8 items-center justify-between z-40 relative">
      <div className="flex items-center gap-3 w-full sm:w-auto py-2 sm:py-0">
        <button className="sm:hidden p-2 mr-2" onClick={() => setMenuOpen(v => !v)} aria-label="Apri menu">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#b43434" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <Home className="text-[#b43434]" size={28} />
        <span className="text-lg sm:text-xl font-bold tracking-wide text-gray-900">FerramentaPro</span>
      </div>
      {/* Menu desktop */}
      <div className="hidden sm:flex gap-4 items-center">
        <a href="/" title="Home" className="hover-scale relative">
          <Home size={22} />
        </a>
        <a href="/client" title="Area clienti" className="hover-scale relative">
          <Users size={22} />
        </a>
        <a href="/admin" title="Area admin" className="hover-scale relative">
          <Settings size={22} />
        </a>
        <a href="/client?tab=wishlist" title="Preferiti" className="relative hover-scale">
          <Heart size={22} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold animate-bounce">
              {wishlistCount}
            </span>
          )}
        </a>
        <a href="/client?tab=cart" title="Carrello" className="relative hover-scale">
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#b43434] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold animate-bounce">
              {cartCount}
            </span>
          )}
        </a>
        <a href="/client?tab=chat" title="Chat assistenza" className="relative hover-scale">
          <MessageCircle size={22} />
        </a>
        <RoleSelector userRole={userRole} onRoleChange={onRoleChange} />
      </div>
      {/* Menu mobile */}
      {menuOpen && (
        <div className="flex flex-col gap-2 items-start bg-white shadow-lg rounded-lg p-4 absolute top-14 left-2 right-2 z-50 sm:hidden animate-fade-in">
          <a href="/" title="Home" className="flex items-center gap-2 py-1 w-full">
            <Home size={22} /> <span>Home</span>
          </a>
          <a href="/client" title="Area clienti" className="flex items-center gap-2 py-1 w-full">
            <Users size={22} /> <span>Area clienti</span>
          </a>
          <a href="/admin" title="Area admin" className="flex items-center gap-2 py-1 w-full">
            <Settings size={22} /> <span>Area admin</span>
          </a>
          <a href="/client?tab=wishlist" title="Preferiti" className="flex items-center gap-2 py-1 w-full relative">
            <Heart size={22} /> <span>Preferiti</span>
            {wishlistCount > 0 && (
              <span className="ml-2 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold animate-bounce">
                {wishlistCount}
              </span>
            )}
          </a>
          <a href="/client?tab=cart" title="Carrello" className="flex items-center gap-2 py-1 w-full relative">
            <ShoppingCart size={22} /> <span>Carrello</span>
            {cartCount > 0 && (
              <span className="ml-2 bg-[#b43434] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold animate-bounce">
                {cartCount}
              </span>
            )}
          </a>
          <a href="/client?tab=chat" title="Chat assistenza" className="flex items-center gap-2 py-1 w-full">
            <MessageCircle size={22} /> <span>Chat</span>
          </a>
          <div className="w-full flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Ruolo:</span>
            <RoleSelector userRole={userRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      )}
    </nav>
  );
};
