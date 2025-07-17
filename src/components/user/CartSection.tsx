import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { usePublicProducts } from '../../hooks/usePublicProducts';
import { ShoppingCart } from 'lucide-react';
import CartModal from './CartModal';
import WishlistModal from './WishlistModal';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CartSection: React.FC = () => {
  const { state, dispatch, wishlist, wishlistDispatch } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const items = state.items;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { products } = usePublicProducts ? usePublicProducts() : { products: [] };
  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  };
  const handleQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  };
  const handleClear = () => {
    if (window.confirm('Sei sicuro di voler svuotare il carrello?')) {
      dispatch({ type: 'CLEAR_CART' });
    }
  };
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#b43434]">Il tuo carrello</h2>
        <button className="text-xs underline text-[#b43434] ml-auto" onClick={() => setShowCartModal(true)}>Vedi altro</button>
      </div>
      <ul className="divide-y divide-neutral-100 mb-4">
        {items.slice(0,2).map(item => (
          <li key={item.id} className="py-3 flex items-center gap-3 group">
            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border" />}
            <span className="flex-1 font-medium">{item.name}</span>
            <span className="text-sm text-neutral-500">€{item.price.toFixed(2)}</span>
            <input
              type="number"
              min={1}
              max={99}
              value={item.quantity}
              onChange={e => {
                let val = Number(e.target.value);
                if (val > 99) val = 99;
                handleQuantity(item.id, val);
              }}
              className="w-14 border rounded px-2 py-1 mx-2 text-center"
            />
            {item.quantity === 99 && (
              <span className="text-xs text-[#b43434] ml-1">Max</span>
            )}
            <button
              onClick={() => handleRemove(item.id)}
              className="text-xs text-[#b43434] border border-[#b43434] rounded px-2 py-1 ml-2 opacity-70 group-hover:opacity-100 hover:bg-[#f8e8e3] transition"
            >
              Rimuovi
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-4">
        <strong className="text-base">Totale:</strong>
        <span className="text-lg font-bold text-[#b43434]">€{total.toFixed(2)}</span>
      </div>
      <button
        onClick={handleClear}
        className="mt-4 w-full bg-[#b43434] text-white py-2 rounded font-semibold hover:bg-[#a12d2d] transition"
      >
        Svuota carrello
      </button>
      {items.length > 0 && (
        <Button
          className="mt-4 w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
          onClick={() => navigate('/order-review')}
        >
          Procedi al pagamento
        </Button>
      )}

      {/* Preferiti */}
      {wishlist.items.length > 0 && products && products.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-pink-600">I tuoi preferiti</span>
            <button className="text-xs underline text-pink-600 ml-auto" onClick={() => setShowWishlistModal(true)}>Vedi altro</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
              {products.filter(p => wishlist.items.includes(p.id)).slice(0, 2).map(p => (
                <li key={p.id} className="flex items-center min-w-[350px] bg-pink-50 rounded px-4 py-2 border border-pink-100">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover" />}
                  <div className="flex-1 flex flex-col min-w-0 ml-3">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-neutral-500">€{p.price?.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-1 items-center ml-2">
                    <button
                      className="text-xs text-pink-600 border border-pink-400 rounded px-2 py-1 hover:bg-pink-100 transition"
                      onClick={() => wishlistDispatch({ type: 'REMOVE_WISHLIST', id: p.id })}
                    >Rimuovi</button>
                    <button
                      className="p-1 rounded border border-[#b43434] text-[#b43434] hover:bg-[#f8e8e3] transition flex items-center justify-center"
                      title="Aggiungi al carrello"
                      onClick={() => dispatch({ type: 'ADD_ITEM', product: { id: p.id, name: p.name, price: p.price, image: p.image_url, quantity: 1 } })}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </li>
            ))}
          </div>
        </div>
      )}

      {/* Modale carrello completo */}
      <CartModal open={showCartModal} onOpenChange={setShowCartModal} />
      {/* Modale preferiti completo */}
      <WishlistModal open={showWishlistModal} onOpenChange={setShowWishlistModal} />
      {/* Suggerimenti prodotti correlati */}
      {products && products.length > 0 && (
        <div className="mt-8">
          <div className="font-semibold mb-2 text-[#b43434]">Potrebbero interessarti anche:</div>
          <div className="grid grid-cols-2 gap-3">
            {products.filter(p => !items.some(i => i.id === p.id) && !wishlist.items.includes(p.id)).slice(0, 2).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-neutral-50 rounded p-2 border border-neutral-100">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded object-cover" />}
                <div className="flex-1">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-neutral-500">€{p.price?.toFixed(2)}</div>
                </div>
                <button
                  className="text-xs text-[#b43434] border border-[#b43434] rounded px-2 py-1 ml-2 hover:bg-[#f8e8e3] transition"
                  onClick={() => dispatch({ type: 'ADD_ITEM', product: { id: p.id, name: p.name, price: p.price, image: p.image_url, quantity: 1 } })}
                >Aggiungi</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSection;
