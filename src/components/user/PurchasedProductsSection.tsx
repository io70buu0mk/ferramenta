import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  in_preparazione: "bg-yellow-100 text-yellow-800 border-yellow-400",
  spedito: "bg-blue-100 text-blue-800 border-blue-400",
  consegnato: "bg-green-100 text-green-800 border-green-400",
  sconosciuto: "bg-gray-100 text-gray-800 border-gray-400"
};

export default function PurchasedProductsSection({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('orders')
      .select('id, created_at, delivery_date, delivery_location, payment_method, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          // Flat map tutti gli order_items con info ordine
          const items = data.flatMap(order =>
            (order.order_items || []).filter(item => item.product_status !== 'carrello')
              .map(item => ({
                ...item,
                order: {
                  created_at: order.created_at,
                  delivery_date: order.delivery_date,
                  delivery_location: order.delivery_location,
                  payment_method: order.payment_method
                }
              }))
          );
          setItems(items);
        }
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Prodotti acquistati</h2>
      {loading ? (
        <div>Caricamento...</div>
      ) : items.length === 0 ? (
        <div>Nessun prodotto acquistato.</div>
      ) : (
        <ul className="space-y-4">
          {items.map(item => {
            const isPreparazione = item.product_status === 'in_preparazione';
            return (
              <li
                key={item.id}
                className={`p-4 rounded-lg shadow bg-white flex flex-col md:flex-row md:items-center md:justify-between border-2 ${statusColors[item.product_status] || statusColors.sconosciuto}`}
              >
                <div>
                  <div className="font-semibold">{item.name} x{item.quantity}</div>
                  <div className="text-sm text-neutral-600">Ordine del: {new Date(item.order.created_at).toLocaleString()}</div>
                  <div className="text-sm text-neutral-600">Luogo: {item.order.delivery_location}</div>
                </div>
                <div
                  className={`mt-2 md:mt-0 px-3 py-1 rounded-full font-bold ${isPreparazione ? 'text-xs' : 'text-sm'} ${statusColors[item.product_status] || statusColors.sconosciuto}`}
                  style={isPreparazione ? { minWidth: '90px', textAlign: 'center' } : {}}
                >
                  {item.product_status.replace('_', ' ')}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
