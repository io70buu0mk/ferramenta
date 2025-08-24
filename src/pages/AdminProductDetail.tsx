import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';

import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { showToastFeedback } from '@/components/ui/ToastFeedback';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useRef } from 'react';
import { ProductPromotionsManager } from '@/components/admin/ProductPromotionsManager';
import { PromotionsSummary } from '@/components/admin/PromotionsSummary';
import { usePromotions } from '@/hooks/usePromotions';

export default function AdminProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct, deleteProduct } = useProducts({ all: true });
  const { promotions, getPromotionProducts } = usePromotions();
  const [productPromotions, setProductPromotions] = useState<any[]>([]);
  const { categories } = useCategories();
  const { toast } = useToast();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any | null>(null);
  const [dirty, setDirty] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      const found = products.find((p) => p.id === id);
      setProduct(found || null);
      setFormData(found ? { ...found } : null);
      setLoading(false);
    };
    fetchProduct();
  }, [id, products]);

  // Sincronizza le promozioni effettive del prodotto
  useEffect(() => {
    if (!product) return setProductPromotions([]);
    const filtered = promotions.filter(
      (promo: any) => Array.isArray(promo.product_ids) && promo.product_ids.includes(product.id)
    );
    setProductPromotions(filtered);
  }, [promotions, product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-0">
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Caricamento prodotto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-0">
        <div className="text-center w-full max-w-md mx-auto">
          <Package size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Prodotto non trovato</h1>
          <Button onClick={() => navigate('/admin/prodotti')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai Prodotti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/${product?.user_id || ''}/products`)} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Indietro
            </Button>
            <span className="font-semibold">Area Admin - Dettaglio Prodotto</span>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Box riassuntivo promozioni attive, sempre visibile */}
        <div className="mb-8">
          <PromotionsSummary productId={product.id} alwaysVisible promotions={productPromotions} />
        </div>
        
        <div className="mt-12" id="product-promotions-section">
          <ProductPromotionsManager productId={product.id} />
        </div>
      </div>
    </div>
  );
}
