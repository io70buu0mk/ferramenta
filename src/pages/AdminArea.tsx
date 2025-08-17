import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = { id: string, email: string, nome: string, cognome: string, nome_utente: string, numero_telefono: string | null };

export default function AdminArea() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.replace("/auth");
        return;
      }
      // Recupera il profilo completo senza controllo ruolo
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(prof);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setProfile(null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  useEffect(() => {
    async function fetchDraftProducts() {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });
      if (error) {
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setProductsLoading(false);
    }
    fetchDraftProducts();
  }, []);

  if (loading) return null;
  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-2 sm:px-0">
      <div className="bg-white rounded-lg shadow max-w-2xl w-full p-4 sm:p-8">
        <div className="mb-2 text-sm text-gray-500">Area Amministratore</div>
        <div className="mb-4 text-xl font-bold text-[#b43434]">{profile.email}</div>
        <div className="mb-6 text-gray-800">
          Benvenuto! Qui potrai gestire prodotti e ordini.<br />
          <span className="font-semibold">Bozze prodotti:</span>
        </div>
        <div className="mb-6">
          {productsLoading ? (
            <div className="text-gray-400">Caricamento bozze...</div>
          ) : products.length === 0 ? (
            <div className="text-gray-400">Nessuna bozza presente.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products.map(prod => (
                <li key={prod.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#b43434]">{prod.name || 'Senza nome'}</span>
                    <span className="ml-2 text-sm text-gray-500">{prod.category}</span>
                  </div>
                  <a href={`/admin/prodotti/${prod.id}`} className="bg-yellow-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">Modifica</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex justify-between">
          <a href="/" className="text-[#b43434] underline">Home</a>
          <button
            className="bg-white text-[#b43434] border border-[#b43434] px-4 py-2 rounded hover:bg-[#f8e8e3] transition"
            onClick={async () => { await supabase.auth.signOut(); window.location.replace("/"); }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
