import { useEffect, useState } from 'react';
// import { getSignedImageUrl } from '@/integrations/supabase/imageUpload';
import { useCart } from '../hooks/useCart';
import { Heart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { User, Heart as HeartIcon } from 'lucide-react';
import { PublicProduct } from '@/hooks/usePublicProducts';
import { useProductPromotions } from '@/hooks/useProductPromotions';

export default function ProductDetail() {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const { dispatch, wishlist, wishlistDispatch } = useCart();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { products, promoProductIds, promotions } = useProductPromotions();
  // Nessuna signed URL, uso direttamente tutti gli URL pubblici dell'array images

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, category, images, stock_quantity')
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
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-0">
        <div className="text-center w-full max-w-md mx-auto">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-neutral-500">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header semplice come nello screenshot originale */}
      <header className="w-full flex items-center px-6 py-4 bg-white border-b sticky top-0 z-40">
        <button
          className="mr-4 flex items-center gap-2 text-black hover:text-neutral-700 font-semibold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} color="black" />
          <span className="text-black">Indietro</span>
        </button>
        <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
        <span className="text-xl font-bold text-neutral-800">Ferramenta Lucini</span>
        <div className="ml-auto flex gap-3">
          <button
            className="flex items-center justify-center px-2 py-2 rounded hover:bg-neutral-100 text-neutral-700"
            onClick={() => navigate('/client')}
            title="Area Clienti"
          >
            <User size={22} />
          </button>
          <button
            className="flex items-center justify-center px-2 py-2 rounded hover:bg-neutral-100 text-neutral-700"
            onClick={() => navigate('/client?tab=cart')}
            title="Carrello"
          >
            <ShoppingCart size={22} />
          </button>
          <button
            className="flex items-center justify-center px-2 py-2 rounded hover:bg-neutral-100 text-neutral-700"
            onClick={() => navigate('/preferiti')}
            title="Preferiti"
          >
            <HeartIcon size={22} />
          </button>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Calcolo promozione e prezzi */}
      {product && (() => {
        let promo = null;
        let badge = null;
        let finalPrice = product.price;
        let oldPrice = null;
        if (promoProductIds.has(product.id)) {
          promo = promotions.find(p => p.product_ids?.includes(product.id));
          if (promo && finalPrice) {
            if (promo.discount_type === 'percentage') {
              finalPrice = finalPrice * (1 - promo.discount_value / 100);
            } else if (promo.discount_type === 'fixed_price') {
              finalPrice = promo.discount_value;
            }
            badge = (
              <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-bold animate-pulse">In promozione</span>
            );
            oldPrice = (
              <span className="text-neutral-400 line-through text-sm ml-2">€{product.price?.toFixed(2)}</span>
            );
          }
        }
        return (
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image stile Amazon */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative flex items-center justify-center">
                <img
                  src={product.images && product.images.length > 0 ? product.images[selectedImageIdx] || product.images[0] : '/placeholder.svg'}
                  alt={`${product.name} immagine principale`}
                  className="w-full h-full object-contain rounded-2xl transition-all duration-300 shadow-lg"
                  style={{ maxHeight: '420px', background: '#fff' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                {badge && (
                  <div className="promo-badge">In promozione</div>
                )}
              </div>
              {/* Thumbnails scrollabili */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product.images.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-20 h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden focus:outline-none ${selectedImageIdx === idx ? 'border-amber-500 scale-105 shadow-lg' : 'border-neutral-200 hover:border-amber-400'}`}
                      style={{ background: '#fff' }}
                    >
                      <img
                        src={url || '/placeholder.svg'}
                        alt={`${product?.name} thumbnail ${idx+1}`}
                        className="w-full h-full object-cover"
                        style={{ transition: 'transform 0.2s' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
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
                {/* Badge Garanzia, Spedizione, Promozione, Disponibilità */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shadow">Disponibilità: {product.stock_quantity > 0 ? `${product.stock_quantity} pezzi` : 'Esaurito'}</span>
                  {badge}
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow">Spedizione veloce</span>
                  {/* Badge garanzia rimosso su richiesta */}
                </div>
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
                  <p className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock_quantity > 0 ? `${product.stock_quantity} disponibili` : 'Esaurito'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Button 
                  className="w-full font-bold text-lg py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white rounded-xl shadow-md transition"
                  size="lg"
                  disabled={product.stock_quantity <= 0}
                  onClick={() => {
                    if (!product) return;
                    dispatch({
                      type: 'ADD_ITEM',
                      product: {
                        id: product.id,
                        name: product.name,
                        price: finalPrice || product.price,
                        image: product.images?.[0],
                        quantity: 1,
                      },
                    });
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock_quantity > 0 ? 'Aggiungi al Carrello' : 'Non Disponibile'}
                </Button>
                {/* Recensioni rimosse su richiesta */}
              </div>
            </div>
          </div>
        );
      })()}
      {/* Altri prodotti suggeriti */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-6 mt-16 text-neutral-800">Altri prodotti che potrebbero interessarti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {product && products.filter(p => p.id !== product.id).slice(0, 4).map((prod) => {
            let promo = null;
            let finalPrice = prod.price;
            let badge = null;
            let oldPrice = null;
            if (promoProductIds.has(prod.id)) {
              promo = promotions.find(p => p.product_ids?.includes(prod.id));
              if (promo && finalPrice) {
                if (promo.discount_type === 'percentage') {
                  finalPrice = finalPrice * (1 - promo.discount_value / 100);
                } else if (promo.discount_type === 'fixed_price') {
                  finalPrice = promo.discount_value;
                }
                badge = (
                  <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-bold animate-pulse">In promozione</span>
                );
                oldPrice = (
                  <span className="text-neutral-400 line-through text-sm ml-2">€{prod.price?.toFixed(2)}</span>
                );
              }
            }
            return (
              <div key={prod.id} className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-lg ${promo ? 'ring-2 ring-pink-300' : ''}`}
                onClick={() => navigate(`/prodotto/${prod.id}`)}>
                <div className="h-48 overflow-hidden relative">
                  {prod.images && prod.images.length > 0 ? (
                    <img 
                      src={prod.images[0]}
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
    </>
  );
}