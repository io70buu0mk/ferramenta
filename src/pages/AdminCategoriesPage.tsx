import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("categories").select("*");
    if (error) setError(error.message);
    else setCategories(data || []);
    setLoading(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("categories").insert([newCategory]).select();
    if (error) setError(error.message);
    else {
      setCategories([...categories, ...(data || [])]);
      setNewCategory({ name: "", description: "" });
    }
    setLoading(false);
  }

  async function handleDeleteCategory(id: string) {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) setError(error.message);
    else setCategories(categories.filter((cat) => cat.id !== id));
    setLoading(false);
  }

  return (
    <div className="w-full py-12 px-4 md:px-12 lg:px-24">
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 flex items-center gap-3">
        <span className="inline-block bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15.5 13.5l-5-5m0 0l-2.5 2.5a2.121 2.121 0 000 3l3.5 3.5a2.121 2.121 0 003 0l2.5-2.5a2.121 2.121 0 000-3l-3.5-3.5a2.121 2.121 0 00-3 0z"/></svg>
        </span>
        Gestione categorie
      </h1>
      <p className="text-neutral-600 mb-8 text-xl">Aggiungi, modifica o elimina le categorie dei prodotti.</p>
      {error && <div className="text-red-600 mb-4 text-base font-semibold">{error}</div>}
      <form onSubmit={handleAddCategory} className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Nome categoria"
          value={newCategory.name}
          onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border border-neutral-300 px-6 py-4 rounded-xl text-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          required
        />
        <input
          type="text"
          placeholder="Descrizione"
          value={newCategory.description}
          onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
          className="border border-neutral-300 px-6 py-4 rounded-xl text-xl w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <Button type="submit" disabled={loading} className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white rounded-xl shadow-md transition">Aggiungi</Button>
      </form>
      <div className="overflow-x-auto">
        <ul className="divide-y divide-neutral-200">
          {categories.map((cat, idx) => {
            // Genera un colore pastello in base all'indice
            const pastelColors = [
              'bg-amber-50',
              'bg-yellow-50',
              'bg-green-50',
              'bg-blue-50',
              'bg-pink-50',
              'bg-purple-50',
              'bg-cyan-50',
              'bg-lime-50',
              'bg-orange-50',
              'bg-teal-50',
            ];
            const color = pastelColors[idx % pastelColors.length];
            return (
              <li key={cat.id} className={`flex justify-between items-center py-6 px-2 md:px-6 transition rounded-xl ${color} hover:bg-opacity-80`}>
                <div>
                  <span className="font-bold text-xl text-neutral-800">{cat.name}</span>
                  <span className="ml-4 text-lg text-neutral-500">{cat.description}</span>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(cat.id)} disabled={loading} className="px-6 py-3 text-lg font-semibold">Elimina</Button>
              </li>
            );
          })}
        </ul>
      </div>
      {loading && <div className="mt-8 text-neutral-500 text-center text-xl">Caricamento...</div>}
    </div>
  );
};

export default AdminCategoriesPage;
