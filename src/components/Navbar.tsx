
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
  return (
    <nav className="w-full bg-white shadow-lg h-16 flex px-10 items-center justify-between z-40">
      <div className="flex items-center gap-4">
        <Home className="text-[#b43434]" size={28} />
        <span className="text-xl font-bold tracking-wide text-gray-900">FerramentaPro</span>
      </div>
      <div className="flex gap-5 items-center">
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
    </nav>
  );
};
