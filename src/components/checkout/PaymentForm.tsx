import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/stripe';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Pagamento completato con successo!');
          onSuccess();
          break;
        case 'processing':
          setMessage('Il tuo pagamento è in elaborazione.');
          break;
        case 'requires_payment_method':
          setMessage('Il tuo pagamento non è andato a buon fine, riprova.');
          break;
        default:
          setMessage('Qualcosa è andato storto.');
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'Si è verificato un errore con il pagamento.');
        onError(error.message || 'Errore di pagamento');
      } else {
        setMessage('Si è verificato un errore imprevisto.');
        onError('Errore imprevisto');
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagamento Sicuro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Totale da pagare:</span>
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <PaymentElement 
              options={paymentElementOptions}
              onChange={(event) => {
                setIsComplete(event.complete);
              }}
            />
          </div>

          {message && (
            <Alert className={message.includes('successo') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.includes('successo') ? 'text-green-800' : 'text-red-800'}>
                {message.includes('successo') && <CheckCircle className="w-4 h-4 inline mr-2" />}
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !stripe || !elements || !isComplete}
            className="w-full h-12 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Paga {formatCurrency(amount)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}