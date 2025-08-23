import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ProductCreateRedirect() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createProduct() {
      setLoading(true);
      setError(null);
      try {
        // Dati di default per il nuovo prodotto
        const defaultProduct = {
          name: "Nuovo prodotto",
          category: "Generale",
          price: 0,
          stock_quantity: 0,
          status: "draft",
          images: [],
          description: "",
          // ...altri campi necessari
        };
        const { data, error } = await supabase
          .from("products")
          .insert([defaultProduct])
          .select();
        if (error || !data || !data[0]?.id) {
          setError("Errore nella creazione del prodotto.");
          setLoading(false);
          return;
        }
  // Redirect alla pagina di modifica prodotto
  navigate(`/admin/${userId}/products/edit/${data[0].id}`);
      } catch (err) {
        setError("Errore imprevisto nella creazione del prodotto.");
      } finally {
        setLoading(false);
      }
    }
    createProduct();
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-yellow-200 flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mb-4"></div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Prodotto in preparazione...</h2>
        <p className="text-neutral-600 mb-2">Stiamo creando il prodotto e ti reindirizzeremo automaticamente.</p>
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
        {error && (
          <button
            className="mt-4 px-4 py-2 bg-yellow-400 text-white rounded-lg font-bold shadow hover:bg-yellow-500"
            onClick={() => window.location.reload()}
          >Riprova</button>
        )}
      </div>
    </div>
  );
}
