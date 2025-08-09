import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Truck, CheckCircle, XCircle, Home, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
const statusIcon: Record<string, JSX.Element> = {
  pending: <Clock size={16} className="inline mr-1" />,
  in_preparazione: <Clock size={16} className="inline mr-1" />,
  spedito: <Truck size={16} className="inline mr-1" />,
  consegnato: <CheckCircle size={16} className="inline mr-1" />,
  cancellato: <XCircle size={16} className="inline mr-1" />,
};

export default function UserOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const getUserAndOrders = async () => {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(session.user);
      try {
        const res = await fetch(`https://bqrqujqlaizirskgvyst.supabase.co/rest/v1/orders?user_id=eq.${session.user.id}&select=*,order_items(*)`, {
          headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnF1anFsYWl6aXJza2d2eXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4NjcyOSwiZXhwIjoyMDY1NDYyNzI5fQ.v73rp5FQmLVy_R6JYwxHbRu0Qt-pTU2suH0ysE-rICU",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnF1anFsYWl6aXJza2d2eXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4NjcyOSwiZXhwIjoyMDY1NDYyNzI5fQ.v73rp5FQmLVy_R6JYwxHbRu0Qt-pTU2suH0ysE-rICU`,
          },
        });
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Errore di rete");
      }
      setLoading(false);
    };
    getUserAndOrders();
  }, []);

  if (!user) return <div className="py-10 text-center">Devi essere autenticato per vedere i tuoi ordini.</div>;

  // Filtri base (solo status per ora)
  const filteredOrders = orders.filter((order: any) => {
    if (filterStatus && order.status !== filterStatus) return false;
    // Puoi aggiungere qui altri filtri (pagamento, data)
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8e8e3] to-[#f5f5f7] py-8 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-[#b43434]" />
            <h1 className="text-3xl font-bold text-[#b43434]">I miei ordini</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#b43434] text-[#b43434] font-semibold px-3 py-2 rounded-xl flex items-center gap-2" onClick={() => navigate("/")}> <Home size={18}/> Home </Button>
            <Button variant="outline" className="border-[#b43434] text-[#b43434] font-semibold px-3 py-2 rounded-xl flex items-center gap-2" onClick={() => navigate("/cliente")}> <User size={18}/> Area clienti </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mb-8">
          <select className="border rounded-xl px-3 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="in_preparazione">In preparazione</option>
            <option value="spedito">Spedito</option>
            <option value="consegnato">Consegnato</option>
            <option value="cancellato">Cancellato</option>
          </select>
          {/* Placeholder per altri filtri */}
          <select className="border rounded-xl px-3 py-2 text-sm" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
            <option value="">Tutti i pagamenti</option>
          </select>
          <input type="date" className="border rounded-xl px-3 py-2 text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><span className="animate-spin mr-2">⏳</span>Caricamento...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-neutral-400 text-center py-8">Nessun ordine trovato.</div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order: any) => (
              <div key={order.id} className="rounded-2xl border border-neutral-200 bg-white/80 shadow flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-5">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold text-[#b43434]">€{Number(order.total).toFixed(2)}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge[order.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>{statusIcon[order.status]}{statusLabel[order.status] || order.status}</span>
                  </div>
                  <span className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleString('it-IT')}</span>
                </div>
                <Button variant="outline" className="border-[#b43434] text-[#b43434] font-semibold px-4 py-2 rounded-xl" onClick={() => setSelectedOrder(order)}>
                  Dettagli
                </Button>
              </div>
            ))}
          </div>
        )}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-[90vw]">
              <h2 className="text-xl font-bold mb-4 text-[#b43434] flex items-center gap-2"><FileText size={20}/> Dettaglio ordine</h2>
              <div className="mb-2">Totale: <b>€{Number(selectedOrder.total).toFixed(2)}</b></div>
              <div className="mb-2">Stato: <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${statusBadge[selectedOrder.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>{statusIcon[selectedOrder.status]}{statusLabel[selectedOrder.status] || selectedOrder.status}</span></div>
              <div className="mb-2">Data: {new Date(selectedOrder.created_at).toLocaleString('it-IT')}</div>
              <div className="mb-2">Prodotti:</div>
              <ul className="mb-4 list-disc pl-5">
                {selectedOrder.order_items?.map((item: any) => (
                  <li key={item.id}>{item.name} x{item.quantity} - €{Number(item.price).toFixed(2)}</li>
                ))}
              </ul>
              <Button onClick={() => setSelectedOrder(null)} className="mt-2">Chiudi</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
