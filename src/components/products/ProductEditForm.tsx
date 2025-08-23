import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/simple-toast";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, ProductStatus } from "./api";

// Componente per la gestione immagini (upload, preview, elimina, riordina)
function ProductImagesManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newImages = [...images];
    const [removed] = newImages.splice(draggedIdx, 1);
    newImages.splice(idx, 0, removed);
    setDraggedIdx(idx);
    onChange(newImages);
    showToast('Immagini riordinate', 'success');
  };
  const handleDragEnd = () => setDraggedIdx(null);
  const handleRemove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
    showToast('Immagine rimossa', 'success');
  };
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { productId } = useParams();
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !productId) return;
    setUploading(true);
    setProgress(0);
    const files = Array.from(e.target.files);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `products/${productId}/${fileName}`;
      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file);
      if (error) {
        showToast('Errore upload: ' + file.name, 'error');
      } else {
        const url = supabase.storage.from('product-images').getPublicUrl(filePath).publicUrl;
        uploaded.push(url);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setUploading(false);
    setProgress(0);
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      showToast('Immagini caricate', 'success');
    }
  };

  // Grande immagine principale
  const mainImage = images.length > 0 ? images[0] : null;
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {mainImage ? (
          <img src={mainImage} alt="main" className="w-64 h-64 object-cover rounded-xl border mb-2" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center rounded-xl border mb-2 bg-neutral-50 text-neutral-400 text-6xl">
            <span className="material-icons">inventory_2</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {uploading && (
          <div className="w-full text-center text-xs text-amber-600 mb-2">Caricamento immagini... {progress}%</div>
        )}
        {images.map((img, idx) => (
          <div
            key={img}
            className={`relative group ${draggedIdx === idx ? 'ring-2 ring-amber-400' : ''}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            style={{ cursor: 'grab' }}
          >
            <img src={img} alt="img" className="w-16 h-16 object-cover rounded border" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100"
              onClick={() => handleRemove(idx)}
            >✕</button>
          </div>
        ))}
        <label className="w-16 h-16 flex items-center justify-center border rounded cursor-pointer bg-neutral-50 hover:bg-neutral-100">
          <span className="text-2xl">+</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>
      <div className="text-xs text-neutral-500 text-center">Trascina le immagini per riordinarle. La prima sarà l'immagine principale.</div>
    </div>
  );
}

export function ProductEditForm() {
  // Caricamento categorie da Supabase
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (!error && data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Stati disponibili
  const statusOptions = [
    { value: 'draft', label: 'Bozza' },
    { value: 'published', label: 'Pubblicato' },
    { value: 'archived', label: 'Archiviato' },
    { value: 'deleted', label: 'Eliminato' },
  ];
  const { showToast } = useToast();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [prevProduct, setPrevProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[ProductEditForm] useEffect: productId param:', productId);
    if (productId) {
      window.dispatchEvent(new CustomEvent('debug-productId', { detail: productId }));
    }
  }, [productId]);

  useEffect(() => {
    console.log('[ProductEditForm] useEffect: fetchProduct start, productId:', productId);
    async function fetchProduct() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
        if (error || !data) {
          setError('Prodotto non trovato. ID ricevuto: ' + productId);
          setProduct(null);
          console.error('[ProductEditForm] Errore caricamento prodotto:', error, 'ID:', productId);
          window.dispatchEvent(new CustomEvent('debug-product-error', { detail: { error, productId } }));
        } else {
          setProduct(data as Product);
          setError(null);
          console.log('[ProductEditForm] Prodotto caricato:', data);
          window.dispatchEvent(new CustomEvent('debug-product-loaded', { detail: data }));
        }
      } catch (err) {
        setError('Eccezione caricamento prodotto: ' + String(err));
        setProduct(null);
        console.error('[ProductEditForm] Exception fetchProduct:', err);
        window.dispatchEvent(new CustomEvent('debug-product-exception', { detail: err }));
      }
      setLoading(false);
      window.dispatchEvent(new CustomEvent('debug-product-loading', { detail: loading }));
    }
    if (productId) fetchProduct();
  }, [productId]);

  // Elimina fisicamente le immagini rimosse dal prodotto, se non più usate altrove
  const handleChange = async (field: keyof Product, value: any) => {
    if (!product) return;
    setPrevProduct(product); // Salva lo stato precedente prima della modifica
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

  const handleUndo = () => {
    if (prevProduct) {
      setProduct(prevProduct);
      setPrevProduct(null);
      showToast('Ultima modifica annullata', 'success');
    }
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
  showToast('Errore durante il salvataggio', 'error');
    } else {
  showToast('Prodotto salvato con successo', 'success');
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
  showToast('Errore durante la pubblicazione', 'error');
    } else {
  showToast('Prodotto pubblicato', 'success');
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
  showToast('Errore durante l\'archiviazione', 'error');
    } else {
  showToast('Prodotto archiviato', 'success');
      setProduct({ ...product, status: 'archived' });
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    setSaving(true);
    setError(null);
    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted', is_active: false, deleted_at: deletedAt })
      .eq('id', product.id);
    setSaving(false);
    if (error) {
      setError('Errore eliminazione');
  showToast("Errore durante l'eliminazione", 'error');
    } else {
      showToast('Prodotto eliminato', 'success');
      navigate(-1);
    }
  };

  console.log('[ProductEditForm] Render: loading:', loading, 'product:', product, 'error:', error);
  if (loading) {
    window.dispatchEvent(new CustomEvent('debug-product-loading-render', { detail: { loading, productId } }));
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-neutral-400">
        <div>Caricamento prodotto...</div>
        <div className="text-xs mt-2 text-neutral-500">ID prodotto: {productId}</div>
      </div>
    );
  }
  if (!product) {
    window.dispatchEvent(new CustomEvent('debug-product-notfound-render', { detail: { productId, error } }));
    return (
      <div className="text-red-600 text-center mt-8">
        <div>Prodotto non trovato</div>
        <div className="text-xs mt-2 text-neutral-500">ID ricevuto: {productId}</div>
        {error && <div className="text-xs mt-2 text-red-400">{error}</div>}
      </div>
    );
  }

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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
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
            <label htmlFor="product-name" className="block font-medium mb-1">Nome</label>
            <input id="product-name" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none text-lg" value={product.name} onChange={e => handleChange('name', e.target.value)} aria-label="Nome prodotto" />
          </div>
          <div>
            <label htmlFor="product-description" className="block font-medium mb-1">Descrizione</label>
            <textarea id="product-description" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none min-h-[90px]" value={product.description} onChange={e => handleChange('description', e.target.value)} aria-label="Descrizione prodotto" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="product-price" className="block font-medium mb-1">Prezzo</label>
              <input id="product-price" type="number" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none" value={product.price} onChange={e => handleChange('price', parseFloat(e.target.value))} aria-label="Prezzo prodotto" />
            </div>
            <div className="flex-1">
              <label htmlFor="product-stock" className="block font-medium mb-1">Stock</label>
              <input id="product-stock" type="number" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none" value={product.stock_quantity} onChange={e => handleChange('stock_quantity', parseInt(e.target.value))} aria-label="Stock prodotto" />
            </div>
          </div>
          <div>
            <label htmlFor="product-category" className="block font-medium mb-1">Categoria</label>
            <select
              id="product-category"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              value={product.category}
              onChange={e => handleChange('category', e.target.value)}
              aria-label="Categoria prodotto"
            >
              <option value="">Seleziona categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-status" className="block font-medium mb-1">Stato</label>
            <select
              id="product-status"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              value={product.status}
              onChange={e => handleChange('status', e.target.value as any)}
              aria-label="Stato prodotto"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Azioni sticky bottom */}
      <div className="sticky bottom-0 z-10 bg-white/95 border-t border-neutral-200 px-8 py-6 flex flex-wrap gap-3 justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/admin/prodotti')}>Indietro</Button>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvataggio...' : 'Salva'}</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Annulla</Button>
          <Button variant="secondary" onClick={handleUndo} disabled={!prevProduct}>Annulla ultima modifica</Button>
          {product.status !== 'published' && (
            <Button variant="default" onClick={handlePublish} disabled={saving}>Pubblica</Button>
          )}
          {product.status === 'published' && (
            <Button variant="secondary" onClick={handleArchive} disabled={saving}>Archivia</Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>Elimina</Button>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm mt-2 px-8 pb-4">{error}</div>}
    </div>
  );
}
