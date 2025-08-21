import React, { useEffect, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { getSignedImageUrl } from "@/integrations/supabase/imageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartModal: React.FC<CartModalProps> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useCart();
  const items = state.items;
  const [signedUrls, setSignedUrls] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchUrls() {
      const urls: { [id: string]: string } = {};
      await Promise.all(items.map(async (item) => {
        if (item.image && !item.image.startsWith("http")) {
          try {
            urls[item.id] = await getSignedImageUrl(item.image);
          } catch {
            urls[item.id] = "/placeholder.svg";
          }
        } else if (item.image) {
          urls[item.id] = item.image;
        } else {
          urls[item.id] = "/placeholder.svg";
        }
      }));
      if (isMounted) setSignedUrls(urls);
    }
    fetchUrls();
    return () => { isMounted = false; };
  }, [items]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-10 rounded-3xl border-2 border-neutral-200 shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-[#b43434]">
            <ShoppingCart size={28} />
            Tutti i prodotti nel carrello
          </DialogTitle>
        </DialogHeader>
        <ul className="divide-y divide-neutral-100 mb-6 mt-4">
          {items.length === 0 && (
            <li className="py-8 text-center text-neutral-400">Il carrello è vuoto.</li>
          )}
          {items.map(item => (
            <li key={item.id} className="py-4 flex items-center gap-4 group">
              <img
                src={signedUrls[item.id] || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 rounded object-cover border"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              <span className="flex-1 font-medium text-lg">{item.name}</span>
              <span className="text-base text-neutral-500">€{item.price.toFixed(2)}</span>
              <span className="text-xs text-neutral-500 ml-2">x{item.quantity}</span>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-xs text-[#b43434] border border-[#b43434] rounded px-3 py-1 ml-2 opacity-70 group-hover:opacity-100 hover:bg-[#f8e8e3] transition"
              >Rimuovi</button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-6">
          <strong className="text-lg">Totale:</strong>
          <span className="text-2xl font-bold text-[#b43434]">€{total.toFixed(2)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
