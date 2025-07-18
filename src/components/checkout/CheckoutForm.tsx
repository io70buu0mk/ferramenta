import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

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
    console.log("[CheckoutForm] Stripe ready:", !!stripe);
    console.log("[CheckoutForm] Elements ready:", !!elements);
    console.log("[CheckoutForm] Email:", email);
    console.log("[CheckoutForm] Products:", products);
    // Recupero il token JWT dell'utente autenticato
    const session = supabase.auth.getSession ? await supabase.auth.getSession() : null;
    const token = session?.data?.session?.access_token || session?.access_token || "";
    console.log("[CheckoutForm] JWT token:", token);
    if (!stripe || !elements) {
      setError("Stripe non è pronto.");
      setLoading(false);
      console.log("[CheckoutForm] Stripe non pronto");
      return;
    }
    if (!email) {
      setError("Inserisci la tua email.");
      setLoading(false);
      console.log("[CheckoutForm] Email mancante");
      return;
    }
    if (products.length === 0) {
      setError("Il carrello è vuoto.");
      setLoading(false);
      console.log("[CheckoutForm] Carrello vuoto");
      return;
    }
    try {
      console.log("[CheckoutForm] Invio richiesta a Supabase...");
      const res = await fetch("https://bqrqujqlaizirskgvyst.functions.supabase.co/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, products }),
      });
      console.log("[CheckoutForm] Risposta Supabase status:", res.status);
      const data = await res.json();
      console.log("[CheckoutForm] Risposta Supabase body:", data);
      if (!data.clientSecret) {
        setError("Errore nella creazione del pagamento.");
        setLoading(false);
        console.log("[CheckoutForm] clientSecret mancante");
        return;
      }
      console.log("[CheckoutForm] Invio conferma pagamento a Stripe...");
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { email },
        },
      });
      console.log("[CheckoutForm] Risposta Stripe:", result);
      if (result.error) {
        setError(result.error.message || "Errore nel pagamento.");
        console.log("[CheckoutForm] Errore Stripe:", result.error);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        console.log("[CheckoutForm] Pagamento riuscito:", result.paymentIntent);
        navigate("/order-confirmation");
      }
    } catch (err: any) {
      setError(err.message || "Errore di rete.");
      console.log("[CheckoutForm] Errore catch:", err);
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
