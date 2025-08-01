// API route per inserire SMS in coda Supabase
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la service key per scrivere
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const { numero, messaggio } = req.body;
  if (!numero || !messaggio) return res.status(400).json({ error: 'Parametri mancanti' });

  const { error } = await supabase.from('sms_queue').insert([{ numero, messaggio, status: 'waiting' }]);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}
