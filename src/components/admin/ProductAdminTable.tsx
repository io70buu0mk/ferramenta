import * as React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Eye, EyeOff, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";

export default function ProductAdminTable({ userId }: { userId: string }) {
  const { products, loading: productsLoading } = useProducts({ all: true });
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      return (
        (!search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [products, search]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Cerca prodotti..."
          className="px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-amber-400 text-base min-w-[220px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* Qui puoi aggiungere altri filtri se vuoi */}
      </div>
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
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/${userId}/products/edit/${product.id}`)}><Edit size={16} /></Button>
                    <Button size="sm" variant="outline" onClick={() => {/* duplica prodotto */}}><Copy size={16} /></Button>
                    <Button size="sm" variant="outline" onClick={() => {/* elimina prodotto con conferma */}}><Trash2 size={16} className="text-red-600" /></Button>
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
  );
}
