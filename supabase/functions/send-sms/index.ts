// Funzione Edge Supabase per invio SMS tramite Twilio
import { serve } from 'std/server';

// Client PostgREST per inserimento log SMS
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function logSms({ order_id, user_id, phone_number, message, status, error }: {
  order_id?: string,
  user_id?: string,
  phone_number: string,
  message: string,
  status: string,
  error?: string
}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Variabili ambiente Supabase mancanti, log SMS saltato');
    return;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sms_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        order_id,
        user_id,
        phone_number,
        message,
        status,
        error,
        sent_at: new Date().toISOString(),
      })
    });
    if (!res.ok) {
      console.log('Errore inserimento log SMS:', await res.text());
    }
  } catch (e) {
    console.log('Eccezione log SMS:', e);
  }
}

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

    // Accetta anche order_id e user_id opzionali per log
    const { to, body, order_id, user_id } = await req.json();
    console.log('Richiesta ricevuta:', { to, body, order_id, user_id });

    if (!to || !body) {
      console.log('Parametri mancanti:', { to, body });
      await logSms({ order_id, user_id, phone_number: to, message: body, status: 'error', error: 'Missing to or body' });
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
      await logSms({ order_id, user_id, phone_number: to, message: body, status: 'error', error: responseText });
      return new Response(`Twilio error: ${responseText}`, { status: 500, headers: corsHeaders });
    }

    await logSms({ order_id, user_id, phone_number: to, message: body, status: 'sent' });
    return new Response(JSON.stringify({ success: true, twilio: responseText }), { status: 200, headers: corsHeaders });
  } catch (e) {
    console.log('Errore:', e);
    // Prova a loggare anche in caso di errore generico
    try {
      const { to, body, order_id, user_id } = await req.json().catch(() => ({}));
      await logSms({ order_id, user_id, phone_number: to || '', message: body || '', status: 'error', error: String(e) });
    } catch {}
    return new Response(`Error: ${e}`, { status: 500, headers: corsHeaders });
  }
});
