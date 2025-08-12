import { loadStripe } from '@stripe/stripe-js';
// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);
// Stripe appearance configuration
export const stripeConfig = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#DAA520',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  },
};
// Payment element options
export const paymentElementOptions = {
  layout: 'tabs' as const,
  paymentMethodOrder: ['card'],
};
// Helper functions
export const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
};
export const calculateTotal = (subtotal: number, taxRate = 0.22) => {
  const tax = subtotal * taxRate;
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
};