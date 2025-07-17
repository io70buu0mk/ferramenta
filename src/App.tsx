import OrderReviewPage from "./pages/OrderReviewPage";
          <Route path="/order-review" element={<OrderReviewPage />} />
import UserOrdersPage from "./pages/UserOrdersPage";
          <Route path="/i-miei-ordini" element={<UserOrdersPage />} />

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import ClienteAreaNew from "./pages/ClienteAreaNew";
import AdminArea from "./pages/AdminArea";
import AdminAreaNew from "./pages/AdminAreaNew";
import AdminDashboard from "./pages/AdminDashboard";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from './hooks/useCart';
import AdminOrdersPage from "./pages/AdminOrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/prodotti" element={<ProductsPage />} />
          <Route path="/servizi" element={<ServicesPage />} />
          <Route path="/prodotto/:id" element={<ProductDetail />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
          <Route path="/cliente" element={<ClienteAreaNew />} />
          <Route path="/cliente/:userId" element={<ClienteAreaNew />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/:userId" element={<AdminDashboard />} />
          <Route path="/admin-old" element={<AdminArea />} />
          <Route path="/admin-old/:userId" element={<AdminAreaNew />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-review" element={<OrderReviewPage />} />
          <Route path="/admin-ordini" element={<AdminOrdersPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
