// Script di fix immagini prodotti - CommonJS, eseguibile con node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async function fixProductImages() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Errore nel recupero prodotti:', error);
    return;
  }
  for (const product of products) {
    if (!product.images || !Array.isArray(product.images)) continue;
    let changed = false;
    const fixedImages = product.images.map((img) => {
      if (img && !img.startsWith('blob:') && !img.startsWith('http://') && !img.startsWith('https://')) return img;
      const match = img && img.match(/([\w-]+\.(png|jpg|jpeg|webp|gif))/i);
      if (match && product.id) {
        changed = true;
        return `${product.id}/${match[1]}`;
      }
      changed = true;
      return null;
    }).filter(Boolean);
    if (changed) {
      const { error: updateError } = await supabase.from('products').update({ images: fixedImages }).eq('id', product.id);
      if (updateError) {
        console.error(`Errore aggiornamento prodotto ${product.id}:`, updateError);
      } else {
        console.log(`Prodotto ${product.id} aggiornato con immagini:`, fixedImages);
      }
    }
  }
  console.log('Correzione immagini completata.');
  process.exit(0);
})();
