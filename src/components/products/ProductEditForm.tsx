import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/simple-toast";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, ProductStatus } from "./api";
import { PromotionsSummary } from "@/components/admin/PromotionsSummary";
import { ProductPromotionsManager } from "@/components/admin/ProductPromotionsManager";

// Componente per la gestione immagini con modale upload
function ProductImagesManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const { showToast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { productId } = useParams();

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

  // Upload immagini tramite modale
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || !productId) return;
    setUploading(true);
    setProgress(0);
    const fileArr = Array.from(files);
    const uploaded: string[] = [];
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `products/${productId}/${fileName}`;
      console.log('[UPLOAD] Avvio upload su Supabase:', filePath);
      const { data, error } = await supabase.storage.from('product-images').upload(filePath, file);
      if (error) {
        showToast('Errore upload: ' + file.name, 'error');
      } else {
        console.log('[SUPABASE] Recupero URL pubblico per:', filePath);
        const url = supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
        console.log('[SUPABASE] URL pubblico generato:', url);
        uploaded.push(url);
      }
      setProgress(Math.round(((i + 1) / fileArr.length) * 100));
    }
    setUploading(false);
    setProgress(0);
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      showToast('Immagini caricate', 'success');
    }
    setShowUploadModal(false);
  };

  // Grande immagine principale
  const mainImage = images.length > 0 ? images[0] : null;
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {mainImage ? (
          <img src={mainImage} alt="main" className="w-64 h-64 object-cover rounded-xl border mb-2" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center rounded-xl border mb-2 bg-neutral-50 text-yellow-400">
            {/* Icona SVG prodotto */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <rect x="3" y="7" width="18" height="13" rx="2" ry="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
            <span className="text-lg mt-2 text-yellow-500">Prodotto</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((img, idx) => (
          <div
            key={img}
            className={`relative group ${draggedIdx === idx ? 'ring-2 ring-yellow-400' : ''}`}
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
        {/* Pulsante per aprire la modale upload */}
        <button
          type="button"
          className="w-16 h-16 flex items-center justify-center border rounded cursor-pointer bg-yellow-100 hover:bg-yellow-200 text-yellow-600 text-2xl font-bold"
          onClick={() => setShowUploadModal(true)}
          title="Aggiungi immagini"
        >+
        </button>
      </div>
      <div className="text-xs text-neutral-500 text-center">Trascina le immagini per riordinarle. La prima sarà l'immagine principale.</div>
      {/* Modale upload immagini */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={()=>setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 relative min-w-[340px] max-w-[90vw] border-2 border-yellow-300" onClick={e=>e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-2xl text-yellow-500 hover:text-red-500 font-bold bg-white rounded-full border border-yellow-200 w-10 h-10 flex items-center justify-center shadow"
              onClick={()=>setShowUploadModal(false)}
              aria-label="Chiudi upload immagini"
            >×</button>
            <div className="w-full flex flex-col items-center">
              <div
                className="w-72 h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 mb-4 bg-yellow-50 hover:border-yellow-400 hover:text-yellow-600 transition-all cursor-pointer relative group"
                onDrop={e => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length) handleUpload(files);
                }}
                onDragOver={e => e.preventDefault()}
                onClick={() => document.getElementById('upload-input')?.click()}
                tabIndex={0}
                role="button"
                aria-label="Carica o trascina immagini"
              >
                <svg className="w-16 h-16 mb-2 text-yellow-400 group-hover:text-yellow-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m-4 4h8" />
                </svg>
                <span className="text-lg text-neutral-500 text-center">Trascina qui o clicca per caricare immagini</span>
                <input
                  id="upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from((e.target as HTMLInputElement).files || []).filter(f => f.type.startsWith('image/'));
                    if (files.length) handleUpload(files);
                  }}
                />
              </div>
              <span className="text-sm text-neutral-600 mb-2">Carica o trascina le immagini nello spazio sopra</span>
              {uploading && (
                <div className="mt-4 w-full text-center text-yellow-700 font-semibold">Caricamento immagini... {progress}%</div>
              )}
            </div>
          </div>
        </div>
      )}
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
  useEffect(() => {
    if (product) {
      console.log('[ProductEditForm] Prodotto caricato (dettaglio):', product);
      if (product.images) {
        console.log('[ProductEditForm] Lista immagini:', product.images);
      } else {
        console.log('[ProductEditForm] Nessuna immagine associata al prodotto');
      }
    }
  }, [product]);
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

  // Salva automaticamente le immagini nel database ogni volta che cambiano
  useEffect(() => {
    if (product && Array.isArray(product.images) && product.id) {
      supabase.from('products').update({ images: product.images }).eq('id', product.id)
        .then(({ error }) => {
          if (error) {
            console.error('[ProductEditForm] Errore salvataggio immagini:', error);
          } else {
            console.log('[ProductEditForm] Immagini salvate nel database:', product.images);
          }
        });
    }
  }, [product?.images]);

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

  // Modale custom per eliminazione
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDelete = async () => {
    if (!product) return;
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!product) return;
    setSaving(true);
    setError(null);
    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted', is_active: false, deleted_at: deletedAt })
      .eq('id', product.id);
    setSaving(false);
    setShowDeleteModal(false);
    if (error) {
      setError('Errore eliminazione');
      showToast("Errore durante l'eliminazione", 'error');
    } else {
      showToast('Prodotto eliminato', 'success');
      navigate('/admin/prodotti');
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
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-0 overflow-hidden border border-yellow-100">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/95 border-b border-yellow-200 px-8 py-7 flex items-center gap-4">
        <h2 className="text-3xl font-extrabold text-yellow-700 flex-1 truncate tracking-tight">{product.name || 'Nuovo prodotto'}</h2>
        {badge(product.status || 'draft')}
      </div>
      {/* Sezione promozioni riassuntiva */}
      <div className="px-8 pt-6">
        {product?.id && (
          <>
            <PromotionsSummary productId={product.id} promotions={[]} alwaysVisible />
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-10">
        {/* Colonna immagini */}
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-full">
            <label className="block font-bold mb-2 text-gray-800 text-lg">Immagini</label>
            <ProductImagesManager images={product.images || []} onChange={imgs => handleChange('images', imgs)} />
          </div>
        </div>
        {/* Colonna dettagli prodotto */}
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="product-name" className="block font-bold mb-2 text-gray-800 text-lg">Nome</label>
            <input id="product-name" className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-lg" value={product.name} onChange={e => handleChange('name', e.target.value)} aria-label="Nome prodotto" />
          </div>
          <div>
            <label htmlFor="product-description" className="block font-bold mb-2 text-gray-800 text-lg">Descrizione</label>
            <textarea id="product-description" className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-h-[90px] text-gray-900 text-base" value={product.description} onChange={e => handleChange('description', e.target.value)} aria-label="Descrizione prodotto" />
          </div>
          <div className="flex gap-6">
            <div className="flex-1">
              <label htmlFor="product-price" className="block font-bold mb-2 text-gray-800 text-lg">Prezzo</label>
              <input id="product-price" type="number" className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base" value={product.price} onChange={e => handleChange('price', parseFloat(e.target.value))} aria-label="Prezzo prodotto" />
            </div>
            <div className="flex-1">
              <label htmlFor="product-stock" className="block font-bold mb-2 text-gray-800 text-lg">Stock</label>
              <input id="product-stock" type="number" className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base" value={product.stock_quantity} onChange={e => handleChange('stock_quantity', parseInt(e.target.value))} aria-label="Stock prodotto" />
            </div>
          </div>
          <div>
            <label htmlFor="product-category" className="block font-bold mb-2 text-gray-800 text-lg">Categoria</label>
            <CustomDropdown
              options={[{ value: "", label: "Seleziona categoria" }, ...categories.map(cat => ({ value: cat.name, label: cat.name }))]}
              value={product.category}
              onChange={val => handleChange('category', val)}
              placeholder="Seleziona categoria"
              className="mb-2"
            />
          </div>
          <div>
            <label htmlFor="product-status" className="block font-bold mb-2 text-gray-800 text-lg">Stato</label>
            <CustomDropdown
              options={statusOptions}
              value={product.status}
              onChange={val => handleChange('status', val as any)}
              placeholder="Seleziona stato"
              className="mb-2"
            />
          </div>
        </div>
      </div>
      {/* Sezione promozioni riassuntiva */}
      <div className="px-8 pt-6">
        {product?.id && (
          <>
            <div className="mt-8 mb-8">
              <ProductPromotionsManager productId={product.id} />
            </div>
          </>
        )}
      </div>
      {/* Azioni sticky bottom */}
      <div className="sticky bottom-0 z-20 bg-gradient-to-r from-yellow-100 via-pink-100 to-blue-100 border-t border-yellow-200 px-8 py-6 flex flex-wrap gap-3 justify-between items-center shadow-lg">
        <button
          type="button"
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-all duration-200 border-0 text-sm"
          onClick={() => navigate('/admin/prodotti')}
          title="Torna alla sezione prodotti"
          aria-label="Torna alla sezione prodotti"
        >
          <span>⬅️</span> Indietro
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-all duration-200 border-0 text-sm"
            onClick={handleSave}
            disabled={saving}
          >{saving ? 'Salvataggio...' : <><span>💾</span> Salva</>}</button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 px-4 py-2 rounded-xl shadow transition-all duration-200 border-0 text-sm"
            onClick={handleDelete}
            disabled={saving}
          ><span>🗑️</span> Elimina</button>
          <button
            type="button"
            className="bg-gray-100 hover:bg-yellow-200 text-gray-700 font-semibold px-4 py-2 rounded-xl shadow text-sm"
            onClick={handleUndo}
            disabled={!prevProduct}
          >Annulla ultima modifica</button>
          {product.status !== 'published' && (
            <button
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-all duration-200 border-0 text-sm"
              onClick={handlePublish}
              disabled={saving}
            >Pubblica</button>
          )}
          {product.status === 'published' && (
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-all duration-200 border-0 text-sm"
              onClick={handleArchive}
              disabled={saving}
            >Archivia</button>
          )}
        </div>
      </div>
      {/* Modale custom eliminazione */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gradient-to-br from-red-100 via-yellow-50 to-pink-100 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6 min-w-[340px] max-w-[90vw] border-4 border-red-300 relative animate-fade-in">
            <span className="text-red-500 text-6xl mb-2 animate-bounce">🗑️</span>
            <h2 className="text-3xl font-extrabold text-red-600 mb-2 drop-shadow">Vuoi davvero eliminare?</h2>
            <p className="text-center text-lg text-gray-700 mb-4">Questa azione <span className="font-bold text-red-500">non può essere annullata</span>.<br />Il prodotto sarà spostato tra gli eliminati.</p>
            <div className="flex gap-6 mt-2">
              <button
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-red-600 hover:to-pink-600 transition-all"
                onClick={confirmDelete}
                disabled={saving}
              >Conferma eliminazione</button>
              <button
                className="bg-gray-100 hover:bg-yellow-200 text-gray-700 font-semibold px-8 py-3 rounded-xl shadow-lg"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >Annulla</button>
            </div>
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-400 font-bold bg-white rounded-full border border-gray-200 w-10 h-10 flex items-center justify-center shadow"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Chiudi modale eliminazione"
              disabled={saving}
            >×</button>
          </div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2 px-8 pb-4">{error}</div>}
    </div>
  );
}
