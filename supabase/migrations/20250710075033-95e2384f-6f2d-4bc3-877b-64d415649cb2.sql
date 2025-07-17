-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create policies for product images bucket
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND (EXISTS ( 
    SELECT 1
    FROM user_profiles
    WHERE (user_profiles.id = auth.uid()) 
      AND (LOWER(user_profiles.role) = 'amministratore')
  ))
);

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND (EXISTS ( 
    SELECT 1
    FROM user_profiles
    WHERE (user_profiles.id = auth.uid()) 
      AND (LOWER(user_profiles.role) = 'amministratore')
  ))
);

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND (EXISTS ( 
    SELECT 1
    FROM user_profiles
    WHERE (user_profiles.id = auth.uid()) 
      AND (LOWER(user_profiles.role) = 'amministratore')
  ))
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_price')),
  discount_value NUMERIC NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create promotion_products junction table for many-to-many relationship
CREATE TABLE public.promotion_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(promotion_id, product_id)
);

-- Enable RLS on promotions table
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotions
CREATE POLICY "Everyone can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can manage promotions" 
ON public.promotions 
FOR ALL 
USING (EXISTS ( 
  SELECT 1
  FROM user_profiles
  WHERE (user_profiles.id = auth.uid()) 
    AND (LOWER(user_profiles.role) = 'amministratore')
));

-- Enable RLS on promotion_products table
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotion_products
CREATE POLICY "Everyone can view promotion products" 
ON public.promotion_products 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage promotion products" 
ON public.promotion_products 
FOR ALL 
USING (EXISTS ( 
  SELECT 1
  FROM user_profiles
  WHERE (user_profiles.id = auth.uid()) 
    AND (LOWER(user_profiles.role) = 'amministratore')
));

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on promotions
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();