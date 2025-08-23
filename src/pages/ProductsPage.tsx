import * as React from "react";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";
import { usePublicProducts } from "@/hooks/usePublicProducts";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Eye, EyeOff } from "lucide-react";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, loading: productsLoading, refetch } = usePublicProducts();
  const [deletingId, setDeletingId] = React.useState<string|null>(null);
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    const arr = [...products];
    arr.sort((a, b) => {
      if (a.status === 'draft' && b.status !== 'draft') return -1;
      if (a.status !== 'draft' && b.status === 'draft') return 1;
      return 0;
    });
    return arr;
  }, [products]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    setDeletingId(productId);
    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted', is_active: false, deleted_at: deletedAt })
      .eq('id', productId);
    setDeletingId(null);
    if (!error) {
      alert('Prodotto eliminato');
      if (refetch) refetch();
    } else {
      alert('Errore durante eliminazione');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 px-2 sm:px-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-left font-semibold">Nome</th>
                  <th className="p-3 text-left font-semibold">Categoria</th>
                  <th className="p-3 text-left font-semibold">Prezzo</th>
                  <th className="p-3 text-left font-semibold">Stato</th>
                  <th className="p-3 text-left font-semibold">Quantità</th>
                  <th className="p-3 text-left font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Caricamento prodotti...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">Nessun prodotto trovato</td></tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="p-3 font-bold">
                        {product.name}
                        {product.status === 'draft' && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">BOZZA</span>}
                      </td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">€{product.price?.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.status === 'draft' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{product.status === 'draft' ? 'Bozza' : 'Pubblicato'}</span>
                      </td>
                      <td className="p-3">{product.stock_quantity}</td>
                      <td className="p-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/prodotti/${product.id}`)}><Edit size={16} /></Button>
                        <Button size="sm" variant="outline" onClick={() => {/* duplica prodotto */}}><Copy size={16} /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}><Trash2 size={16} className="text-red-600" /></Button>
                        {product.status === 'draft' ? (
                          <Button size="sm" variant="outline" onClick={() => {/* pubblica prodotto */}}><Eye size={16} /></Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => {/* metti in bozza */}}><EyeOff size={16} /></Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}