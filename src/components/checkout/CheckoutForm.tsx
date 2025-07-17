import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { state } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const products = state.items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe non è pronto.");
      setLoading(false);
      return;
    }
    if (!email) {
      setError("Inserisci la tua email.");
      setLoading(false);
      return;
    }
    if (products.length === 0) {
      setError("Il carrello è vuoto.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://bqrqujqlaizirskgvyst.functions.supabase.co/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, products }),
      });
      const data = await res.json();
      if (!data.clientSecret) {
        setError("Errore nella creazione del pagamento.");
        setLoading(false);
        return;
      }
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { email },
        },
      });
      if (result.error) {
        setError(result.error.message || "Errore nel pagamento.");
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        navigate("/order-confirmation");
      }
    } catch (err: any) {
      setError(err.message || "Errore di rete.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
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
        <label className="block text-sm font-medium text-neutral-700 mb-2">Carta di credito</label>
        <div className="border rounded-lg p-3 bg-neutral-50">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? "Elaborazione..." : "Paga ora"}
      </Button>
    </form>
  );
}
