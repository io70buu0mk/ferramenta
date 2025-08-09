import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";


export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { state } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'carta' | 'contanti'>("carta");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [deliveryType, setDeliveryType] = useState<'consegna' | 'ritiro'>("consegna");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhoneField, setShowPhoneField] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const products = state.items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  useEffect(() => {
    // Recupera profilo utente per mostrare campo telefono solo se mancante
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (!error && data) {
          setUserProfile(data);
          if (!data.numero_telefono) setShowPhoneField(true);
          else setShowPhoneField(false);
        } else {
          setShowPhoneField(true);
        }
      } else {
        setShowPhoneField(true);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Validazioni base
      if (!email) {
        setError("Inserisci la tua email.");
        setLoading(false);
        return;
      }
      if (products.length === 0) {
        setError("Il carrello è vuoto.");
        setLoading(false);
        return;
      }
      if (deliveryType === "consegna" && !deliveryPlace) {
        setError("Inserisci il luogo di consegna.");
        setLoading(false);
        return;
      }
      if (!deliveryDate) {
        setError("Scegli la data di consegna o ritiro.");
        setLoading(false);
        return;
      }
      if (!deliveryTime) {
        setError("Scegli l'orario di consegna.");
        setLoading(false);
        return;
      }
      if (showPhoneField && !phone) {
        setError("Inserisci il numero di telefono.");
        setLoading(false);
        return;
      }
      // Recupero il token JWT dell'utente autenticato
      const { data } = await supabase.auth.getSession();
      const token = data.session ? data.session.access_token : "";
      // Determina luogo effettivo
      let luogoEffettivo = deliveryType === "consegna" ? deliveryPlace : "Ritiro in negozio - Via Roma 123, Milano";
      const dataEffettiva = deliveryDate;
      // Funzione per creare ordine e spostare prodotti dal carrello
      async function createOrderAndMoveItems() {
        // 1. Crea ordine
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sessione utente non trovata");
        const userId = session.user.id;
        const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([{
            user_id: userId,
            email,
            total,
            status: "pending",
            delivery_date: dataEffettiva ? new Date(`${dataEffettiva}T${deliveryTime}`) : null,
            delivery_location: luogoEffettivo,
            payment_method: paymentType
          }])
          .select()
          .single();
        if (orderError || !order) throw new Error("Errore creazione ordine: " + (orderError?.message || ""));
        // 2. Inserisci order_items
        const orderItems = products.map(p => ({
          order_id: order.id,
          product_id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          product_status: 'in_preparazione'
        }));
        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) throw new Error("Errore inserimento prodotti ordine: " + itemsError.message);
        // 3. Svuota carrello
        // Trova cart_id
        const { data: cart } = await supabase.from("carts").select("id").eq("user_id", userId).single();
        if (cart) {
          await supabase.from("cart_items").delete().eq("cart_id", cart.id);
        }
      }

      if (paymentType === "carta") {
        if (!stripe || !elements) {
          setError("Stripe non è pronto.");
          setLoading(false);
          return;
        }
        // Flusso pagamento con carta
        const res = await fetch("https://bqrqujqlaizirskgvyst.functions.supabase.co/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ email, products }),
        });
        const dataRes = await res.json();
        if (!dataRes.clientSecret) {
          setError("Errore nella creazione del pagamento.");
          setLoading(false);
          return;
        }
        const result = await stripe.confirmCardPayment(dataRes.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: { email },
          },
        });
        if (result.error) {
          setError(result.error.message || "Errore nel pagamento.");
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
          await createOrderAndMoveItems();
          await sendOrderSms(email, products, luogoEffettivo, paymentType, dataEffettiva, deliveryTime, showPhoneField ? phone : undefined, notes);
          navigate("/order-confirmation");
        }
      } else if (paymentType === "contanti") {
        await createOrderAndMoveItems();
        await sendOrderSms(email, products, luogoEffettivo, paymentType, dataEffettiva, deliveryTime, showPhoneField ? phone : undefined, notes);
        setSuccess(true);
        return;
      }
    } catch (err: any) {
      setError(err.message || "Errore di rete.");
      console.log("[CheckoutForm] Errore catch:", err);
    }
    setLoading(false);
  };

  // Funzione helper per invio SMS dettagliato
  async function sendOrderSms(email: string, products: any[], deliveryPlace: string, paymentType: 'carta' | 'contanti', deliveryDate?: string, deliveryTime?: string, phoneOverride?: string, noteAggiuntive?: string) {
    // Recupera profilo utente
    const { data: { session } } = await supabase.auth.getSession();
    let userProfile = null;
    let userId = null;
    if (session) {
      userId = session.user.id;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!error && data) userProfile = data;
    }
    // Data/ora di invio SMS
    const now = new Date();
    const dataOraInvio = now.toLocaleString();
    // Data/ora scelta dal cliente
    let dataOraCliente = "Non specificata";
    if (deliveryDate && deliveryTime) {
      // Prova a comporre una stringa leggibile
      const dataObj = new Date(`${deliveryDate}T${deliveryTime}`);
      if (!isNaN(dataObj.getTime())) {
        dataOraCliente = dataObj.toLocaleString();
      } else {
        dataOraCliente = `${deliveryDate} ${deliveryTime}`;
      }
    } else if (deliveryDate) {
      dataOraCliente = deliveryDate;
    }
    const prodottiDettaglio = products.map(p => `${p.name} x${p.quantity} (€${p.price})`).join(', ');
    const totale = products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
    const luogo = deliveryPlace || "Non specificato";
    const tipoPagamento = paymentType === "carta" ? "Carta" : "Contanti";
    const nome = userProfile?.nome || "";
    const cognome = userProfile?.cognome || "";
    const telefono = phoneOverride || userProfile?.numero_telefono || "";
    const note = noteAggiuntive || "";
    const smsBody =
      `Nuovo ordine ricevuto\n` +
      `Data/ora invio SMS: ${dataOraInvio}\n` +
      `Data/ora richiesta dal cliente: ${dataOraCliente}\n` +
      `Utente: ${nome} ${cognome}\n` +
      `Email: ${email}\n` +
      (telefono ? `Telefono: ${telefono}\n` : "") +
      `Prodotti: ${prodottiDettaglio}\n` +
      `Totale: €${totale}\n` +
      `Luogo: ${luogo}\n` +
      `Pagamento: ${tipoPagamento}${paymentType === 'contanti' ? ' (alla consegna)' : ''}\n` +
      (note ? `Note: ${note}\n` : "");
    const smsPayload = {
      numero: '+393899822879',
      messaggio: smsBody
    };
    console.log('[DEBUG SMS] Invio payload a Supabase:', smsPayload);
    await fetch('https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/send-sms', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(smsPayload),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-2 sm:px-0 w-full max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
        <input
          type="email"
          className="w-full border rounded-lg p-3 bg-neutral-50"
          placeholder="La tua email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Consegna o ritiro</label>
        <select
          className="w-full border rounded-lg p-3 bg-neutral-50"
          value={deliveryType}
          onChange={e => setDeliveryType(e.target.value as 'consegna' | 'ritiro')}
          required
        >
          <option value="consegna">Consegna a domicilio</option>
          <option value="ritiro">Ritiro in negozio</option>
        </select>
      </div>
      {deliveryType === "consegna" ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Luogo di consegna</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            placeholder="Indirizzo o luogo di consegna"
            value={deliveryPlace}
            onChange={e => setDeliveryPlace(e.target.value)}
            required={deliveryType === "consegna"}
          />
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Luogo di ritiro</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            value="Ritiro in negozio - Via Roma 123, Milano"
            readOnly
            disabled
          />
        </div>
      )}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Data di consegna/ritiro</label>
          <input
            type="date"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Orario di consegna</label>
          <input
            type="time"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            value={deliveryTime}
            onChange={e => setDeliveryTime(e.target.value)}
            required
          />
        </div>
      </div>
      {showPhoneField && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Numero di telefono</label>
          <input
            type="tel"
            className="w-full border rounded-lg p-3 bg-neutral-50"
            placeholder="Il tuo numero di telefono"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo di pagamento</label>
        <select
          className="w-full border rounded-lg p-3 bg-neutral-50"
          value={paymentType}
          onChange={e => setPaymentType(e.target.value as 'carta' | 'contanti')}
          required
        >
          <option value="">Seleziona...</option>
          <option value="carta">Carta</option>
          <option value="contanti">Contanti</option>
        </select>
      </div>
      {paymentType === 'carta' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Carta di credito</label>
          <div className="border rounded-lg p-3 bg-neutral-50">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Note aggiuntive</label>
        <textarea
          className="w-full border rounded-lg p-3 bg-neutral-50"
          placeholder="Es. orario preferito, richieste particolari..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </div>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && paymentType === 'contanti' ? (
        <div className="text-green-600 text-lg font-semibold mb-2 text-center">
          Ordine salvato e inviato agli amministratori!<br />Riceverai una conferma appena l'ordine sarà preso in carico.<br /><br />
          <Button className="mt-4 w-full" onClick={() => navigate("/")}>Torna alla home</Button>
        </div>
      ) : (
        <Button type="submit" disabled={loading || (paymentType === 'carta' && !stripe)} className="w-full">
          {loading ? "Elaborazione..." : paymentType === 'carta' ? "Paga ora" : "Conferma ordine"}
        </Button>
      )}
    </form>
  );
}
