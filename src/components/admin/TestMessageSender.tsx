import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestMessageSender() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("https://bqrqujqlaizirskgvyst.supabase.co/functions/v1/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: "+393899822879", // Numero amministratore di test
          messaggio: message || "Messaggio di test dall'area amministratore"
        })
      });
      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, data });
    } catch (e: any) {
      setError(e.message || "Errore di rete");
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        className="w-full border rounded-lg p-3 bg-neutral-50 mb-2"
        rows={3}
        placeholder="Scrivi il messaggio di test da inviare..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <Button onClick={handleSend} disabled={loading || !message.trim()} className="w-full mb-2">
        {loading ? "Invio..." : "Invia messaggio di test"}
      </Button>
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      {result && (
        <div className="bg-neutral-100 border border-neutral-300 rounded p-2 text-xs mt-2">
          <b>Risposta funzione:</b>
          <pre>Status: {result.status}</pre>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
