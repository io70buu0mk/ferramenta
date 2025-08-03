-- MIGRAZIONE: Crea tabelle orders e order_items per gestione ordini e prodotti acquistati

-- Tabella ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivery_date timestamptz,
  delivery_location text,
  payment_method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabella ORDER_ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  product_status text NOT NULL DEFAULT 'in_preparazione',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indici utili
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_status ON public.order_items(product_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
