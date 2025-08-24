import { useEffect, useState } from "react";
import { Percent, Calendar, Sparkles } from "lucide-react";
import { usePromotions } from "@/hooks/usePromotions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function PromotionsSummary({ productId, alwaysVisible, promotions }: { productId: string, alwaysVisible?: boolean, promotions?: any[] }) {
  const now = new Date();
  const activePromos = (promotions || []).filter(
    (promo) =>
      promo.is_active &&
      now >= new Date(promo.start_date) &&
      now <= new Date(promo.end_date) &&
      Array.isArray(promo.product_ids) && promo.product_ids.includes(productId)
  );

  return (
    <Card className="bg-gradient-to-br from-pink-100 to-yellow-50 border-pink-300 shadow-lg animate-fade-in">
      <CardContent className="py-6 px-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Sparkles size={28} className="text-pink-400 animate-bounce" />
          <h2 className="text-xl font-bold text-pink-700">Promozioni su questo prodotto</h2>
        </div>
        {activePromos.length === 0 ? (
          <div className="text-neutral-500 text-base py-4">Nessuna promozione attiva al momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePromos.map((promo) => (
              <div key={promo.id} className="flex flex-col gap-2 p-4 rounded-xl bg-white/80 border border-pink-200 shadow">
                <div className="flex items-center gap-2">
                  <Percent size={18} className="text-pink-500" />
                  <span className="font-semibold text-pink-700">{promo.name}</span>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">Attiva</Badge>
                </div>
                <div className="text-sm text-neutral-700">{promo.description}</div>
                <div className="flex items-center gap-2 text-sm">
                  {promo.discount_type === "percentage" ? (
                    <>
                      <Percent size={14} className="text-green-500" />
                      <span>{promo.discount_value}% di sconto</span>
                    </>
                  ) : (
                    <span>Prezzo fisso: <b>€{promo.discount_value.toFixed(2)}</b></span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar size={12} />
                  <span>
                    {format(new Date(promo.start_date), "dd MMM yyyy HH:mm", { locale: it })} - {format(new Date(promo.end_date), "dd MMM yyyy HH:mm", { locale: it })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}