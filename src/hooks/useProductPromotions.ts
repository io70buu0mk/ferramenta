import { usePublicProducts } from "@/hooks/usePublicProducts";
import { usePromotions } from "@/hooks/usePromotions";

export function useProductPromotions() {
  const { products, loading: productsLoading } = usePublicProducts();
  const { promotions, loading: promotionsLoading } = usePromotions();

  // Prendi solo promozioni attive e nel periodo
  const now = new Date();
  const activePromos = promotions.filter(p => p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now);

  // Crea un set di tutti gli ID prodotto in promozione
  const promoProductIds = new Set<string>();
  activePromos.forEach(promo => {
    if (promo.product_ids && Array.isArray(promo.product_ids)) {
      promo.product_ids.forEach((id: string) => promoProductIds.add(id));
    }
  });

  return {
    products,
    productsLoading,
    promotions,
    promotionsLoading,
    promoProductIds,
    loading: promotionsLoading
  };
}
