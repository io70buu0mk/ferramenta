import React from "react";
import { useCart } from "../../hooks/useCart";
import { usePublicProducts } from "../../hooks/usePublicProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, ShoppingCart } from "lucide-react";

interface WishlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ open, onOpenChange }) => {
  const { wishlist, wishlistDispatch, dispatch } = useCart();
  const { products } = usePublicProducts ? usePublicProducts() : { products: [] };
  const wishlistProducts = products.filter((p: any) => wishlist.items.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-10 rounded-3xl border-2 border-pink-200 shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-pink-600">
            <Heart size={28} />
            Tutti i preferiti
          </DialogTitle>
        </DialogHeader>
        <ul className="divide-y divide-pink-100 mb-6 mt-4">
          {wishlistProducts.length === 0 && (
            <li className="py-8 text-center text-neutral-400">Nessun preferito.</li>
          )}
          {wishlistProducts.map((p: any) => (
            <li key={p.id} className="py-4 flex items-center gap-4 group">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded object-cover" />}
              <span className="flex-1 font-medium text-lg">{p.name}</span>
              <span className="text-base text-neutral-500">€{p.price?.toFixed(2)}</span>
              <div className="flex gap-1 items-center ml-2">
                <button
                  className="text-xs text-pink-600 border border-pink-400 rounded px-3 py-1 hover:bg-pink-100 transition"
                  onClick={() => wishlistDispatch({ type: 'REMOVE_WISHLIST', id: p.id })}
                >Rimuovi</button>
                <button
                  className="p-1 rounded border border-[#b43434] text-[#b43434] hover:bg-[#f8e8e3] transition flex items-center justify-center"
                  title="Aggiungi al carrello"
                  onClick={() => dispatch({ type: 'ADD_ITEM', product: { id: p.id, name: p.name, price: p.price, image: p.image_url, quantity: 1 } })}
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;
