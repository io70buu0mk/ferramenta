// Funzione Edge Supabase per invio SMS tramite Twilio
import { serve } from 'std/server';

// Questi valori devono essere impostati come variabili d'ambiente su Supabase
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Metodo non consentito:', req.method);
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { to, body } = await req.json();
    console.log('Richiesta ricevuta:', { to, body });

    if (!to || !body) {
      console.log('Parametri mancanti:', { to, body });
      return new Response('Missing to or body', { status: 400, headers: corsHeaders });
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_FROM_NUMBER!);
    params.append('Body', body);

    console.log('Invio richiesta a Twilio:', {
      url,
      from: TWILIO_FROM_NUMBER,
      to,
      body,
      accountSid: TWILIO_ACCOUNT_SID ? 'PRESENTE' : 'MANCANTE',
      authToken: TWILIO_AUTH_TOKEN ? 'PRESENTE' : 'MANCANTE',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await res.text();
    console.log('Risposta Twilio:', res.status, responseText);

    if (!res.ok) {
      return new Response(`Twilio error: ${responseText}`, { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, twilio: responseText }), { status: 200, headers: corsHeaders });
  } catch (e) {
    console.log('Errore:', e);
    return new Response(`Error: ${e}`, { status: 500, headers: corsHeaders });
  }
});
