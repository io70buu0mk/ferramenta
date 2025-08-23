import * as React from "react";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function DeletedProductsPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string|null>(null);

  React.useEffect(() => {
    const fetchDeleted = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
  .not('deleted_at', 'is', null);
      setProducts(data || []);
      setLoading(false);
    };
    fetchDeleted();
  }, []);

  const handleHardDelete = async (productId: string) => {
    if (!window.confirm('Eliminare definitivamente questo prodotto?')) return;
    setDeletingId(productId);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    setDeletingId(null);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
      alert('Prodotto eliminato definitivamente');
    } else {
      alert('Errore durante eliminazione definitiva');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 px-2 sm:px-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-2xl font-bold mb-6">Prodotti Eliminati</h2>
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-left font-semibold">Nome</th>
                  <th className="p-3 text-left font-semibold">Categoria</th>
                  <th className="p-3 text-left font-semibold">Prezzo</th>
                  <th className="p-3 text-left font-semibold">Eliminato il</th>
                  <th className="p-3 text-left font-semibold">Tempo rimanente</th>
                  <th className="p-3 text-left font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Caricamento...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">Nessun prodotto eliminato</td></tr>
                ) : (
                  products.map(product => {
                    const deletedDate = new Date(product.deleted_at);
                    const now = new Date();
                    const diffMs = deletedDate ? (now.getTime() - deletedDate.getTime()) : 0;
                    const daysLeft = 30 - Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={product.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                        <td className="p-3 font-bold">{product.name}</td>
                        <td className="p-3">{product.category}</td>
                        <td className="p-3">€{product.price?.toFixed(2)}</td>
                        <td className="p-3">{deletedDate.toLocaleDateString()}</td>
                        <td className="p-3">{daysLeft > 0 ? `${daysLeft} giorni` : 'Scaduto'}</td>
                        <td className="p-3">
                          <Button size="sm" variant="destructive" onClick={() => handleHardDelete(product.id)} disabled={deletingId === product.id}>Elimina definitivamente</Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
