import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Promotion = {
  id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_price';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type PromotionProduct = {
  id: string;
  promotion_id: string;
  product_id: string;
  created_at: string;
};

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      let promos = (data || []) as Promotion[];
      // Elimina promozioni scadute dal DB
      const now = new Date();
      const expiredPromos = promos.filter(p => new Date(p.end_date) < now);
      for (const promo of expiredPromos) {
        await supabase.from('promotions').delete().eq('id', promo.id);
      }
      // Aggiorna lo stato solo con promozioni non scadute
      promos = promos.filter(p => new Date(p.end_date) >= now);
      setPromotions(promos);
    } catch (error) {
      console.error('Errore caricamento promozioni:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le promozioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promotionData: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'created_by'>, productIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      // Create promotion
      const { data: promotion, error: promotionError } = await supabase
        .from('promotions')
        .insert([{
          ...promotionData,
          created_by: user.id
        }])
        .select()
        .single();

      if (promotionError) throw promotionError;

      // Create promotion-product relationships
      if (productIds.length > 0) {
        const promotionProducts = productIds.map(productId => ({
          promotion_id: promotion.id,
          product_id: productId
        }));

        const { error: relationError } = await supabase
          .from('promotion_products')
          .insert(promotionProducts);

        if (relationError) throw relationError;
      }

      setPromotions(prev => [promotion as Promotion, ...prev]);
      toast({
        title: "Successo",
        description: "Promozione creata con successo",
      });
      return promotion;
    } catch (error) {
      console.error('Errore creazione promozione:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la promozione",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>, productIds?: string[]) => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update product relationships if provided
      if (productIds !== undefined) {
        // Delete existing relationships
        await supabase
          .from('promotion_products')
          .delete()
          .eq('promotion_id', id);

        // Create new relationships
        if (productIds.length > 0) {
          const promotionProducts = productIds.map(productId => ({
            promotion_id: id,
            product_id: productId
          }));

          const { error: relationError } = await supabase
            .from('promotion_products')
            .insert(promotionProducts);

          if (relationError) throw relationError;
        }
      }

      setPromotions(prev => prev.map(p => p.id === id ? data as Promotion : p));
      toast({
        title: "Successo",
        description: "Promozione aggiornata con successo",
      });
      return data;
    } catch (error) {
      console.error('Errore aggiornamento promozione:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la promozione",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPromotions(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Successo",
        description: "Promozione eliminata con successo",
      });
    } catch (error) {
      console.error('Errore eliminazione promozione:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la promozione",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getPromotionProducts = async (promotionId: string) => {
    try {
      const { data, error } = await supabase
        .from('promotion_products')
        .select(`
          *,
          products:product_id (
            id,
            name,
            price,
            image_url
          )
        `)
        .eq('promotion_id', promotionId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Errore caricamento prodotti promozione:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionProducts,
    refetch: fetchPromotions
  };
}