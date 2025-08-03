import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  in_preparazione: "bg-yellow-100 text-yellow-800",
  spedito: "bg-blue-100 text-blue-800",
  consegnato: "bg-green-100 text-green-800",
  sconosciuto: "bg-gray-100 text-gray-800"
};
const statusLabels: Record<string, string> = {
  in_preparazione: "In preparazione",
  spedito: "Spedito",
  consegnato: "Consegnato",
  sconosciuto: "Sconosciuto"
};
const statusOptions = ["in_preparazione", "spedito", "consegnato", "sconosciuto"];

export default function PurchasedProductsAdminSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('orders')
      .select('id, user_id, created_at, delivery_date, delivery_location, payment_method, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const items = data.flatMap(order =>
            (order.order_items || []).filter(item => item.product_status !== 'carrello')
              .map(item => ({
                ...item,
                order: {
                  user_id: order.user_id,
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
  }, []);

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    setUpdating(itemId);
    await supabase.from('order_items').update({ product_status: newStatus }).eq('id', itemId);
    setItems(items => items.map(i => i.id === itemId ? { ...i, product_status: newStatus } : i));
    setUpdating(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Prodotti acquistati (tutti gli ordini)</h2>
      {loading ? (
        <div>Caricamento...</div>
      ) : items.length === 0 ? (
        <div>Nessun prodotto acquistato.</div>
      ) : (
        <ul className="space-y-4">
          {items.map(item => (
            <li key={item.id} className="p-4 rounded-lg shadow bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-3">
                {item.product?.image_url && <img src={item.product.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                <div>
                  <div className="font-semibold">{item.name} x{item.quantity}</div>
                  <div className="text-sm text-neutral-600">Utente: {item.order.user_id}</div>
                  <div className="text-sm text-neutral-600">Ordine del: {new Date(item.order.created_at).toLocaleString()}</div>
                  <div className="text-sm text-neutral-600">Luogo: {item.order.delivery_location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${statusColors[item.product_status] || statusColors.sconosciuto}`}>
                  {statusLabels[item.product_status] || item.product_status}
                </span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={item.product_status}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                  disabled={updating === item.id}
                >
                  {statusOptions.filter(s => s !== 'carrello').map(s => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
                {updating === item.id && <span className="text-xs text-gray-500 ml-2">Aggiornamento...</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
