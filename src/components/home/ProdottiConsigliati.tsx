import React from "react";
import { usePublicProducts } from "@/hooks/usePublicProducts";
import { useProductPromotions } from "@/hooks/useProductPromotions";
import { ShoppingCart, Wrench, Package } from "lucide-react";
import { getSignedImageUrl } from "@/integrations/supabase/imageUpload";

function ProdottiConsigliati() {
  const { products, loading } = usePublicProducts();
  const { promoProductIds } = useProductPromotions();
  // Mostra solo gli ultimi 5 prodotti
  const lastProducts = React.useMemo(() => products.slice(0, 5), [products]);
  // Stato per le signed URL delle immagini
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function fetchImageUrls() {
      const urls = await Promise.all(
        lastProducts.map(async (product, idx) => {
          let url = '/placeholder.svg';
          let path = product.images && product.images[0] ? product.images[0] : '';
          if (path) {
            url = await getSignedImageUrl(path);
          }
          console.log(`[ProdottiConsigliati] Prodotto #${idx} - Path:`, path, 'Signed URL:', url);
          return url;
        })
      );
      setImageUrls(urls);
    }
    fetchImageUrls();
  }, [lastProducts]);

  // ...existing code...
  return (
    <section id="prodotti" className="section-transparent w-full py-16 px-5 border-b border-cemento/20 texture-overlay">
      <div className="max-w-6xl mx-auto flex flex-col items-start">
        <h2 className="font-oswald text-3xl md:text-4xl font-bold text-bianco mb-6 pl-1 font-header animate-fade-in">
          <span className="bg-gradient-to-r from-bianco via-sabbia to-senape bg-clip-text text-transparent drop-shadow-2xl">
            I nostri prodotti best-seller
          </span>
        </h2>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-prodotto animate-fade-in">
                <div className="h-40 bg-neutral-200 animate-pulse rounded-t-2xl"></div>
                <div className="px-6 py-5">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))
          ) : lastProducts.length > 0 ? (
            lastProducts.map((product, index) => {
              const isPromo = promoProductIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className={`card-prodotto group animate-fade-in ${isPromo ? 'promo-product' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                <div className="h-40 overflow-hidden relative rounded-t-2xl" style={{background: '#fafafa'}}>
                  {imageUrls[index] ? (
                    <img 
                      src={imageUrls[index]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <Package size={32} className="text-neutral-400" />
                    </div>
                  )}
                  {isPromo && (
                    <div className="promo-badge">In promozione</div>
                  )}
                  {/* DEBUG VISIVO RIMOSSO: ora solo log in console */}
                </div>
                <div className="px-6 py-5 flex flex-col flex-1 h-full">
                  <div className="flex items-center gap-3 font-bold text-xl mb-2 font-oswald text-verdesalvia">
                    {product.name}
                  </div>
                  <div className="text-cemento text-sm font-lato font-light flex-1 mb-4 leading-relaxed">
                    {product.description}
                  </div>
                  <button className="btn-azione flex items-center justify-center gap-2 mt-auto group">
                    <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
                    Aggiungi al carrello
                  </button>
                  {/* DEBUG VISIVO TEMPORANEO */}
                  <div className="mt-4 p-2 bg-neutral-100 text-xs text-cemento rounded shadow">
                    <div><b>Path:</b> {product.images && product.images[0] ? product.images[0] : 'Nessun path'}</div>
                    <div><b>Signed URL:</b> {imageUrls[index]}</div>
                  </div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Package size={64} className="mx-auto mb-4 text-neutral-400" />
              <h3 className="text-xl font-bold text-neutral-600 mb-2">
                Nessun prodotto trovato
              </h3>
              <p className="text-neutral-500 mb-6">
                Al momento non ci sono prodotti disponibili.
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end w-full mt-12">
          <a
            href="/prodotti"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-bianco/95 to-bianco/90 backdrop-blur-lg border-2 border-senape/50 text-verdesalvia text-lg font-oswald px-8 py-3 rounded-2xl shadow-2xl hover-3d transition-all duration-300 group"
          >
            <ShoppingCart size={20} className="transition-transform group-hover:scale-110 icon-glow" />
            Vedi tutti i prodotti
          </a>
        </div>
      </div>
    </section>
  );
}

export default ProdottiConsigliati;
