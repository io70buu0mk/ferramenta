// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@13.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});


serve(async (req) => {
  const logs = [];
  logs.push({ step: "requestMethod", value: req.method });
  logs.push({ step: "requestUrl", value: req.url });
  logs.push({ step: "requestHeaders", value: JSON.stringify([...req.headers]) });

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  logs.push({ step: "stripeSignature", value: sig });
  logs.push({ step: "webhookSecretSet", value: !!webhookSecret });
  let event;

  try {
    const body = await req.text();
    logs.push({ step: "rawBody", value: body });
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret!);
    logs.push({ step: "stripeEventType", value: event.type });
  } catch (err) {
    logs.push({ step: "webhookError", value: err.message });
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}`, logs }), { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    logs.push({ step: "paymentIntent", value: paymentIntent });
    const metadata = paymentIntent.metadata;
    logs.push({ step: "metadata", value: metadata });
    const email = metadata.email;
    let products = [];
    try {
      products = JSON.parse(metadata.products);
      logs.push({ step: "parsedProducts", value: products });
    } catch (e) {
      logs.push({ step: "productsParseError", value: e.message });
    }

    // Salva ordine su Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    logs.push({ step: "supabaseUrl", value: supabaseUrl });
    logs.push({ step: "supabaseKeySet", value: !!supabaseKey });
    let orderRes, orderJson, order;
    try {
      orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
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
      logs.push({ step: "orderResStatus", value: orderRes.status });
      orderJson = await orderRes.json();
      logs.push({ step: "orderResJson", value: orderJson });
      [order] = orderJson;
    } catch (e) {
      logs.push({ step: "orderSaveError", value: e.message });
    }

    // Salva prodotti acquistati
    for (const p of products) {
      try {
        const itemRes = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
          method: "POST",
          headers: {
            "apikey": supabaseKey!,
            "Authorization": `Bearer ${supabaseKey!}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            order_id: order?.id,
            product_id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: p.price
          })
        });
        logs.push({ step: "itemResStatus", value: itemRes.status, product: p });
        const itemJson = await itemRes.json();
        logs.push({ step: "itemResJson", value: itemJson, product: p });
      } catch (e) {
        logs.push({ step: "itemSaveError", value: e.message, product: p });
      }
    }
    return new Response(JSON.stringify({ received: true, logs }), { status: 200 });
  }

  logs.push({ step: "eventTypeNotHandled", value: event.type });
  return new Response(JSON.stringify({ received: true, logs }), { status: 200 });
});
