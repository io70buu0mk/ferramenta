import { supabase } from './client';

/**
 * Carica un file immagine su Supabase Storage e restituisce il filePath (da usare per signed URL).
 * @param file File immagine da caricare
 * @param productId ID del prodotto (per path organizzato)
 * @returns filePath dell'immagine
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${productId}/${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return filePath;
}

/**
 * Ottieni una signed URL per visualizzare l'immagine (valida per 1 ora).
 * @param filePath percorso del file nel bucket
 * @returns signed URL temporanea
 */
export async function getSignedImageUrl(filePath: string): Promise<string> {
  console.log('[getSignedImageUrl] Richiesta signed URL per:', filePath);
  if (!filePath || filePath.startsWith('blob:') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
    console.warn('[getSignedImageUrl] Path non valido, restituisco placeholder:', filePath);
    return '/placeholder.svg';
  }
  const { data, error } = await supabase.storage.from('product-images').createSignedUrl(filePath, 60 * 60);
  if (error) {
    console.error('[getSignedImageUrl] Errore Supabase:', error, 'per', filePath);
    return '/placeholder.svg';
  }
  if (!data?.signedUrl) {
    console.warn('[getSignedImageUrl] Nessuna signedUrl restituita per', filePath);
    return '/placeholder.svg';
  }
  console.log('[getSignedImageUrl] Signed URL ottenuta:', data.signedUrl);
  return data.signedUrl;
}
