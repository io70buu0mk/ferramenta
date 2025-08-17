import React, { useState, useEffect } from "react";

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6 relative min-w-[340px] max-w-[90vw] border-2 border-yellow-300" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-2xl text-yellow-500 hover:text-red-500 font-bold bg-white rounded-full border border-yellow-200 w-10 h-10 flex items-center justify-center shadow"
          onClick={onClose}
          aria-label="Chiudi upload immagini"
        >×</button>
        <div>
          <div
            className="w-44 h-44 border-2 border-dashed rounded-xl flex items-center justify-center text-neutral-400 mb-4 bg-neutral-50 hover:border-yellow-400 hover:text-yellow-600 transition-all"
            onDrop={e => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              if (files.length) onUpload(files as File[]);
            }}
            onDragOver={e => e.preventDefault()}
          >
            <span className="text-lg text-neutral-500">Trascina qui le immagini</span>
          </div>
          <label className="w-full flex flex-col items-center">
            <span className="mb-2 text-sm text-neutral-700 font-semibold">Oppure seleziona file</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mb-2 border border-yellow-300 rounded-xl px-3 py-2 w-full"
              onChange={e => {
                const files = Array.from((e.target as HTMLInputElement).files || []).filter(f => f.type.startsWith('image/'));
                if (files.length) onUpload(files as File[]);
              }}
            />
          </label>
          <span className="text-sm text-neutral-600">Carica manualmente o trascina le immagini nello spazio sopra</span>
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

export default function ProductForm({ product, onSave, onDelete, categories, promotions, onManagePromotions }: any) {
  const [form, setForm] = useState<ProductFormState>({
    id: product?.id || undefined,
    name: product?.name || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    price: product?.price || 0,
    status: product?.status || 'draft',
    description: product?.description || '',
    images: product?.images || [],
    ...product
  });
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<any[]>([]);

  useEffect(() => {
    const newErrors: ProductFormErrors = {};
    if (!form.name || form.name.trim() === "") newErrors.name = "Il nome è obbligatorio.";
    if (!form.category || form.category.trim() === "") newErrors.category = "La categoria è obbligatoria.";
    if (form.price === undefined || form.price === null || isNaN(Number(form.price)) || Number(form.price) <= 0) newErrors.price = "Il prezzo deve essere maggiore di zero.";
    setErrors(newErrors);
  }, [form.name, form.category, form.price]);

  const handleFieldChange = (field: keyof ProductFormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Gestione upload immagini
  const handleUploadImages = (files: File[]) => {
    setUploadingImages(files.map(file => ({ file, status: 'uploading' })));
    // Simulazione upload asincrono
    setTimeout(() => {
      setForm(prev => ({ ...prev, images: [...prev.images, ...files.map(f => URL.createObjectURL(f))] }));
      setUploadingImages(files.map(file => ({ file, status: 'done' })));
      setTimeout(() => setUploadingImages([]), 1000);
    }, 1500);
  };

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
                {form.images.length > 0 ? (
                  <div className="mb-4">
                    <img
                      src={form.images[selectedImageIndex] || form.images[0]}
                      alt="Immagine prodotto"
                      className="w-64 h-64 object-cover rounded-xl border shadow-lg mx-auto"
                    />
                  </div>
                ) : (
                  <div className="mb-4 w-64 h-64 flex items-center justify-center bg-yellow-100 rounded-xl border border-dashed text-yellow-400">
                    Nessuna immagine
                  </div>
                )}
                  {/* Miniature + pulsante aggiunta in una riga sotto */}
                  <div className="flex gap-3 justify-center items-center mt-2">
                    {form.images.map((img, idx) => (
                      <div key={img} className="relative">
                        <img
                          src={img}
                          alt={`Miniatura ${idx + 1}`}
                          className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${selectedImageIndex === idx ? 'ring-2 ring-yellow-500' : ''}`}
                          onClick={() => setSelectedImageIndex(idx)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {/* Nome prodotto */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block font-semibold text-gray-600">Nome Prodotto</label>
                <span className="text-xs text-gray-400" title="Il nome sarà visibile agli utenti.">ⓘ</span>
              </div>
              <input
                type="text"
                className={`w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400 transition-all duration-200 ${errors.name ? 'border-red-300 ring-2 ring-red-200 animate-shake' : ''}`}
                value={form.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Nome prodotto"
                aria-label="Nome prodotto"
              />
              <span className="text-xs text-gray-400 ml-1" title="Campo obbligatorio">Obbligatorio</span>
              {errors.name && <div className="text-xs text-red-500 mt-1 animate-fade-in">{errors.name}</div>}
            </div>
            {/* Categoria */}
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Categoria</label>
              <div className="relative">
                <select
                  className="w-full rounded-xl border-gray-300 p-3"
                  value={form.category}
                  onChange={e => handleFieldChange('category', e.target.value)}
                  aria-label="Seleziona categoria"
                >
                  <option value="">Seleziona categoria</option>
                  {categories && categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-gray-400 ml-1" title="Campo obbligatorio">Obbligatorio</span>
              {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
            </div>
            {/* Stock */}
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Stock</label>
              <input type="number" className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400 transition-all duration-200" min={0} value={form.stock} onChange={e => handleFieldChange('stock', e.target.value)} aria-label="Stock disponibile" />
              <span className="text-xs text-gray-400 ml-1" title="Quantità disponibile">Disponibilità</span>
            </div>
            {/* Stato */}
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Stato</label>
              <select className="w-full rounded-xl border-gray-300 p-3" value={form.status} onChange={e => handleFieldChange('status', e.target.value)} aria-label="Seleziona stato">
                <option value="draft">Bozza</option>
                <option value="active">Attivo</option>
                <option value="inactive">Non attivo</option>
              </select>
            </div>
            {/* Prezzo */}
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Prezzo</label>
              <input type="number" className={`w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400 transition-all duration-200 ${errors.price ? 'border-red-300 ring-2 ring-red-200 animate-shake' : ''}`} min={0} step={0.01} value={form.price} onChange={e => handleFieldChange('price', e.target.value)} aria-label="Prezzo in euro" />
              <span className="text-xs text-gray-400 ml-1" title="Prezzo di vendita">Prezzo in euro</span>
              {errors.price && <div className="text-xs text-red-500 mt-1 animate-fade-in">{errors.price}</div>}
            </div>
          </div>
          {/* Descrizione */}
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-600">Descrizione</label>
            <textarea className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400 min-h-[80px]" value={form.description} onChange={e => handleFieldChange('description', e.target.value)} placeholder="Descrizione prodotto" maxLength={500} aria-label="Descrizione prodotto" />
            <span className="text-xs text-gray-400 ml-1" title="Breve descrizione">Max 500 caratteri</span>
            <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-yellow-100">
              <span className="block text-sm font-semibold text-gray-500 mb-2">Anteprima descrizione:</span>
              <div className="text-base text-gray-700 whitespace-pre-line">{form.description || <span className="text-gray-400">(Nessuna descrizione)</span>}</div>
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
            {onDelete && (
              <button type="button" className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white shadow-sm transition-all duration-200 hover:scale-105" onClick={onDelete} title="Elimina questo prodotto" aria-label="Elimina questo prodotto">
                <span>🗑️</span> Elimina
              </button>
            )}
            <button type="button" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 transition-all duration-200 hover:scale-105" onClick={() => onSave(form)} title="Salva le modifiche" aria-label="Salva le modifiche">
              <span>💾</span> Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}