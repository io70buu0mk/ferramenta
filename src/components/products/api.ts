// Funzioni API per la gestione prodotti (Supabase)
import { supabase } from "@/integrations/supabase/client";

export type ProductStatus = 'draft' | 'published' | 'archived' | 'deleted';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  status: ProductStatus;
  images: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// Crea una bozza prodotto vuota e restituisce il nuovo prodotto
export async function createDraftProduct(userId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock_quantity: 0,
      status: 'draft',
      images: [],
      is_active: true,
      created_by: userId,
    })
    .select()
    .single();
  if (error) {
    console.error('Errore creazione bozza prodotto:', error);
    return null;
  }
  return data as Product;
}
