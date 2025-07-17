import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Settings,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Package
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useProductPromotions } from "@/hooks/useProductPromotions";
import { useNavigate } from "react-router-dom";
import ferramentaBg from "@/assets/ferramenta-bg.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { role, loading: roleLoading, isAdmin } = useUserRole(user);
  const {
    products,
    productsLoading,
    productPromotionMap,
    promoProductIds
  } = useProductPromotions();

  useEffect(() => {
    // Controllo sessione attuale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 Utente trovato:', session.user.email);
      }
    });

    // Listener per cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN' && newUser && !user) {
        console.log('✅ Nuovo login rilevato');
        setJustLoggedIn(true);
        setTimeout(() => setJustLoggedIn(false), 3000);
      }
      
      setUser(newUser);
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    console.log('📤 Logout utente');
    await supabase.auth.signOut();
  };

  // Debug logging
  useEffect(() => {
    if (user && !roleLoading) {
      console.log('🔍 Debug ruoli:', {
        userEmail: user.email,
        role: role,
        isAdmin: isAdmin(),
        roleLoading
      });
    }
  }, [user, role, roleLoading, isAdmin]);

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${ferramentaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Floating Navigation */}
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 w-[98vw] max-w-5xl md:top-6 z-50 bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl px-2 py-2 md:px-10 md:py-2 shadow-xl transition-all">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-bold text-neutral-800 text-sm md:text-lg truncate">Ferramenta Lucini</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10 min-w-0 flex-shrink flex-nowrap overflow-x-auto">
            <button 
              onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => document.getElementById('prodotti')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Prodotti
            </button>
            <button 
              onClick={() => navigate('/servizi')}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Servizi
            </button>
            <button 
              onClick={() => document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Contatti
            </button>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className={`flex items-center gap-1 md:gap-2 ${justLoggedIn ? 'animate-fadeIn' : ''}`}>
                {roleLoading ? (
                  <div className="flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 bg-neutral-100 rounded-xl">
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs md:text-sm text-neutral-600 hidden sm:inline">Caricamento...</span>
                  </div>
                ) : (
                  <>
                    <a
                      href={`/cliente/${user.id}`}
                      className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors text-xs md:text-sm font-medium text-neutral-700"
                    >
                      <UserIcon size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Area Cliente</span>
                    </a>
                    
                    {isAdmin() && (
                      <a
                        href={`/admin/${user.id}`}
                        className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all text-xs md:text-sm font-medium shadow-lg"
                      >
                        <Shield size={14} className="md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Admin</span>
                      </a>
                    )}
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 text-neutral-600 hover:text-red-600 transition-colors text-xs md:text-sm font-medium"
                >
                  <LogOut size={14} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl hover:from-amber-500 hover:to-yellow-600 transition-all text-xs md:text-sm font-medium shadow-lg"
              >
                <LogIn size={14} className="md:w-4 md:h-4" />
                <span>Accedi</span>
              </a>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-neutral-200">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium text-left"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('prodotti')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium text-left"
              >
                Prodotti
              </button>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/servizi');
                }}
                className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium text-left"
              >
                Servizi
              </button>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium text-left"
              >
                Contatti
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - With Background */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <span className="text-white drop-shadow-2xl">
                  Ferramenta
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                  di Qualità
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Da oltre 60 anni, tradizione e innovazione si incontrano per offrire strumenti professionali e servizio impeccabile.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/prodotti')}
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-2xl font-semibold hover:from-amber-500 hover:to-yellow-600 transition-all shadow-xl"
              >
                Scopri i Prodotti
              </button>
              <button 
                onClick={() => document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl font-semibold text-white hover:bg-white/30 transition-all"
              >
                Contattaci
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - White Background */}
      <section className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
              Perché Sceglierci
            </h2>
            <p className="text-xl text-neutral-600">Eccellenza in ogni dettaglio</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Qualità Garantita",
                desc: "Solo i migliori marchi e prodotti testati per durare nel tempo"
              },
              {
                icon: Settings,
                title: "Consulenza Esperta",
                desc: "Il nostro team ti guida nella scelta degli strumenti più adatti"
              },
              {
                icon: Star,
                title: "Servizio Premium",
                desc: "Assistenza personalizzata e supporto post-vendita eccezionale"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-neutral-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-neutral-800">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - With Background */}
      <section id="prodotti" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-2xl">
              I Nostri Prodotti
            </h2>
            <p className="text-xl text-white/90 drop-shadow-lg">Strumenti professionali per ogni esigenza</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">
                  <div className="h-48 bg-neutral-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-4"></div>
                    <div className="h-8 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.slice(0, 4).map((product) => {
                const promo = productPromotionMap[product.id];
                let finalPrice = product.price;
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
                return (
                  <div 
                    key={product.id}
                    className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-lg ${promo ? 'ring-2 ring-pink-300' : ''}`}
                    onClick={() => navigate(`/prodotto/${product.id}`)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
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
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-neutral-800 mb-2">{product.name}</h3>
                      {finalPrice && (
                        <div className="flex items-center mb-4">
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
              })
            ) : (
              // No products fallback
              <div className="col-span-full text-center py-12">
                <Package size={64} className="mx-auto mb-4 text-neutral-400" />
                <p className="text-neutral-600">Nessun prodotto disponibile al momento.</p>
              </div>
            )}
          </div>
          
          {/* "Vedi tutti i prodotti" button */}
          {!productsLoading && products.length > 0 && (
            <div className="text-center mt-12">
              <button 
                onClick={() => navigate('/prodotti')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl font-semibold text-white hover:bg-white/30 transition-all shadow-xl"
              >
                Vedi Tutti i Prodotti
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section - White Background */}
      <section id="contatti" className="py-24 px-6 bg-white relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
            Contattaci
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-neutral-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-lg">
              <Phone size={32} className="text-amber-500 mx-auto mb-4" />
              <p className="font-semibold text-neutral-800 mb-2">Telefono</p>
              <p className="text-neutral-600">031 1234567</p>
            </div>
            <div className="bg-white border border-neutral-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-lg">
              <Mail size={32} className="text-amber-500 mx-auto mb-4" />
              <p className="font-semibold text-neutral-800 mb-2">Email</p>
              <p className="text-neutral-600">info@ferramentalucini.it</p>
            </div>
            <div className="bg-white border border-neutral-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 shadow-lg">
              <MapPin size={32} className="text-amber-500 mx-auto mb-4" />
              <p className="font-semibold text-neutral-800 mb-2">Indirizzo</p>
              <p className="text-neutral-600">Via degli Artigiani 14, Como</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-neutral-900 text-white relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-bold">Ferramenta Lucini</h3>
          </div>
          <p className="text-neutral-400">
            &copy; {new Date().getFullYear()} Ferramenta Lucini - Eccellenza dal 1964
          </p>
        </div>
      </footer>
    </div>
  );
}
