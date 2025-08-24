import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePromotions } from "@/hooks/usePromotions";
import { PromotionForm } from "./PromotionForm";
import { Percent, Plus, Calendar, Euro, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function ProductPromotionsManager({ productId }) {
  const { promotions, loading, deletePromotion, getPromotionProducts } = usePromotions();
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [productPromotions, setProductPromotions] = useState([]);

  useEffect(() => {
    if (promotions.length > 0 && productId) {
      const filtered = promotions.filter(promo => Array.isArray(promo.product_ids) && promo.product_ids.includes(productId));
      setProductPromotions(filtered);
    } else {
      setProductPromotions([]);
    }
  }, [promotions, productId]);

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa promozione?')) {
      await deletePromotion(id);
    }
  };

  const isPromotionActive = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    return promotion.is_active && now >= start && now <= end;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Percent size={16} className="text-white" />
            </div>
            Promozioni Prodotto
          </h2>
          <p className="text-neutral-600 mt-1">Gestisci le promozioni associate a questo prodotto</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPromotion(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white"
        >
          <Plus size={16} className="mr-2" />
          Nuova Promozione
        </Button>
      </div>
      {productPromotions.length === 0 ? (
        <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Nessuna promozione per questo prodotto</h3>
            <Button
              onClick={() => {
                setSelectedPromotion(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white"
            >
              <Plus size={16} className="mr-2" />
              Crea Promozione
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productPromotions.map((promotion) => (
            <Card key={promotion.id} className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-neutral-800 mb-2">
                      {promotion.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isPromotionActive(promotion) ? "default" : "secondary"}
                        className={`text-xs ${
                          isPromotionActive(promotion)
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isPromotionActive(promotion) ? "Attiva" : "Non Attiva"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {promotion.discount_type === 'percentage' ? 'Percentuale' : 'Prezzo Fisso'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(promotion)}
                      className="h-8 w-8 p-0 hover:bg-amber-50"
                    >
                      <Edit size={14} className="text-amber-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(promotion.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {promotion.description && (
                  <p className="text-sm text-neutral-600">{promotion.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {promotion.discount_type === 'percentage' ? (
                    <Percent size={14} className="text-green-500" />
                  ) : (
                    <Euro size={14} className="text-green-500" />
                  )}
                  <span className="font-medium text-neutral-700">
                    {promotion.discount_type === 'percentage' 
                      ? `${promotion.discount_value}% di sconto`
                      : `€${promotion.discount_value.toFixed(2)}`
                    }
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(promotion.start_date), 'dd MMM yyyy HH:mm', { locale: it })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(promotion.end_date), 'dd MMM yyyy HH:mm', { locale: it })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PromotionForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setSelectedPromotion(null);
        }}
        promotion={selectedPromotion}
        productId={productId}
        hideProductSelector={true}
      />
    </div>
  );
}
