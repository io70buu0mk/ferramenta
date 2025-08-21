
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/admin/ProductForm';

export default function AdminProductNew() {
  const navigate = useNavigate();
  const { createProduct, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [draft, setDraft] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function createDraft() {
      try {
        const newDraft = await createProduct({
          name: '',
          description: '',
          price: 0,
          category: '',
          images: [],
          stock_quantity: 0,
          is_active: false,
        });
        if (mounted) setDraft(newDraft);
      } catch (err) {
        toast({ title: 'Errore', description: 'Impossibile creare la bozza', variant: 'destructive' });
        navigate('/admin');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    createDraft();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-center py-20">Caricamento bozza prodotto...</div>;
  if (!draft) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 justify-between">
          <span className="font-semibold">Area Admin - Nuovo Prodotto</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <ProductForm
          product={draft}
          categories={categories.map((cat: any) => cat.name)}
          promotions={[]}
          onSave={async (data) => {
            try {
              // Attiva il prodotto (stato active)
              await updateProduct(draft.id, { ...data, is_active: true });
              toast({ title: 'Prodotto attivato', description: 'Il prodotto è ora attivo.' });
              navigate(`/admin/prodotto/${draft.id}`);
            } catch (err) {
              toast({ title: 'Errore', description: 'Impossibile attivare il prodotto', variant: 'destructive' });
            }
          }}
          onDelete={undefined}
          onManagePromotions={() => {}}
        />
      </div>
    </div>
  );
}
