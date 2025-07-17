import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Package, Euro, Hash, Image, Tag, ToggleLeft, Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ProductFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
};

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts();
  const { categories, createCategory } = useCategories();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock_quantity: '0',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        is_active: product.is_active ?? true
      });
      setImagePreview(product.image_url);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock_quantity: '0',
        is_active: true
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast({
            title: "Errore",
            description: "Errore nel caricamento dell'immagine",
            variant: "destructive",
          });
          return;
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        category: formData.category || null,
        image_url: imageUrl || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Errore salvataggio prodotto:', error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-neutral-200/50">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            {product ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            {product ? 'Aggiorna le informazioni del prodotto' : 'Aggiungi un nuovo prodotto al catalogo'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informazioni di base */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-amber-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Informazioni Prodotto</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Tag size={14} />
                    Nome Prodotto *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-amber-400 focus:ring-amber-400"
                    placeholder="Inserisci il nome del prodotto"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                    Descrizione
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-amber-400 focus:ring-amber-400 min-h-[100px]"
                    placeholder="Descrivi il prodotto..."
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-neutral-700">
                    Categoria
                  </Label>
                  
                  {!showNewCategory ? (
                    <div className="space-y-2">
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => {
                          if (value === "new_category") {
                            setShowNewCategory(true);
                          } else {
                            setFormData(prev => ({ ...prev, category: value }));
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1 bg-white border-neutral-300 focus:border-amber-400 focus:ring-amber-400 shadow-sm">
                          <SelectValue placeholder="Seleziona una categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name} className="hover:bg-amber-50">
                              {category.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new_category" className="text-amber-600 font-medium hover:bg-amber-50">
                            <div className="flex items-center gap-2">
                              <Plus size={14} />
                              Crea nuova categoria
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nome nuova categoria"
                          className="flex-1 bg-white border-neutral-300 focus:border-amber-400 focus:ring-amber-400"
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            if (newCategoryName.trim()) {
                              try {
                                await createCategory({ name: newCategoryName.trim() });
                                setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
                                setNewCategoryName('');
                                setShowNewCategory(false);
                                toast({
                                  title: "Successo",
                                  description: "Categoria creata con successo",
                                });
                              } catch (error) {
                                toast({
                                  title: "Errore",
                                  description: "Impossibile creare la categoria",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          disabled={!newCategoryName.trim()}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName('');
                        }}
                        className="w-full text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                      >
                        Annulla
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prezzi e inventario */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Euro size={18} className="text-green-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Prezzi e Inventario</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Euro size={14} />
                    Prezzo (€)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-amber-400 focus:ring-amber-400"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Hash size={14} />
                    Quantità in Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-amber-400 focus:ring-amber-400"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Immagine e stato */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image size={18} className="text-blue-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Immagine e Stato</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    <Image size={14} />
                    Immagine Prodotto
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-full bg-white/80 border-neutral-200 hover:bg-amber-50 hover:border-amber-300"
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imagePreview ? 'Cambia Immagine' : 'Seleziona Immagine'}
                    </Button>
                  </div>
                  
                  {imagePreview && (
                    <div className="relative mt-3 inline-block">
                      <img
                        src={imagePreview}
                        alt="Anteprima"
                        className="w-32 h-32 object-cover rounded-lg border border-neutral-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  formData.is_active 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <ToggleLeft size={20} className={formData.is_active ? "text-green-600" : "text-gray-400"} />
                    <div>
                      <Label htmlFor="is_active" className="text-sm font-medium text-neutral-700 cursor-pointer">
                        Prodotto Attivo
                      </Label>
                      <p className="text-xs text-neutral-500">Il prodotto sarà visibile nel catalogo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={formData.is_active ? "default" : "secondary"} 
                      className={`text-xs transition-colors ${
                        formData.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formData.is_active ? "Attivo" : "Inattivo"}
                    </Badge>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      className={`transition-colors ${
                        formData.is_active 
                          ? 'data-[state=checked]:bg-green-500' 
                          : 'data-[state=unchecked]:bg-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Pulsanti azione */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-medium"
            >
              {uploading ? 'Caricamento...' : loading ? 'Salvataggio...' : (product ? 'Aggiorna Prodotto' : 'Crea Prodotto')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}