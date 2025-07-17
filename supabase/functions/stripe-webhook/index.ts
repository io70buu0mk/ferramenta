// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@13.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  let event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;
    const email = metadata.email;
    const products = JSON.parse(metadata.products);

    // Salva ordine su Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey!}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        email,
        total: paymentIntent.amount / 100,
        status: "paid",
        stripe_payment_intent_id: paymentIntent.id
      })
    });
    const [order] = await orderRes.json();

    // Salva prodotti acquistati
    for (const p of products) {
      await fetch(`${supabaseUrl}/rest/v1/order_items`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${supabaseKey!}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id: order.id,
          product_id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price
        })
      });
    }
  }

  return new Response("ok", { status: 200 });
});
