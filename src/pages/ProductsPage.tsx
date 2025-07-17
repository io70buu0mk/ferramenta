import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '../hooks/useCart';
import { Heart } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  Search, 
  Filter, 
  Package, 
  ArrowLeft, 
  LogIn, 
  LogOut, 
  UserIcon, 
  Shield,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { usePublicProducts } from "@/hooks/usePublicProducts";
import { usePromotions } from "@/hooks/usePromotions";
import { useEffect as useEffectReact } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CartModalTrigger from "@/components/user/CartModalTrigger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const { dispatch, wishlist, wishlistDispatch } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showFilters, setShowFilters] = useState(false);
  
  const { role, loading: roleLoading, isAdmin } = useUserRole(user);
  const { products, loading: productsLoading } = usePublicProducts();
  const { promotions, loading: promotionsLoading, refetch, getPromotionProducts } = usePromotions();
  const [promoOnly, setPromoOnly] = useState(false);
  const [promotionProducts, setPromotionProducts] = useState<{product_id: string, promotion_id: string}[]>([]);

  // Carica tutte le relazioni prodotto-promozione attive
  useEffectReact(() => {
    const fetchPromotionProducts = async () => {
      // Prendi solo promozioni attive e nel periodo
      const now = new Date();
      const activePromos = promotions.filter(p => p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now);
      if (activePromos.length === 0) {
        setPromotionProducts([]);
        return;
      }
      // Prendi tutte le relazioni per queste promozioni
      let allRelations: {product_id: string, promotion_id: string}[] = [];
      for (const promo of activePromos) {
        const rels = await getPromotionProducts(promo.id);
        if (rels && Array.isArray(rels)) {
          allRelations = allRelations.concat(rels.map((r: any) => ({ product_id: r.product_id, promotion_id: promo.id })));
        }
      }
      setPromotionProducts(allRelations);
    };
    fetchPromotionProducts();
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return uniqueCategories;
  }, [products]);

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      let matchesPrice = true;
      if (priceRange !== "all" && product.price) {
        switch (priceRange) {
          case "0-50":
            matchesPrice = product.price <= 50;
            break;
          case "50-100":
            matchesPrice = product.price > 50 && product.price <= 100;
            break;
          case "100-200":
            matchesPrice = product.price > 100 && product.price <= 200;
            break;
          case "200+":
            matchesPrice = product.price > 200;
            break;
        }
      }
      const matchesPromo = !promoOnly || promoProductIds.has(product.id);
      return matchesSearch && matchesCategory && matchesPrice && matchesPromo;
    });
    // Sort products
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "newest":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, promoOnly, promoProductIds]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange("all");
    setSortBy("name");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Torna alla Home</span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-neutral-800">
                    Catalogo Prodotti
                  </h1>
                  <p className="text-sm text-neutral-600 hidden sm:block">
                    Scopri tutti i nostri prodotti
                  </p>
                </div>
              </div>
            </div>

            {/* Auth Section + Cart Modal Trigger */}
            <div className="flex items-center gap-2">
              <CartModalTrigger className="ml-2" />
              {user ? (
                <div className="flex items-center gap-2">
                  {roleLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl">
                      <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/cliente/${user.id}`)}
                        className="flex items-center gap-2"
                      >
                        <UserIcon size={16} />
                        <span className="hidden sm:inline">Area Cliente</span>
                      </Button>
                      
                      {isAdmin() && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/${user.id}`)}
                          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                        >
                          <Shield size={16} />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                >
                  <LogIn size={16} />
                  <span>Accedi</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Cerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-neutral-200 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 h-12 px-6"
            >
              <SlidersHorizontal size={18} />
              <span>Filtri</span>
              {(selectedCategory !== "all" || priceRange !== "all") && (
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              )}
            </Button>
          </div>

        {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Categoria
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutte le categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le categorie</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Fascia di prezzo
                  </label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti i prezzi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i prezzi</SelectItem>
                      <SelectItem value="0-50">€0 - €50</SelectItem>
                      <SelectItem value="50-100">€50 - €100</SelectItem>
                      <SelectItem value="100-200">€100 - €200</SelectItem>
                      <SelectItem value="200+">€200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ordina per
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nome A-Z</SelectItem>
                      <SelectItem value="price_asc">Prezzo crescente</SelectItem>
                      <SelectItem value="price_desc">Prezzo decrescente</SelectItem>
                      <SelectItem value="newest">Più recenti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancella filtri
                  </Button>
                  <Button
                    variant={promoOnly ? "default" : "outline"}
                    onClick={() => setPromoOnly(v => !v)}
                    className="w-full flex items-center gap-2"
                  >
                    <Package size={16} />
                    {promoOnly ? "Mostra tutti" : "Solo in promozione"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-neutral-600">
            {productsLoading ? (
              "Caricamento prodotti..."
            ) : (
              `Trovati ${filteredProducts.length} prodotti`
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-neutral-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
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
                <Card 
                  key={product.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-neutral-200/50 bg-white/80 backdrop-blur-sm ${promo ? 'ring-2 ring-pink-300' : ''}`}
                >
                  <div className="h-48 overflow-hidden relative" onClick={() => navigate(`/prodotto/${product.id}`)}>
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
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-neutral-800 flex-1">{product.name}</h3>
                      {product.category && (
                        <span className="text-xs px-2 py-1 bg-neutral-100 rounded-full text-neutral-600 ml-2 flex-shrink-0">
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <button
                        className={`mr-2 ${wishlist.items.includes(product.id) ? 'text-pink-500' : 'text-neutral-300'} hover:text-pink-500 transition`}
                        title={wishlist.items.includes(product.id) ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                        onClick={e => {
                          e.stopPropagation();
                          if (wishlist.items.includes(product.id)) {
                            wishlistDispatch({ type: 'REMOVE_WISHLIST', id: product.id });
                          } else {
                            wishlistDispatch({ type: 'ADD_WISHLIST', id: product.id });
                          }
                        }}
                      >
                        <Heart fill={wishlist.items.includes(product.id) ? '#ec4899' : 'none'} size={20} />
                      </button>
                      {finalPrice && (
                        <div className="flex items-center">
                          <p className={`font-semibold text-lg ${promo ? 'text-pink-600' : 'text-amber-600'}`}>€{finalPrice.toFixed(2)}</p>
                          {oldPrice}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#b43434] text-[#b43434] hover:bg-[#f8e8e3] p-2"
                        onClick={e => {
                          e.stopPropagation();
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
                        }}
                        disabled={product.stock_quantity <= 0}
                        title="Aggiungi al carrello"
                      >
                        <ShoppingCart size={20} />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/prodotto/${product.id}`);
                        }}
                      >
                        Scopri di più
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // No products found
            <div className="col-span-full text-center py-12">
              <Package size={64} className="mx-auto mb-4 text-neutral-400" />
              <h3 className="text-xl font-bold text-neutral-600 mb-2">
                Nessun prodotto trovato
              </h3>
              <p className="text-neutral-500 mb-6">
                Prova a modificare i filtri di ricerca o cancella tutti i filtri.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 mx-auto"
              >
                <X size={16} />
                Cancella filtri
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}