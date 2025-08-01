// Supabase Edge Function per invio notifiche push FCM
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

// Import firebase-admin dinamico
let admin: any;
let initialized = false;

async function getFirebaseAdmin() {
  if (!initialized) {
    admin = await import('firebase-admin');
    const serviceAccount = JSON.parse(Deno.readTextFileSync('./lucini-ferramenta-292446000fa2.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
  }
  return admin;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metodo non consentito' }), { status: 405 });
  }
  const { token, title, body } = await req.json();
  if (!token || !title || !body) {
    return new Response(JSON.stringify({ error: 'Parametri mancanti' }), { status: 400 });
  }
  try {
    const admin = await getFirebaseAdmin();
    const message = {
      notification: { title, body },
      token
    };
    const response = await admin.messaging().send(message);
    return new Response(JSON.stringify({ success: true, response }), { status: 200 });
  } catch (error) {
    console.error('Errore invio FCM:', error);
    return new Response(JSON.stringify({ error: 'Errore invio FCM', details: error }), { status: 500 });
  }
});
