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
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

// Il reducer ora è solo "locale" e serve per lo stato temporaneo, ma tutte le azioni sono sincronizzate con Supabase
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + action.product.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.product] };
    }
    case 'REMOVE_ITEM': {
      return { ...state, items: state.items.filter(item => item.id !== action.id) };
    }
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART':
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
  const [state, dispatch] = React.useReducer(cartReducer, initialState);
  const [wishlist, wishlistDispatch] = React.useReducer(wishlistReducer, initialWishlist, (init) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : init;
    }
    return init;
  });
  const [userId, setUserId] = React.useState<string | null>(null);
  // Carica userId
  useEffect(() => {
    console.log('[useCart] useEffect getUserId - start');
    async function getUserId() {
      console.log('[useCart] getUserId - chiamata supabase.auth.getSession()');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useCart] getUserId - session:', session);
      if (session && session.user) {
        setUserId(session.user.id);
        console.log('[useCart] getUserId - userId trovato:', session.user.id);
      } else {
        setUserId(null);
        console.log('[useCart] getUserId - nessun utente loggato');
      }
    }
    getUserId();
    supabase.auth.onAuthStateChange(() => {
      console.log('[useCart] onAuthStateChange trigger');
      getUserId();
    });
  }, []);

  // Carica carrello da Supabase
  useEffect(() => {
    console.log('[useCart] useEffect carica carrello - userId:', userId);
    if (!userId) {
      dispatch({ type: 'CLEAR_CART' });
      console.log('[useCart] Nessun userId, carrello svuotato');
      return;
    }
    (async () => {
      console.log('[useCart] Inizio caricamento carrello da Supabase per userId:', userId);
      // Trova o crea carrello
      let { data: cart, error } = await supabase.from('carts').select('id').eq('user_id', userId).single();
      console.log('[useCart] Risultato select carts:', cart, error);
      if (error || !cart) {
        console.error('Errore select carts:', error);
        const { data: newCart, error: insertErr } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
        console.log('[useCart] Risultato insert carts:', newCart, insertErr);
        if (insertErr || !newCart) {
          console.error('Errore insert carts:', insertErr);
          return;
        }
        cart = newCart;
      }
      // Carica items
      const { data: items, error: itemsErr } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, product:products(id, name, price, image_url)')
        .eq('cart_id', cart.id);
      console.log('[useCart] Risultato select cart_items:', items, itemsErr);
      if (itemsErr) {
        console.error('Errore select cart_items:', itemsErr);
      }
      if (items) {
        const mapped = items.map((item: any) => ({
          id: item.product_id,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          image: item.product?.image_url,
          quantity: item.quantity,
        }));
        dispatch({ type: 'CLEAR_CART' });
        mapped.forEach((p: CartProduct) => dispatch({ type: 'ADD_ITEM', product: p }));
        console.log('[useCart] Carrello caricato e stato aggiornato:', mapped);
      }
    })();
  }, [userId]);

  // Azioni sincronizzate con Supabase
  const addItem = useCallback(async (product: CartProduct) => {
    if (!userId) return;
    // Trova carrello
    let { data: cart, error } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (error) console.error('Errore select carts (addItem):', error);
    if (!cart) {
      const { data: newCart, error: insertErr } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
      if (insertErr) console.error('Errore insert carts (addItem):', insertErr);
      cart = newCart;
    }
    // Cerca se già presente
    const { data: existing, error: existErr } = await supabase.from('cart_items').select('id, quantity').eq('cart_id', cart.id).eq('product_id', product.id).single();
    if (existErr && existErr.code !== 'PGRST116') console.error('Errore select cart_items (addItem):', existErr);
    if (existing) {
      const { error: updErr } = await supabase.from('cart_items').update({ quantity: existing.quantity + product.quantity }).eq('id', existing.id);
      if (updErr) console.error('Errore update cart_items (addItem):', updErr);
      toast({ title: 'Prodotto già nel carrello', description: `${product.name} quantità aggiornata.` });
    } else {
      const { error: insErr } = await supabase.from('cart_items').insert({ cart_id: cart.id, product_id: product.id, quantity: product.quantity });
      if (insErr) console.error('Errore insert cart_items (addItem):', insErr);
      toast({ title: 'Aggiunto al carrello', description: `${product.name} aggiunto con successo!` });
    }
    // Aggiorna stato
    dispatch({ type: 'ADD_ITEM', product });
  }, [userId]);

  const removeItem = useCallback(async (id: string) => {
    if (!userId) return;
    let { data: cart, error } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (error) console.error('Errore select carts (removeItem):', error);
    if (!cart) return;
    const { error: delErr } = await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', id);
    if (delErr) console.error('Errore delete cart_items (removeItem):', delErr);
    dispatch({ type: 'REMOVE_ITEM', id });
    toast({ title: 'Rimosso dal carrello', description: 'Prodotto rimosso.' });
  }, [userId]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (!userId) return;
    let { data: cart, error } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (error) console.error('Errore select carts (updateQuantity):', error);
    if (!cart) return;
    const { error: updErr } = await supabase.from('cart_items').update({ quantity }).eq('cart_id', cart.id).eq('product_id', id);
    if (updErr) console.error('Errore update cart_items (updateQuantity):', updErr);
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
    toast({ title: 'Quantità aggiornata', description: `Quantità aggiornata a ${quantity}.` });
  }, [userId]);

  const clearCart = useCallback(async () => {
    if (!userId) return;
    let { data: cart, error } = await supabase.from('carts').select('id').eq('user_id', userId).single();
    if (error) console.error('Errore select carts (clearCart):', error);
    if (!cart) return;
    const { error: delErr } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (delErr) console.error('Errore delete cart_items (clearCart):', delErr);
    dispatch({ type: 'CLEAR_CART' });
    toast({ title: 'Carrello svuotato', description: 'Tutti i prodotti sono stati rimossi.' });
  }, [userId]);

  // Espone le azioni come dispatch custom
  const customDispatch = useCallback((action: CartAction) => {
    switch (action.type) {
      case 'ADD_ITEM':
        addItem(action.product);
        break;
      case 'REMOVE_ITEM':
        removeItem(action.id);
        break;
      case 'UPDATE_QUANTITY':
        updateQuantity(action.id, action.quantity);
        break;
      case 'CLEAR_CART':
        clearCart();
        break;
      default:
        break;
    }
  }, [addItem, removeItem, updateQuantity, clearCart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  return (
    <CartContext.Provider value={{ state, dispatch: customDispatch, wishlist, wishlistDispatch }}>
      {children}
    </CartContext.Provider>
  );
};
