import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

  // Fetch user profile when selectedOrder changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (selectedOrder && selectedOrder.user_id) {
        try {
          const res = await fetch(`https://bqrqujqlaizirskgvyst.supabase.co/rest/v1/user_profiles?id=eq.${selectedOrder.user_id}`, {
            headers: {
              apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnF1anFsYWl6aXJza2d2eXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4NjcyOSwiZXhwIjoyMDY1NDYyNzI5fQ.v73rp5FQmLVy_R6JYwxHbRu0Qt-pTU2suH0ysE-rICU",
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnF1anFsYWl6aXJza2d2eXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4NjcyOSwiZXhwIjoyMDY1NDYyNzI5fQ.v73rp5FQmLVy_R6JYwxHbRu0Qt-pTU2suH0ysE-rICU`,
            },
          });
          const data = await res.json();
          setUserProfile(data && data.length > 0 ? data[0] : null);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchProfile();
  }, [selectedOrder]);

  // Filtraggio e ricerca
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !search ||
      (order.email && order.email.toLowerCase().includes(search.toLowerCase())) ||
      (userProfile && userProfile.nome && userProfile.nome.toLowerCase().includes(search.toLowerCase())) ||
      (userProfile && userProfile.cognome && userProfile.cognome.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPayment = !filterPayment || order.payment_type === filterPayment;
    const matchesDate = !filterDate || (order.created_at && order.created_at.startsWith(filterDate));
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Ordini ricevuti</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Cerca per email, nome, cognome"
          className="border rounded px-2 py-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
                <div className="font-semibold">{order.email}</div>
                <div className="text-sm text-neutral-500">Totale: €{order.total}</div>
                <div className="text-xs text-neutral-400">{order.status}</div>
                <div className="text-xs text-neutral-400">Pagamento: {order.payment_type || '-'}</div>
                <div className="text-xs text-neutral-400">Consegna: {order.delivery_type || '-'}</div>
                {order.delivery_address && <div className="text-xs text-neutral-400">Indirizzo: {order.delivery_address}</div>}
                {order.notes && <div className="text-xs text-neutral-400">Note: {order.notes}</div>}
                {order.created_at && <div className="text-xs text-neutral-400">Data: {new Date(order.created_at).toLocaleString()}</div>}
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
            {userProfile && (
              <>
                <div className="mb-2">Nome: {userProfile.nome} {userProfile.cognome}</div>
                <div className="mb-2">Telefono: {userProfile.numero_telefono || '-'}</div>
              </>
            )}
            <div className="mb-2">Totale: €{selectedOrder.total}</div>
            <div className="mb-2">Stato: {selectedOrder.status}</div>
            <div className="mb-2">Pagamento: {selectedOrder.payment_type || '-'}</div>
            <div className="mb-2">Consegna: {selectedOrder.delivery_type || '-'}</div>
            {selectedOrder.delivery_address && <div className="mb-2">Indirizzo: {selectedOrder.delivery_address}</div>}
            {selectedOrder.notes && <div className="mb-2">Note: {selectedOrder.notes}</div>}
            {selectedOrder.created_at && <div className="mb-2">Data: {new Date(selectedOrder.created_at).toLocaleString()}</div>}
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
