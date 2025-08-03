import React, { useState } from "react";
import { useEffect as useEffectReact } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function UserOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffectReact(() => {
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

  // Filtraggio
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPayment = !filterPayment || order.payment_type === filterPayment;
    const matchesDate = !filterDate || (order.created_at && order.created_at.startsWith(filterDate));
    return matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">I miei ordini</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <select className="border rounded px-2 py-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="border rounded px-2 py-1" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
          <option value="">Tutti i pagamenti</option>
          <option value="carta">Carta</option>
          <option value="contanti">Contanti</option>
        </select>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
      </div>
      {loading && <div>Caricamento...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y divide-neutral-200">
        {filteredOrders.map(order => (
          <li key={order.id} className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">Totale: €{order.total}</div>
                <div className="text-xs text-neutral-400">{order.status}</div>
              </div>
              <Button size="sm" onClick={() => setSelectedOrder(order)}>Dettagli</Button>
            </div>
          </li>
        ))}
      </ul>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Dettaglio ordine</h2>
            <div className="mb-2">Totale: {selectedOrder.total}</div>
            <div className="mb-2">Stato: {selectedOrder.status}</div>
            {selectedOrder.created_at && (
              <div className="mb-2">Data: {new Date(selectedOrder.created_at).toLocaleString()}</div>
            )}
            {selectedOrder.payment_type && (
              <div className="mb-2">Pagamento: {selectedOrder.payment_type}</div>
            )}
            {selectedOrder.delivery_address && (
              <div className="mb-2">Luogo di consegna: {selectedOrder.delivery_address}</div>
            )}
            {selectedOrder.notes && (
              <div className="mb-2">Note: {selectedOrder.notes}</div>
            )}
            <div className="mb-4">Prodotti:</div>
            <ul className="mb-4">
              {selectedOrder.order_items?.map((item: any) => (
                <li key={item.id} className="mb-2">
                  {item.name} x{item.quantity} - {item.price}
                </li>
              ))}
            </ul>
            <Button onClick={() => setSelectedOrder(null)}>Chiudi</Button>
          </div>
        </div>
      )}
    </div>
  );
}
