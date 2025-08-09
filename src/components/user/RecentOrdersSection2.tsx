import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
const statusMap: Record<string, { label: string; color: string }> = {
  in_preparazione: { label: "In preparazione", color: "bg-yellow-100 text-yellow-800" },
  spedito: { label: "Spedito", color: "bg-blue-100 text-blue-800" },
  consegnato: { label: "Consegnato", color: "bg-green-100 text-green-800" },
  sconosciuto: { label: "Sconosciuto", color: "bg-gray-100 text-gray-800" }
};
export default function RecentOrdersSection({ userId, onViewAll }: { userId?: string, onViewAll: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('orders')
      .select('id, created_at, status, total, delivery_date')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setOrders(data);
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
          {orders.map((order, idx) => (
            <li key={order.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${statusMap[order.status]?.color || statusMap.sconosciuto.color}`}>{idx + 1}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Ordine #{order.id.slice(-5)}</span>
                  <span className="text-xs text-neutral-400 ml-2">{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusMap[order.status]?.color || statusMap.sconosciuto.color}`}>{statusMap[order.status]?.label || 'Sconosciuto'}</span>
                  <span className="text-xs text-neutral-500">Totale: €{order.total?.toFixed(2) ?? '--'}</span>
                  {order.delivery_date && <span className="text-xs text-neutral-400">Consegna: {new Date(order.delivery_date).toLocaleDateString('it-IT')}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
