import { useEffect, useState } from "react";
import { usePublicProducts } from "@/hooks/usePublicProducts";
import { usePromotions } from "@/hooks/usePromotions";

export function useProductPromotions() {
  const { products, loading: productsLoading } = usePublicProducts();
  const { promotions, loading: promotionsLoading, getPromotionProducts } = usePromotions();
  const [promotionProducts, setPromotionProducts] = useState<{product_id: string, promotion_id: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotionProducts = async () => {
      const now = new Date();
      const activePromos = promotions.filter(p => p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now);
      if (activePromos.length === 0) {
        setPromotionProducts([]);
        setLoading(false);
        return;
      }
      let allRelations: {product_id: string, promotion_id: string}[] = [];
      for (const promo of activePromos) {
        const rels = await getPromotionProducts(promo.id);
        if (rels && Array.isArray(rels)) {
          allRelations = allRelations.concat(rels.map((r: any) => ({ product_id: r.product_id, promotion_id: promo.id })));
        }
      }
      setPromotionProducts(allRelations);
      setLoading(false);
    };
    fetchPromotionProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotions]);

  // Mappa prodotto -> promozione (prende la prima promozione trovata)
  const productPromotionMap: Record<string, typeof promotions[0]> = {};
  promotionProducts.forEach(rel => {
    if (!productPromotionMap[rel.product_id]) {
      const promo = promotions.find(p => p.id === rel.promotion_id);
      if (promo) productPromotionMap[rel.product_id] = promo;
    }
  });

  const promoProductIds = new Set(promotionProducts.map(rel => rel.product_id));

  return {
    products,
    productsLoading,
    promotions,
    promotionsLoading,
    productPromotionMap,
    promoProductIds,
    promotionProducts,
    loading
  };
}
