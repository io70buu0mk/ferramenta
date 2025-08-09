// File: supabase/functions/get-invoices/index.ts
// Edge function per restituire le fatture Stripe di un utente
import { serve } from 'std/server';
import Stripe from 'stripe';

// Recupera la chiave segreta Stripe dalle env di Supabase
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const stripe = new Stripe(STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

serve(async (req) => {
  try {
    // Recupera user id dal JWT Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });
    const jwt = authHeader.replace('Bearer ', '');
    // Decodifica JWT per user id (Supabase lo passa come claim)
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const userId = payload.sub;
    if (!userId) return new Response('Unauthorized', { status: 401 });

    // Recupera ordini da Supabase REST API
    // Sostituisci 'orders' e 'stripe_customer_id' con i nomi reali delle tue tabelle/campi
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!ordersRes.ok) return new Response('Errore recupero ordini', { status: 500 });
    const orders = await ordersRes.json();
    if (!orders.length) return new Response(JSON.stringify([]), { status: 200 });

    // Recupera tutte le invoice Stripe per ogni customer collegato
    let allInvoices: any[] = [];
    for (const order of orders) {
      if (!order.stripe_customer_id) continue;
      const invoices = await stripe.invoices.list({ customer: order.stripe_customer_id, limit: 10 });
      allInvoices = allInvoices.concat(invoices.data.map(inv => ({
        id: inv.id,
        url: inv.invoice_pdf,
        amount: inv.amount_paid,
        created: inv.created,
        status: inv.status,
        number: inv.number,
      })));
    }
    return new Response(JSON.stringify(allInvoices), { status: 200 });
  } catch (e) {
    return new Response('Errore interno: ' + e, { status: 500 });
  }
});
