import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
// Stili e label coerenti con UserOrdersPage
const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  in_preparazione: "bg-yellow-100 text-yellow-800 border-yellow-300",
  spedito: "bg-blue-100 text-blue-800 border-blue-300",
  consegnato: "bg-green-100 text-green-800 border-green-300",
  cancellato: "bg-red-100 text-red-800 border-red-300",
};
const statusLabel: Record<string, string> = {
  pending: "In attesa",
  in_preparazione: "In preparazione",
  spedito: "Spedito",
  consegnato: "Consegnato",
  cancellato: "Cancellato",
};
export default function RecentOrdersSection({ userId, onViewAll }: { userId?: string, onViewAll: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('orders')
      .select('id, created_at, status, total, delivery_date, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) {
          // Per ogni ordine, trova lo stato "più avanzato" tra gli order_items (come fa PurchasedProductsSection)
          const ordersWithStatus = data.map(order => {
            // Prendi solo gli item che non sono carrello
            const items = (order.order_items || []).filter(item => item.product_status !== 'carrello');
            // Trova lo stato più "avanzato" (consegnato > spedito > in_preparazione > altro)
            let status = 'sconosciuto';
            if (items.length > 0) {
              if (items.some(i => i.product_status === 'consegnato')) status = 'consegnato';
              else if (items.some(i => i.product_status === 'spedito')) status = 'spedito';
              else if (items.some(i => i.product_status === 'in_preparazione')) status = 'in_preparazione';
              else status = items[0].product_status || 'sconosciuto';
            }
            return { ...order, real_status: status };
          });
          setOrders(ordersWithStatus);
        }
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-[#f8e8e3] shadow p-4 flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-[#b43434] text-base">Ordini recenti</span>
        <button
          className="ml-auto text-xs text-neutral-500 cursor-pointer hover:underline flex items-center gap-1"
          onClick={onViewAll}
        >
          Vedi tutti <ArrowRight size={14} />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="animate-spin" /></div>
      ) : orders.length === 0 ? (
        <span className="text-xs text-neutral-400">Nessun ordine recente</span>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order, idx) => {
            const status = order.real_status || "sconosciuto";
            return (
              <li key={order.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${statusBadge[status] || 'bg-gray-100 text-gray-800 border-gray-400'}`}>{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Ordine #{order.id.slice(-5)}</span>
                    <span className="text-xs text-neutral-400 ml-2">{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full font-bold border-2 ${statusBadge[status] || 'bg-gray-100 text-gray-800 border-gray-400'}`}
                      style={status === 'in_preparazione' || status === 'pending' ? { minWidth: '90px', textAlign: 'center', fontSize: '0.75rem' } : { fontSize: '0.875rem' }}
                    >
                      {statusLabel[status] || status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-neutral-500">Totale: €{order.total?.toFixed(2) ?? '--'}</span>
                    {order.delivery_date && <span className="text-xs text-neutral-400">Consegna: {new Date(order.delivery_date).toLocaleDateString('it-IT')}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
