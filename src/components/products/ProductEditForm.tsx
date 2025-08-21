import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, ProductStatus } from "./api";

// Componente per la gestione immagini (upload, preview, elimina, riordina)
function ProductImagesManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  // Drag & drop semplice nativo
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
import { useToast } from "@/components/ui/simple-toast";
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
  const { showToast } = useToast();
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newImages = [...images];
    const [removed] = newImages.splice(draggedIdx, 1);
    newImages.splice(idx, 0, removed);
    setDraggedIdx(idx);
    onChange(newImages);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {images.map((img, idx) => (
          <div
            key={img}
            className={`relative group ${draggedIdx === idx ? 'ring-2 ring-amber-400' : ''}`}
      showToast('Errore durante il salvataggio', 'error');
            onDragStart={() => handleDragStart(idx)}
      showToast('Prodotto salvato con successo', 'success');
            onDragEnd={handleDragEnd}
            onDrop={handleDragEnd}
            style={{ cursor: 'grab' }}
          >
            <img src={img} alt="img" className="w-24 h-24 object-cover rounded border" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100"
              onClick={() => onChange(images.filter((_, i) => i !== idx))}
            >✕</button>
          </div>
      showToast('Errore durante la pubblicazione', 'error');
        {/* Upload immagini */}
      showToast('Prodotto pubblicato', 'success');
          +
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async e => {
              if (!e.target.files) return;
              // Carica tutte le immagini selezionate
              const files = Array.from(e.target.files);
              const uploaded: string[] = [];
              for (const file of files) {
      showToast('Errore durante l\'archiviazione', 'error');
                // Salva su Supabase Storage (bucket: product-images)
      showToast('Prodotto archiviato', 'success');
                if (!error && data) {
                  const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(data.path);
                  if (publicData && publicData.publicUrl) {
                    uploaded.push(publicData.publicUrl);
                  }
                }
              }
              onChange([...images, ...uploaded]);
            }}
          />
        </label>
      </div>
      <div className="text-xs text-neutral-500">Trascina le immagini per riordinarle</div>
      showToast('Errore durante l\'eliminazione', 'error');
  );
      showToast('Prodotto eliminato', 'success');



export function ProductEditForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error) setError('Prodotto non trovato');
      setProduct(data as Product);
      setLoading(false);
    }
    if (productId) fetchProduct();
  }, [productId]);

  // Elimina fisicamente le immagini rimosse dal prodotto, se non più usate altrove
  const handleChange = async (field: keyof Product, value: any) => {
    if (!product) return;
    if (field === 'images' && Array.isArray(product.images)) {
      const removed = product.images.filter(img => !value.includes(img));
      for (const imgUrl of removed) {
        const match = imgUrl.match(/product-images\/(.+)$/);
        const path = match ? `product-images/${match[1]}` : null;
        if (path) {
          const { data: others, error } = await supabase
            .from('products')
            .select('id, images')
            .neq('id', product.id)
            .contains('images', [imgUrl]);
          if (!error && (!others || others.length === 0)) {
            await supabase.storage.from('product-images').remove([path.replace('product-images/', '')]);
          }
        }
      }
    }
    setProduct({ ...product, [field]: value });
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('products').update({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock_quantity: product.stock_quantity,
      images: product.images,
      status: product.status,
    }).eq('id', product.id);
    setSaving(false);
    if (error) {
      setError('Errore salvataggio');
      toast({ title: 'Errore', description: 'Errore durante il salvataggio', variant: 'destructive' });
    } else {
      toast({ title: 'Salvato', description: 'Prodotto salvato con successo', variant: 'success' });
    }
  };

  const handlePublish = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('products').update({ status: 'published' }).eq('id', product.id);
    setSaving(false);
    if (error) {
      setError('Errore pubblicazione');
      toast({ title: 'Errore', description: 'Errore durante la pubblicazione', variant: 'destructive' });
    } else {
      toast({ title: 'Pubblicato', description: 'Prodotto pubblicato', variant: 'success' });
      setProduct({ ...product, status: 'published' });
    }
  };

  const handleArchive = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('products').update({ status: 'archived' }).eq('id', product.id);
    setSaving(false);
    if (error) {
      setError('Errore archiviazione');
      toast({ title: 'Errore', description: 'Errore durante l\'archiviazione', variant: 'destructive' });
    } else {
      toast({ title: 'Archiviato', description: 'Prodotto archiviato', variant: 'success' });
      setProduct({ ...product, status: 'archived' });
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('products').update({ status: 'deleted' }).eq('id', product.id);
    setSaving(false);
    if (error) {
      setError('Errore eliminazione');
      toast({ title: 'Errore', description: 'Errore durante l\'eliminazione', variant: 'destructive' });
    } else {
      toast({ title: 'Eliminato', description: 'Prodotto eliminato', variant: 'success' });
      navigate(-1);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh] text-neutral-400">Caricamento prodotto...</div>
  );
  if (!product) return <div className="text-red-600 text-center mt-8">Prodotto non trovato</div>;

  // Badge stato
  const badge = (status: string) => {
    switch (status) {
      case 'draft': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Bozza</span>;
      case 'published': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Pubblicato</span>;
      case 'archived': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Archiviato</span>;
      case 'deleted': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Eliminato</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-3xl shadow-xl p-0 overflow-hidden">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/95 border-b border-neutral-200 px-8 py-6 flex items-center gap-4">
        <h2 className="text-2xl font-bold text-neutral-900 flex-1 truncate">{product.name || 'Nuovo prodotto'}</h2>
        {badge(product.status || 'draft')}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Colonna immagini */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Immagini</label>
            <ProductImagesManager images={product.images || []} onChange={imgs => handleChange('images', imgs)} />
          </div>
        </div>
        {/* Colonna dettagli prodotto */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Nome</label>
            <input className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 text-lg" value={product.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          <div>
            <label className="block font-medium mb-1">Descrizione</label>
            <textarea className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 min-h-[90px]" value={product.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Prezzo</label>
              <input type="number" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400" value={product.price} onChange={e => handleChange('price', parseFloat(e.target.value))} />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Stock</label>
              <input type="number" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400" value={product.stock_quantity} onChange={e => handleChange('stock_quantity', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Categoria</label>
            <input className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400" value={product.category} onChange={e => handleChange('category', e.target.value)} />
          </div>
        </div>
      </div>
      {/* Azioni sticky bottom */}
      <div className="sticky bottom-0 z-10 bg-white/95 border-t border-neutral-200 px-8 py-6 flex flex-wrap gap-3 justify-end">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvataggio...' : 'Salva'}</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
        {product.status !== 'published' && (
          <Button variant="default" onClick={handlePublish} disabled={saving}>Pubblica</Button>
        )}
        {product.status === 'published' && (
          <Button variant="secondary" onClick={handleArchive} disabled={saving}>Archivia</Button>
        )}
        <Button variant="destructive" onClick={handleDelete} disabled={saving}>Elimina</Button>
      </div>
      {error && <div className="text-red-600 text-sm mt-2 px-8 pb-4">{error}</div>}
    </div>
  );
}
