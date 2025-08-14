// Componente immagine ordinabile con ghost e animazioni
interface SortableImageProps {
  id: string;
  img: string;
  idx: number;
  selectedThumb: number | null;
  setSelectedThumb: (idx: number | null) => void;
  onRemove: () => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ id, img, idx, selectedThumb, setSelectedThumb, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.85 : 1,
    boxShadow: isDragging
      ? '0 16px 48px 0 rgba(255,193,7,0.25), 0 0 0 6px #fbbf24'
      : selectedThumb === idx
        ? '0 0 0 4px #fbbf24, 0 2px 8px rgba(0,0,0,0.08)'
        : '0 2px 8px rgba(0,0,0,0.08)',
    border: isDragging || (over && over.id === id) ? '2px solid #fbbf24' : '2px solid #e5e7eb',
    borderRadius: '1.2rem',
    background: '#fff',
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    minWidth: '7rem',
    minHeight: '7rem',
    transitionProperty: 'box-shadow, border, transform, opacity',
    transitionDuration: '0.2s',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setSelectedThumb(idx)}
      onMouseLeave={() => setSelectedThumb(null)}
      className="inline-block"
    >
      <img
        src={img}
        alt={`Anteprima ${idx+1}`}
        className="w-28 h-28 object-cover rounded-xl transition-all duration-300"
        style={{ border: selectedThumb === idx ? '2px solid #fbbf24' : '2px solid #e5e7eb' }}
      />
      <button
        type="button"
        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center border border-neutral-200 hover:bg-red-500 hover:text-white transition-all duration-200"
        onClick={onRemove}
        aria-label="Rimuovi immagine"
      >

      </button>
    </div>
  );
};

interface SortableImageProps {
  id: string;
  img: string;
  idx: number;
  selectedThumb: number | null;
  setSelectedThumb: (idx: number | null) => void;
  onRemove: () => void;
}

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import React, { useState } from "react";
// ...existing code...

export default function ProductForm({ product, onSave, onDelete, categories, promotions, onManagePromotions }) {
  const [form, setForm] = useState({ ...product });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError("Errore nel salvataggio");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 p-8 bg-neutral-50 min-h-[80vh]">
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <img src={product.imageUrl} alt={product.name} className="rounded-xl shadow-lg max-w-xs w-full object-contain bg-neutral-100 p-6 mb-4" />
          <span className="text-lg font-semibold text-gray-700 mt-2">{product.name}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-extrabold mb-8 text-gray-800">Dettagli Prodotto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Categoria</label>
              <select className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Stock</label>
              <input type="number" className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Stato</label>
              <select className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Attivo">Attivo</option>
                <option value="Non attivo">Non attivo</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-600">Prezzo</label>
              <input type="number" className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-600">Descrizione</label>
            <textarea className="w-full rounded-xl border-gray-300 p-3 focus:ring-2 focus:ring-yellow-400 min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-semibold text-pink-600">Promozioni:</span>
            <button type="button" className="bg-pink-100 text-pink-700 px-4 py-2 rounded-xl font-semibold hover:bg-pink-200 transition flex items-center gap-2" onClick={onManagePromotions}>
              <span className="text-lg">%</span> Gestisci Promozioni
            </button>
            {promotions && promotions.length > 0 && (
              <div className="flex gap-2">
                {promotions.map((promo, idx) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">{promo.name}</span>
                ))}
              </div>
            )}
          </div>
          {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
          {success && <div className="mb-4 text-green-600 font-semibold">Salvataggio riuscito!</div>}
          <div className="flex justify-between items-center mt-10">
            <button type="button" className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2" onClick={onDelete}>
              <span>🗑️</span> Elimina
            </button>
            <button type="button" disabled={loading} className={`bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={handleSave}>
              {loading ? <span className="animate-spin">⏳</span> : <span>💾</span>} Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}