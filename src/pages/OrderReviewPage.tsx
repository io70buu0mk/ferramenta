import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function OrderReviewPage() {
  const { state } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentType, setPaymentType] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const items = state.items;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-neutral-800">Riepilogo ordine</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Prodotti nel carrello:</h3>
          <ul className="divide-y divide-neutral-200 mb-2">
            {items.map(item => (
              <li key={item.id} className="py-2 flex justify-between items-center">
                <span>{item.name} x{item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Totale:</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Email per la ricevuta</label>
          <input
            type="email"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            placeholder="La tua email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo di pagamento</label>
          <select
            className="w-full border rounded-lg p-3 bg-neutral-50"
            value={paymentType}
            onChange={e => setPaymentType(e.target.value)}
            required
          >
            <option value="">Seleziona...</option>
            <option value="carta">Carta</option>
            <option value="contanti">Contanti</option>
            <option value="bonifico">Bonifico</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Consegna o ritiro</label>
          <select
            className="w-full border rounded-lg p-3 bg-neutral-50"
            value={deliveryType}
            onChange={e => setDeliveryType(e.target.value)}
            required
          >
            <option value="">Seleziona...</option>
            <option value="consegna">Consegna a domicilio</option>
            <option value="ritiro">Ritiro in negozio</option>
          </select>
        </div>
        {deliveryType === "consegna" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Indirizzo di consegna</label>
            <input
              type="text"
              className="w-full border rounded-lg p-3 bg-neutral-50"
              placeholder="Indirizzo completo"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              required={deliveryType === "consegna"}
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Note aggiuntive</label>
          <textarea
            className="w-full border rounded-lg p-3 bg-neutral-50"
            placeholder="Es. orario preferito, richieste particolari..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" id="acceptTerms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
          <label htmlFor="acceptTerms" className="text-sm">Accetto i <a href="/termini" className="underline" target="_blank" rel="noopener noreferrer">termini e condizioni</a></label>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>Torna al carrello</Button>
          <Button
            onClick={() => {
              if (!email || !acceptTerms || !paymentType || !deliveryType || (deliveryType === "consegna" && !deliveryAddress)) return;
              navigate("/checkout", {
                state: {
                  email,
                  paymentType,
                  deliveryType,
                  deliveryAddress: deliveryType === "consegna" ? deliveryAddress : undefined,
                  notes
                }
              });
            }}
            disabled={!email || !acceptTerms || !paymentType || !deliveryType || (deliveryType === "consegna" && !deliveryAddress)}
          >
            Procedi al pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
