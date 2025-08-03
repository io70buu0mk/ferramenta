import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function OrderReviewPage() {
  const { state } = useCart();
  const navigate = useNavigate();
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
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>Torna al carrello</Button>
          <Button onClick={() => navigate("/checkout")}>Procedi al checkout</Button>
        </div>
      </div>
    </div>
  );
}
