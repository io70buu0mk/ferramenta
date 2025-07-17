import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { usePromotions, type Promotion } from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";
import { Percent, Euro, Calendar, Package, Search, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PromotionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
};

export function PromotionForm({ open, onOpenChange, promotion }: PromotionFormProps) {
  const { createPromotion, updatePromotion } = usePromotions();
  const { products } = useProducts();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_price',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value.toString(),
        start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
        end_date: new Date(promotion.end_date).toISOString().slice(0, 16),
        is_active: promotion.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        end_date: '',
        is_active: true
      });
    }
    setSelectedProducts([]);
    setProductSearch('');
  }, [promotion, open]);

  const activeProducts = products.filter(p => p.is_active);
  const filteredProducts = activeProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome della promozione è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      toast({
        title: "Errore",
        description: "Il valore dello sconto deve essere maggiore di 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.discount_type === 'percentage' && parseFloat(formData.discount_value) > 100) {
      toast({
        title: "Errore",
        description: "La percentuale di sconto non può essere superiore al 100%",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Errore",
        description: "Le date di inizio e fine sono obbligatorie",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: "Errore",
        description: "La data di fine deve essere successiva alla data di inizio",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un prodotto per la promozione",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const promotionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active
      };

      if (promotion) {
        await updatePromotion(promotion.id, promotionData, selectedProducts);
      } else {
        await createPromotion(promotionData, selectedProducts);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Errore salvataggio promozione:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-neutral-200/50">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Percent size={20} className="text-white" />
            </div>
            {promotion ? 'Modifica Promozione' : 'Nuova Promozione'}
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            {promotion ? 'Aggiorna le informazioni della promozione' : 'Crea una nuova promozione per i tuoi prodotti'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informazioni di base */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-red-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Informazioni Promozione</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700">
                    Nome Promozione *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-red-400 focus:ring-red-400"
                    placeholder="Es. Saldi Estivi 2024"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                    Descrizione
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-red-400 focus:ring-red-400"
                    placeholder="Descrizione della promozione..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipo di sconto */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Percent size={18} className="text-green-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Tipo di Sconto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type" className="text-sm font-medium text-neutral-700">
                    Tipo di Sconto
                  </Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(value: 'percentage' | 'fixed_price') => 
                      setFormData(prev => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white border-neutral-300 focus:border-red-400 focus:ring-red-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                      <SelectItem value="percentage">Percentuale di sconto</SelectItem>
                      <SelectItem value="fixed_price">Prezzo fisso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount_value" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    {formData.discount_type === 'percentage' ? <Percent size={14} /> : <Euro size={14} />}
                    {formData.discount_type === 'percentage' ? 'Percentuale (%)' : 'Nuovo Prezzo (€)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    required
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-red-400 focus:ring-red-400"
                    placeholder={formData.discount_type === 'percentage' ? '20' : '29.99'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-blue-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Periodo Promozione</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-sm font-medium text-neutral-700">
                    Data di Inizio
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-red-400 focus:ring-red-400"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date" className="text-sm font-medium text-neutral-700">
                    Data di Fine
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="mt-1 bg-white/80 border-neutral-200 focus:border-red-400 focus:ring-red-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selezione prodotti */}
          <Card className="bg-white/60 backdrop-blur-sm border border-neutral-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-purple-500" />
                  <h3 className="text-lg font-semibold text-neutral-800">Prodotti</h3>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {selectedProducts.length} selezionati
                </Badge>
              </div>
              
              {!showProductSelector ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductSelector(true)}
                  className="w-full bg-white/80 border-neutral-200 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Seleziona Prodotti
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-neutral-400" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Cerca prodotti..."
                      className="bg-white/80 border-neutral-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-lg bg-white/50">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-neutral-500">
                        Nessun prodotto trovato
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 border border-neutral-100"
                          >
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => handleProductToggle(product.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label 
                                htmlFor={`product-${product.id}`}
                                className="text-sm font-medium text-neutral-700 cursor-pointer"
                              >
                                {product.name}
                              </Label>
                              <p className="text-xs text-neutral-500 truncate">
                                €{product.price?.toFixed(2) || '0.00'} - Stock: {product.stock_quantity}
                              </p>
                            </div>
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-md border border-neutral-200"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProductSelector(false)}
                      className="flex-1"
                    >
                      Chiudi
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Seleziona Tutti
                    </Button>
                  </div>
                </div>
              )}
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
              disabled={loading}
              className="flex-1 h-12 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-medium"
            >
              {loading ? 'Salvataggio...' : (promotion ? 'Aggiorna Promozione' : 'Crea Promozione')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}