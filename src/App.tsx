import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OrderReviewPage from "./pages/OrderReviewPage";
import UserOrdersPage from "./pages/UserOrdersPage";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import ClienteAreaNew from "./pages/ClienteAreaNew";
import AdminArea from "./pages/AdminArea";
import AdminAreaNew from "./pages/AdminAreaNew";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductDetail from "./pages/AdminProductDetail";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";
import { Toaster } from "./components/ui/toaster";
import { CartProvider } from './hooks/useCart';
import AdminOrdersPage from "./pages/AdminOrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

const App = () => {
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Notifiche push rimosse
      }
    });

    // Notifiche push rimosse
  }, []);

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
          <Route path="/admin/prodotto/:id" element={<AdminProductDetail />} />
          <Route path="/admin-old/:userId" element={<AdminAreaNew />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-review" element={<OrderReviewPage />} />
          <Route path="/user-orders" element={<UserOrdersPage />} />
          <Route path="/admin-ordini" element={<AdminOrdersPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
