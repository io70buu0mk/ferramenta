import { useCart } from '../hooks/useCart';
import { useProductPromotions } from '../hooks/useProductPromotions';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { wishlist } = useCart();
  const { products } = useProductPromotions();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f7] to-[#f8e8e3] pb-16">
      {/* Header con pulsante indietro */}
      <header className="w-full flex items-center px-6 py-4 bg-white border-b sticky top-0 z-40 shadow-sm">
        <button
          className="mr-4 flex items-center gap-2 text-black hover:text-neutral-700 font-semibold"
          onClick={() => navigate('/prodotti')}
        >
          <ArrowLeft size={24} color="black" />
          <span className="text-black">Indietro</span>
        </button>
        <Heart size={28} color="#ec4899" className="mr-2" />
        <span className="text-xl font-bold text-neutral-800">I tuoi preferiti</span>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {(() => {
          const preferiti = products && wishlist.items.length > 0 ? products.filter(p => wishlist.items.includes(p.id)) : [];
          if (!preferiti.length) {
            return <div className="text-neutral-500 text-center mt-16">Non hai ancora prodotti preferiti.</div>;
          }
          return (
            <div className="bg-white/70 rounded-2xl p-8 shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 border border-pink-100">
              {preferiti.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow flex flex-col items-center border border-pink-200 hover:shadow-lg transition-all p-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-pink-50 border border-pink-200">
                    <img src={item.images?.[0] || '/placeholder.svg'} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <h2 className="font-semibold text-lg mb-2 text-center text-pink-700">{item.name}</h2>
                  <p className="text-amber-700 font-bold mb-2 text-lg">€{item.price?.toFixed(2)}</p>
                  <button
                    className="text-white bg-pink-500 px-4 py-2 rounded-lg shadow hover:bg-pink-600 font-semibold mt-2"
                    onClick={() => navigate(`/prodotto/${item.id}`)}
                  >
                    Vai al prodotto
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
