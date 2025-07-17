import React from "react";
import { useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/checkout/CheckoutForm";

// Sostituisci con la tua chiave pubblica Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-neutral-800">Pagamento</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
        <button
          className="mt-6 w-full py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold border border-neutral-200"
          onClick={() => navigate(-1)}
        >
          Torna indietro
        </button>
      </div>
    </div>
  );
}
