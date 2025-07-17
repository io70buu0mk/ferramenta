import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Heart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { PublicProduct } from '@/hooks/usePublicProducts';
import { useProductPromotions } from '@/hooks/useProductPromotions';

export default function ProductDetail() {
  const { dispatch, wishlist, wishlistDispatch } = useCart();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { products, productPromotionMap } = useProductPromotions();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, category, image_url, stock_quantity')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Errore caricamento prodotto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Caricamento prodotto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Prodotto non trovato</h1>
          <p className="text-muted-foreground mb-4">Il prodotto richiesto non esiste o non è disponibile.</p>
          <Button onClick={() => navigate('/prodotti')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai Prodotti
          </Button>
        </div>
      </div>
    );
  }

  // Trova la promozione attiva per questo prodotto
  const promo = product && productPromotionMap[product.id];
  let finalPrice = product?.price;
  let badge = null;
  let oldPrice = null;
  if (promo && finalPrice) {
    if (promo.discount_type === 'percentage') {
      finalPrice = finalPrice * (1 - promo.discount_value / 100);
    } else if (promo.discount_type === 'fixed_price') {
      finalPrice = promo.discount_value;
    }
    badge = (
      <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-bold animate-pulse">
        In promozione
      </span>
    );
    oldPrice = (
      <span className="text-neutral-400 line-through text-sm ml-2">
        €{product.price?.toFixed(2)}
      </span>
    );
  }

  // Altri prodotti (escludi quello attuale)
  const otherProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch({
      type: 'ADD_ITEM',
      product: {
        id: product.id,
        name: product.name,
        price: finalPrice || product.price,
        image: product.image_url,
        quantity: 1,
      },
    });
  };

  return (
    <div className={`min-h-screen bg-background ${promo ? 'ring-2 ring-pink-300' : ''}`}> 
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/prodotti')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Indietro
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <span className="font-semibold">Ferramenta Lucini</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package size={64} />
                </div>
              )}
              {badge && (
                <div className="absolute top-2 right-2 z-10">{badge}</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              )}
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between py-4 border-y">
              <div className="flex items-center gap-2">
                {finalPrice ? (
                  <div className="flex items-center">
                    <p className={`text-3xl font-bold ${promo ? 'text-pink-600' : 'text-primary'}`}>€{finalPrice.toFixed(2)}</p>
                    {oldPrice}
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">Prezzo su richiesta</p>
                )}
                <button
                  className={`ml-4 ${wishlist.items.includes(product.id) ? 'text-pink-500' : 'text-neutral-300'} hover:text-pink-500 transition`}
                  title={wishlist.items.includes(product.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                  onClick={() => {
                    if (wishlist.items.includes(product.id)) {
                      wishlistDispatch({ type: 'REMOVE_WISHLIST', id: product.id });
                    } else {
                      wishlistDispatch({ type: 'ADD_WISHLIST', id: product.id });
                    }
                  }}
                >
                  <Heart fill={wishlist.items.includes(product.id) ? '#ec4899' : 'none'} size={28} />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Disponibilità</p>
                <p className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} disponibili` : 'Esaurito'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                disabled={product.stock_quantity <= 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock_quantity > 0 ? 'Aggiungi al Carrello' : 'Non Disponibile'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = '#contatti'}
              >
                Contattaci per Info
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Altri prodotti suggeriti */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 mt-16 text-neutral-800">Altri prodotti che potrebbero interessarti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {otherProducts.map((prod) => {
            const promo = productPromotionMap[prod.id];
            let finalPrice = prod.price;
            let badge = null;
            let oldPrice = null;
            if (promo && finalPrice) {
              if (promo.discount_type === 'percentage') {
                finalPrice = finalPrice * (1 - promo.discount_value / 100);
              } else if (promo.discount_type === 'fixed_price') {
                finalPrice = promo.discount_value;
              }
              badge = (
                <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-bold animate-pulse">
                  In promozione
                </span>
              );
              oldPrice = (
                <span className="text-neutral-400 line-through text-sm ml-2">
                  €{prod.price?.toFixed(2)}
                </span>
              );
            }
            return (
              <div 
                key={prod.id}
                className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-lg ${promo ? 'ring-2 ring-pink-300' : ''}`}
                onClick={() => navigate(`/prodotto/${prod.id}`)}
              >
                <div className="h-48 overflow-hidden relative">
                  {prod.image_url ? (
                    <img 
                      src={prod.image_url} 
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <Package size={32} className="text-neutral-400" />
                    </div>
                  )}
                  {badge && (
                    <div className="absolute top-2 right-2 z-10">{badge}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">{prod.name}</h3>
                  {finalPrice && (
                    <div className="flex items-center mb-2">
                      <p className={`font-semibold text-lg ${promo ? 'text-pink-600' : 'text-amber-600'}`}>€{finalPrice.toFixed(2)}</p>
                      {oldPrice}
                    </div>
                  )}
                  <button className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-yellow-600 transition-all">
                    Scopri di più
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}