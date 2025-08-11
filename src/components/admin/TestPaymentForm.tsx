import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function TestPaymentFormInner() {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState(0.5);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handleTestPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setClientSecret(null);
    setPaymentResult(null);
    try {
      // Recupera token JWT utente loggato
      const { data } = await supabase.auth.getSession();
      const token = data.session ? data.session.access_token : "";
      const res = await fetch("https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email,
          products: [{ id: "test-product", name: productName || "Prodotto Test", price: Number(price), quantity: Number(quantity) }]
        })
      });
      const dataRes = await res.json().catch(() => ({}));
      setResult({ status: res.status, data: dataRes });
      if (dataRes.clientSecret) setClientSecret(dataRes.clientSecret);
    } catch (e: any) {
      setError(e.message || "Errore di rete");
    }
    setLoading(false);
  };

  const handleConfirmPayment = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setPaymentResult(null);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { email },
        },
      });
      setPaymentResult(result);
    } catch (e: any) {
      setPaymentResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input type="email" className="w-full border rounded-lg p-2 bg-neutral-50" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium text-neutral-700 mb-1">Nome prodotto</label>
        <input type="text" className="w-full border rounded-lg p-2 bg-neutral-50" value={productName} onChange={e => setProductName(e.target.value)} required />
      </div>
      <div className="mb-2 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Prezzo (€)</label>
          <input type="number" min="0.5" step="0.01" className="w-full border rounded-lg p-2 bg-neutral-50" value={price} onChange={e => setPrice(Number(e.target.value))} required />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Quantità</label>
          <input type="number" min="1" step="1" className="w-full border rounded-lg p-2 bg-neutral-50" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
        </div>
      </div>
      <Button onClick={handleTestPayment} disabled={loading || !email || !productName || price < 0.5 || quantity < 1} className="w-full mb-2">
        {loading ? "Invio..." : "Crea PaymentIntent di test"}
      </Button>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && result.status !== 200 && (
        <div className="bg-red-100 border border-red-300 rounded p-2 text-xs mt-2">
          <b>Errore:</b>
          <pre>Status: {result.status}</pre>
          <pre>{JSON.stringify(result.data?.error || result.data, null, 2)}</pre>
        </div>
      )}
      {clientSecret && (
        <div className="mt-4">
          <div className="mb-2">Inserisci una carta di test (es. 4242 4242 4242 4242, qualsiasi data e CVC):</div>
          <div className="border rounded-lg p-3 bg-neutral-50 mb-2">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          <Button onClick={handleConfirmPayment} disabled={loading} className="w-full mb-2">
            {loading ? "Elaborazione..." : "Conferma pagamento di test"}
          </Button>
          {paymentResult && (
            <div className="bg-neutral-100 border border-neutral-300 rounded p-2 text-xs mt-2">
              <b>Risultato pagamento:</b>
              <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TestPaymentForm() {
  return (
    <Elements stripe={stripePromise}>
      <TestPaymentFormInner />
    </Elements>
  );
}
