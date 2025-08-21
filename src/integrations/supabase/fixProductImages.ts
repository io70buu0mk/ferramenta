// Script per correggere automaticamente i path immagini dei prodotti su Supabase
// Esegui questo script una tantum per sistemare i dati
import 'dotenv/config';
import { supabase } from './client.node';

async function fixProductImages() {
  // 1. Recupera tutti i prodotti
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Errore nel recupero prodotti:', error);
    return;
  }
  for (const product of products) {
    if (!product.images || !Array.isArray(product.images)) continue;
    let changed = false;
    const fixedImages = product.images.map((img: string) => {
      // Se è già un path relativo, lascialo così
      if (img && !img.startsWith('blob:') && !img.startsWith('http://') && !img.startsWith('https://')) return img;
      // Prova a ricostruire il path se contiene il nome file
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
}

fixProductImages();
