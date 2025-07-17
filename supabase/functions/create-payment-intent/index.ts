// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};



serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const { email, products } = await req.json();
    if (!email || !products || !Array.isArray(products) || products.length === 0) {
      return new Response("Dati mancanti", { status: 400, headers: corsHeaders });
    }
    const amount = products.reduce(
      (sum: number, p: any) => sum + Math.round(Number(p.price) * 100) * p.quantity,
      0
    );
    if (amount < 50) {
      return new Response("Importo minimo 0.50€", { status: 400, headers: corsHeaders });
    }
    // Chiamata REST API Stripe
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const body = {
      amount,
      currency: "eur",
      receipt_email: email,
      metadata: {
        products: JSON.stringify(products.map((p: any) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price
        }))),
        email,
      },
    };
    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(amount),
        currency: "eur",
        receipt_email: email,
        "metadata[products]": body.metadata.products,
        "metadata[email]": email,
      }),
    });
    if (!stripeRes.ok) {
      const err = await stripeRes.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: corsHeaders });
    }
    const paymentIntent = await stripeRes.json();
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});