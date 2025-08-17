import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/admin/ProductForm';

export default function AdminProductNew() {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const { categories } = useCategories();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 justify-between">
          <span className="font-semibold">Area Admin - Nuovo Prodotto</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <ProductForm
          product={{}}
          categories={categories.map((cat: any) => cat.name)}
          promotions={[]}
          onSave={async (data) => {
            try {
              const newProduct = await createProduct(data);
              toast({ title: 'Prodotto creato', description: 'Il nuovo prodotto è stato aggiunto.' });
              navigate(`/admin/prodotto/${newProduct.id}`);
            } catch (err) {
              toast({ title: 'Errore', description: 'Impossibile creare il prodotto', variant: 'destructive' });
            }
          }}
          onDelete={undefined}
          onManagePromotions={() => {}}
        />
      </div>
    </div>
  );
}
