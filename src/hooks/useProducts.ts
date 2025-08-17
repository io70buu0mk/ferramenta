import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Errore caricamento prodotti:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i prodotti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      // Se il nome non è fornito, genera "Bozza N" dove N è il prossimo numero disponibile
      let productName = productData.name;
      if (!productName || productName.trim() === "") {
        // Conta le bozze esistenti
        const { data: draftProducts, error: draftError } = await supabase
          .from('products')
          .select('name')
          .ilike('name', 'Bozza%');
        let nextDraftNum = 0;
        if (draftProducts && Array.isArray(draftProducts)) {
          // Trova il massimo numero usato
          const draftNums = draftProducts
            .map(p => p.name)
            .filter(n => n && n.startsWith('Bozza'))
            .map(n => {
              const match = n.match(/Bozza (\d+)/);
              return match ? parseInt(match[1], 10) : null;
            })
            .filter(n => n !== null);
          nextDraftNum = draftNums.length > 0 ? Math.max(...draftNums) + 1 : 0;
        }
        productName = `Bozza ${nextDraftNum}`;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          name: productName,
          images: productData.images ?? [],
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Prodotto creato con successo",
      });
      return data;
    } catch (error) {
      console.error('Errore creazione prodotto:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il prodotto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          images: updates.images ?? [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Successo",
        description: "Prodotto aggiornato con successo",
      });
      return data;
    } catch (error) {
      console.error('Errore aggiornamento prodotto:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il prodotto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Elimina da tutte le tabelle che hanno product_id
      const cartRes = await supabase.from('cart_items').delete().eq('product_id', id);
      if (cartRes.error) throw cartRes.error;

      const orderRes = await supabase.from('order_items').delete().eq('product_id', id);
      if (orderRes.error) throw orderRes.error;

      const wishlistRes = await supabase.from('wishlist').delete().eq('product_id', id);
      if (wishlistRes.error) throw wishlistRes.error;

      const promoRes = await supabase.from('promotion_products').delete().eq('product_id', id);
      if (promoRes.error) throw promoRes.error;

      // Ora elimina il prodotto
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Successo",
        description: "Prodotto eliminato ovunque con successo",
      });
    } catch (error) {
      console.error('Errore eliminazione prodotto:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il prodotto. Assicurati che non sia presente in altre tabelle correlate.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct
  };
}