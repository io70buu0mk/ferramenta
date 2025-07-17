import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-amber-600">Pagamento completato!</h2>
        <p className="mb-6 text-neutral-700">Grazie per il tuo ordine. Riceverai una mail di conferma a breve.</p>
        <Button onClick={() => navigate("/")}>Torna alla Home</Button>
      </div>
    </div>
  );
}
