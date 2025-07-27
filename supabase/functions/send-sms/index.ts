// Funzione Edge Supabase per invio SMS tramite Twilio
import { serve } from 'std/server';

// Questi valori devono essere impostati come variabili d'ambiente su Supabase
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER');

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { to, body } = await req.json();
    if (!to || !body) {
      return new Response('Missing to or body', { status: 400 });
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_FROM_NUMBER!);
    params.append('Body', body);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const error = await res.text();
      return new Response(`Twilio error: ${error}`, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500 });
  }
});
