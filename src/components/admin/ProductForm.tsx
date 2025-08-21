import React, { useState, useEffect, useRef } from "react";
import { uploadProductImage, getSignedImageUrl } from '@/integrations/supabase/imageUpload';
import { Listbox } from '@headlessui/react';

type ProductFormState = {
  id?: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
  description: string;
  images: string[];
  [key: string]: any;
};

type ProductFormErrors = {
  name?: string;
  category?: string;
  price?: string;
};

function UploadModal({ onClose, uploadingImages, onUpload }: { onClose: () => void; uploadingImages: any[]; onUpload: (files: File[]) => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleAreaClick = () => {
    inputRef.current?.click();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6 relative min-w-[340px] max-w-[90vw] border-2 border-yellow-300" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-2xl text-yellow-500 hover:text-red-500 font-bold bg-white rounded-full border border-yellow-200 w-10 h-10 flex items-center justify-center shadow"
          onClick={onClose}
          aria-label="Chiudi upload immagini"
        >×</button>
        <div className="w-full flex flex-col items-center">
          <div
            className="w-72 h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 mb-4 bg-yellow-50 hover:border-yellow-400 hover:text-yellow-600 transition-all cursor-pointer relative group"
            onDrop={e => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              if (files.length) onUpload(files as File[]);
            }}
            onDragOver={e => e.preventDefault()}
            onClick={handleAreaClick}
            tabIndex={0}
            role="button"
            aria-label="Carica o trascina immagini"
          >
            <svg className="w-16 h-16 mb-2 text-yellow-400 group-hover:text-yellow-500 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m-4 4h8" />
            </svg>
            <span className="text-lg text-neutral-500 text-center">Trascina qui o clicca per caricare immagini</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              style={{ display: 'none' }}
              onChange={e => {
                const files = Array.from((e.target as HTMLInputElement).files || []).filter(f => f.type.startsWith('image/'));
                if (files.length) onUpload(files as File[]);
              }}
            />
          </div>
          <span className="text-sm text-neutral-600 mb-2">Carica o trascina le immagini nello spazio sopra</span>
          {uploadingImages && uploadingImages.length > 0 && (
            <div className="mt-4 w-full">
              <span className="text-sm text-yellow-700 font-semibold">Immagini in upload:</span>
              <ul className="mt-2">
                {uploadingImages.map((img: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">{idx + 1}</span>
                    <span className="truncate max-w-[180px]">{img.file?.name || 'Immagine'}</span>
                    {img.status === 'uploading' && <span className="text-xs text-yellow-500">Caricamento...</span>}
                    {img.status === 'done' && <span className="text-xs text-green-600">✓ Caricata</span>}
                    {img.status === 'error' && <span className="text-xs text-red-500">Errore: {img.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductFormProps {
  product: any;
  onSave: any;
  onDelete?: any;
  categories: any;
  promotions: any;
  onManagePromotions: any;
  updateProduct?: (id: string, data: any) => void;
}

export default function ProductForm(props: ProductFormProps) {
  const { product, onSave, onDelete, categories, promotions, onManagePromotions, updateProduct } = props;
  const [form, setForm] = useState<ProductFormState>({
    id: product?.id || undefined,
    name: product?.name || '',
    category: product?.category || '',
    stock: product?.stock_quantity ?? 0,
    price: product?.price ?? 0,
    status: product?.is_active ? 'active' : 'draft',
    description: product?.description || '',
    images: product?.images || [],
  });
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<any[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const newErrors: ProductFormErrors = {};
    if (!form.name || form.name.trim() === "") newErrors.name = "Il nome è obbligatorio.";
    if (!form.category || form.category.trim() === "") newErrors.category = "La categoria è obbligatoria.";
    if (form.price === undefined || form.price === null || isNaN(Number(form.price)) || Number(form.price) <= 0) newErrors.price = "Il prezzo deve essere maggiore di zero.";
    setErrors(newErrors);
  }, [form.name, form.category, form.price]);

  const handleFieldChange = (field: keyof ProductFormState, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Autosave solo se esiste un id e non è la prima render
      if (updated.id && updateProduct && !isFirstRender.current) {
        // Mappatura per il backend
        const mapped = {
          ...updated,
          stock_quantity: Number(updated.stock),
          is_active: updated.status === 'active',
        };
        delete mapped.stock;
        delete mapped.status;
        updateProduct(updated.id, mapped);
      }
      return updated;
    });
  };

  // Per evitare autosave al primo render
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Gestione upload immagini
  // Caricamento immagini su Supabase Storage
  // L'upload è sempre permesso, indipendentemente dallo stato del prodotto
  const MAX_IMAGE_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const handleUploadImages = async (files: File[]) => {
    // Validazione tipo e dimensione
    const validated: File[] = [];
    const rejected: { file: File, reason: string }[] = [];
    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        rejected.push({ file, reason: "Tipo file non supportato" });
      } else if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        rejected.push({ file, reason: `Immagine troppo grande (> ${MAX_IMAGE_SIZE_MB}MB)` });
      } else {
        validated.push(file);
      }
    });
    setUploadingImages([
      ...validated.map(file => ({ file, status: 'uploading' })),
      ...rejected.map(({ file, reason }) => ({ file, status: 'error', error: reason }))
    ]);
    const uploadedPaths: string[] = [];
    for (let i = 0; i < validated.length; i++) {
      try {
        const productId = form.id || 'temp';
        const filePath = await uploadProductImage(validated[i], productId);
        uploadedPaths.push(filePath);
        setUploadingImages(prev => prev.map((img, idx) => idx === i ? { ...img, status: 'done' } : img));
      } catch (err: any) {
        setUploadingImages(prev => prev.map((img, idx) => idx === i ? { ...img, status: 'error', error: err.message } : img));
      }
    }
    if (uploadedPaths.length > 0) {
      // Rimuovi eventuali blob: url da images e aggiungi solo i path validi
      setForm(prev => ({
        ...prev,
        images: [
          ...prev.images.filter(img => img && !img.startsWith('blob:') && !img.startsWith('http://') && !img.startsWith('https://')),
          ...uploadedPaths
        ]
      }));
    }
    setTimeout(() => setUploadingImages([]), 1000);
  };

  // Aggiorna signedUrls ogni volta che cambiano le immagini
  useEffect(() => {
    let isMounted = true;
    async function fetchUrls() {
      console.log('[ProductForm] fetchUrls: immagini da caricare:', form.images);
      if (!form.images || form.images.length === 0) {
        setSignedUrls([]);
        return;
      }
      const urls: string[] = [];
      for (const filePath of form.images) {
        try {
          const url = await getSignedImageUrl(filePath);
          console.log('[ProductForm] URL per', filePath, ':', url);
          urls.push(url);
        } catch (err) {
          console.error('[ProductForm] Errore caricamento URL per', filePath, err);
          urls.push('/placeholder.svg');
        }
      }
      if (isMounted) setSignedUrls(urls);
    }
    fetchUrls();
    return () => { isMounted = false; };
  }, [form.images]);

  const handleRemoveImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 p-4 md:p-8 bg-gradient-to-br from-yellow-50 to-white min-h-[80vh]">
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center border border-yellow-100 w-full">
          {/* Galleria immagini */}
          <div className="mb-6 w-full flex flex-col items-center">
                <div className="flex flex-col gap-3 justify-center items-center">
                  {/* Immagine grande selezionata in alto */}
                <div className="mb-4">
                  <img
                    src={signedUrls.length > 0 ? signedUrls[selectedImageIndex] || signedUrls[0] : '/placeholder.svg'}
                    alt="Immagine prodotto"
                    className="w-64 h-80 object-cover rounded-xl border shadow-lg mx-auto"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                  {/* Miniature + pulsante aggiunta in una riga sotto */}
                  <div className="flex gap-3 justify-center items-center mt-2">
                    {signedUrls.map((url, idx) => (
                      <div key={form.images[idx]} className="relative">
                        <img
                          src={url || '/placeholder.svg'}
                          alt={`Miniatura ${idx + 1}`}
                          className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${selectedImageIndex === idx ? 'ring-2 ring-yellow-500' : ''}`}
                          onClick={() => setSelectedImageIndex(idx)}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                          onClick={() => handleRemoveImage(idx)}
                          title="Rimuovi immagine"
                        >
                          <span className="text-red-500">✕</span>
                        </button>
                      </div>
                    ))}
                    {/* Pulsante aggiunta immagini come quadratino */}
                    <button
                      type="button"
                      className="w-16 h-16 flex items-center justify-center bg-yellow-200 rounded-lg border-2 border-dashed border-yellow-400 hover:bg-yellow-300 transition text-xl font-bold"
                      onClick={() => setShowUploadModal(true)}
                      title="Aggiungi immagine"
                    >
                      +
                    </button>
                  </div>
              </div>
          </div>
          {showUploadModal && (
            <UploadModal
              onClose={() => setShowUploadModal(false)}
              uploadingImages={uploadingImages}
              onUpload={handleUploadImages}
            />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-yellow-100">
          <h2 className="text-3xl font-extrabold mb-8 text-gray-800">Dettagli Prodotto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Nome prodotto */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block font-bold text-gray-800 tracking-wide text-base">Nome Prodotto</label>
                <span className="text-xs text-gray-400" title="Il nome sarà visibile agli utenti.">ⓘ</span>
              </div>
              <input
                type="text"
                className={`w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 placeholder-gray-400 text-base ${errors.name ? 'border-red-300 ring-2 ring-red-200 animate-shake' : ''}`}
                value={form.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Bozza"
                aria-label="Nome prodotto"
              />
              <span className="text-xs text-gray-500 ml-1" title="Campo obbligatorio">Obbligatorio</span>
              {form.name.trim() === '' && (
                <div className="text-xs text-yellow-600 mt-1">Se lasci vuoto, il nome sarà generato automaticamente come "Bozza N"</div>
              )}
              {errors.name && <div className="text-xs text-red-500 mt-1 animate-fade-in">{errors.name}</div>}
            </div>
            {/* Categoria */}
            <div>
              <label className="block font-bold mb-2 text-gray-800 tracking-wide text-base">Categoria</label>
              <Listbox value={form.category} onChange={value => handleFieldChange('category', value)}>
                <div className="relative">
                  <Listbox.Button className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base flex justify-between items-center">
                    {form.category || "Seleziona categoria"}
                    <span className="text-yellow-400 text-xl ml-2">▼</span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-yellow-100 z-10 max-h-60 overflow-auto">
                    <Listbox.Option value="" disabled>
                      <span className="block px-4 py-2 text-gray-400">Seleziona categoria</span>
                    </Listbox.Option>
                    {categories && categories.map((cat: string) => (
                      <Listbox.Option
                        key={cat}
                        value={cat}
                        className={({ active, selected }) =>
                          `cursor-pointer px-4 py-2 text-base rounded-xl transition-all ${
                            active ? 'bg-yellow-100 text-yellow-700' : 'text-gray-900'
                          } ${selected ? 'font-bold bg-yellow-200' : ''}`
                        }
                      >
                        {cat}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              <span className="text-xs text-gray-500 ml-1" title="Campo obbligatorio">Obbligatorio</span>
              {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
            </div>
            {/* Stock */}
            <div>
              <label className="block font-bold mb-2 text-gray-800 tracking-wide text-base">Stock</label>
              <input
                type="number"
                className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base"
                min={0}
                value={form.stock}
                onChange={e => handleFieldChange('stock', e.target.value)}
                aria-label="Stock disponibile"
              />
              <span className="text-xs text-gray-500 ml-1" title="Quantità disponibile">Disponibilità</span>
            </div>
            {/* Stato */}
            <div>
              <label className="block font-bold mb-2 text-gray-800 tracking-wide text-base">Stato</label>
              <div className="relative group">
                <select className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base appearance-none cursor-pointer group-hover:border-yellow-400 group-hover:ring-2 group-hover:ring-yellow-100" value={form.status} onChange={e => handleFieldChange('status', e.target.value)} aria-label="Seleziona stato" style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}>
                  <option value="draft" className="bg-white text-gray-900 py-3 px-4 hover:bg-yellow-50 hover:text-yellow-700 transition-all text-base">Bozza</option>
                  <option value="active" className="bg-white text-gray-900 py-3 px-4 hover:bg-yellow-50 hover:text-yellow-700 transition-all text-base">Attivo</option>
                  <option value="inactive" className="bg-white text-gray-900 py-3 px-4 hover:bg-yellow-50 hover:text-yellow-700 transition-all text-base">Non attivo</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 text-xl">▼</span>
              </div>
            </div>
            {/* Prezzo */}
            <div>
              <label className="block font-bold mb-2 text-gray-800 tracking-wide text-base">Prezzo</label>
              <input
                type="number"
                className={`w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 text-gray-900 text-base ${errors.price ? 'border-red-300 ring-2 ring-red-200 animate-shake' : ''}`}
                min={0}
                step={0.01}
                value={form.price}
                onChange={e => handleFieldChange('price', e.target.value)}
                aria-label="Prezzo in euro"
              />
              <span className="text-xs text-gray-500 ml-1" title="Prezzo di vendita">Prezzo in euro</span>
              {errors.price && <div className="text-xs text-red-500 mt-1 animate-fade-in">{errors.price}</div>}
            </div>
          </div>
          {/* Descrizione */}
          <div className="mb-10">
            <label className="block font-bold mb-2 text-gray-800 tracking-wide text-base">Descrizione</label>
            <textarea
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 min-h-[80px] text-gray-900 text-base"
              value={form.description}
              onChange={e => handleFieldChange('description', e.target.value)}
              placeholder="Descrizione prodotto"
              maxLength={500}
              aria-label="Descrizione prodotto"
            />
            <span className="text-xs text-gray-500 ml-1" title="Breve descrizione">Max 500 caratteri</span>
            <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
              <span className="block text-sm font-semibold text-gray-700 mb-2">Anteprima descrizione:</span>
              <div className="text-base text-gray-800 whitespace-pre-line">{form.description || <span className="text-gray-400">(Nessuna descrizione)</span>}</div>
            </div>
          </div>
          {/* Promozioni */}
          <div className="mb-8 flex items-center gap-4">
            <span className="font-semibold text-pink-600">Promozioni:</span>
            <button type="button" className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl font-semibold hover:bg-pink-200 transition flex items-center gap-2 shadow-md" onClick={onManagePromotions} title="Gestisci le promozioni associate a questo prodotto" aria-label="Gestisci le promozioni associate a questo prodotto">
              <span className="text-lg">%</span> Gestisci Promozioni
            </button>
            {promotions && promotions.length > 0 && (
              <div className="flex gap-2">
                {promotions.map((promo: any, idx: number) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">{promo.name}</span>
                ))}
              </div>
            )}
          </div>
          {/* Pulsanti azione */}
          <div className="flex justify-between items-center mt-10">
            <div className="flex gap-4 items-center">
              {onDelete && (
                <button type="button" className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white shadow-sm transition-all duration-200 hover:scale-105" onClick={onDelete} title="Elimina questo prodotto" aria-label="Elimina questo prodotto">
                  <span>🗑️</span> Elimina
                </button>
              )}
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-2xl shadow transition flex items-center gap-2"
                onClick={() => window.location.assign('/admin')}
                title="Torna alla home admin"
                aria-label="Torna alla home admin"
              >
                <span>⬅️</span> Torna indietro
              </button>
              <button
                type="button"
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 transition-all duration-200 hover:scale-105"
                onClick={() => {
                  const mapped = {
                    ...form,
                    stock_quantity: Number(form.stock),
                    is_active: form.status === 'active',
                  };
                  delete mapped.stock;
                  delete mapped.status;
                  onSave(mapped);
                }}
                title="Salva le modifiche"
                aria-label="Salva le modifiche"
              >
                <span>💾</span> Salva
              </button>
            </div>
            {/* Mappatura dati per compatibilità backend */}
            {/* Sostituisco la chiamata onSave(form) con la versione mappata */}
            {/*
            <button ... onClick={() => {
              const mapped = {
                ...form,
                stock_quantity: Number(form.stock),
                is_active: form.status === 'active',
              };
              delete mapped.stock;
              delete mapped.status;
              onSave(mapped);
            }} ... >
            */}
          </div>
        </div>
      </div>
    </div>
  );
}