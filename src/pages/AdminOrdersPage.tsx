import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://bqrqujqlaizirskgvyst.supabase.co/rest/v1/orders?select=*,order_items(*)", {
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
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Ordini ricevuti</h1>
      {loading && <div>Caricamento...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <ul className="divide-y divide-neutral-200">
        {orders.map(order => (
          <li key={order.id} className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{order.email}</div>
                <div className="text-sm text-neutral-500">Totale: €{order.total}</div>
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
            <div className="mb-2">Email: {selectedOrder.email}</div>
            <div className="mb-2">Totale: €{selectedOrder.total}</div>
            <div className="mb-2">Stato: {selectedOrder.status}</div>
            <div className="mb-4">Prodotti:</div>
            <ul className="mb-4">
              {selectedOrder.order_items?.map((item: any) => (
                <li key={item.id} className="mb-2">
                  {item.name} x{item.quantity} - €{item.price}
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
