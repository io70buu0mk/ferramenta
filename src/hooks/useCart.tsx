// Wishlist
export type WishlistState = {
  items: string[]; // array di id prodotto
};
const initialWishlist: WishlistState = {
  items: [],
};

type WishlistAction =
  | { type: 'ADD_WISHLIST'; id: string }
  | { type: 'REMOVE_WISHLIST'; id: string };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_WISHLIST':
      if (state.items.includes(action.id)) return state;
      toast({ title: 'Aggiunto ai preferiti', description: 'Prodotto aggiunto alla wishlist.' });
      return { ...state, items: [...state.items, action.id] };
    case 'REMOVE_WISHLIST':
      toast({ title: 'Rimosso dai preferiti', description: 'Prodotto rimosso dalla wishlist.' });
      return { ...state, items: state.items.filter(i => i !== action.id) };
    default:
      return state;
  }
}
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from './use-toast';

// Tipi prodotto e carrello
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export type CartState = {
  items: CartProduct[];
};

const initialState: CartState = {
  items: [],
};

// Azioni
export type CartAction =
  | { type: 'ADD_ITEM'; product: CartProduct }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.product.id);
      if (existing) {
        toast({
          title: 'Prodotto già nel carrello',
          description: `${action.product.name} è già presente.`,
        });
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + action.product.quantity }
              : item
          ),
        };
      }
      toast({
        title: 'Aggiunto al carrello',
        description: `${action.product.name} aggiunto con successo!`,
      });
      return { ...state, items: [...state.items, action.product] };
    }
    case 'REMOVE_ITEM': {
      const removed = state.items.find(item => item.id === action.id);
      if (removed) {
        toast({
          title: 'Rimosso dal carrello',
          description: `${removed.name} rimosso.`,
        });
      }
      return { ...state, items: state.items.filter(item => item.id !== action.id) };
    }
    case 'UPDATE_QUANTITY': {
      const updated = state.items.find(item => item.id === action.id);
      if (updated) {
        toast({
          title: 'Quantità aggiornata',
          description: `${updated.name}: ${action.quantity} pezzi.`,
        });
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
      toast({
        title: 'Carrello svuotato',
        description: 'Tutti i prodotti sono stati rimossi.',
      });
      return { ...state, items: [] };
    default:
      return state;
  }
}


const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  wishlist: WishlistState;
  wishlistDispatch: React.Dispatch<WishlistAction>;
}>({ state: initialState, dispatch: () => {}, wishlist: initialWishlist, wishlistDispatch: () => {} });

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : init;
    }
    return init;
  });
  const [wishlist, wishlistDispatch] = useReducer(wishlistReducer, initialWishlist, (init) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : init;
    }
    return init;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  return (
    <CartContext.Provider value={{ state, dispatch, wishlist, wishlistDispatch }}>
      {children}
    </CartContext.Provider>
  );
};
