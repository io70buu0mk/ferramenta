
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function EmailConfirmedPage() {
  useEffect(() => {
    // Controlla se l'utente è ora autenticato
    const checkAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Attendi un momento per far vedere la conferma, poi reindirizza
        setTimeout(() => {
          window.location.replace('/');
        }, 3000);
      } else {
        // Se non è autenticato, reindirizza al login dopo 5 secondi
        setTimeout(() => {
          window.location.replace('/auth');
        }, 5000);
      }
    };

    checkAndRedirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia to-cemento/20 px-4">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-antracite">Email Confermata!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-cemento text-lg">
              🎉 Perfetto! La tua email è stata confermata con successo.
            </p>
            
            <div className="animate-pulse">
              <p className="text-senape font-semibold">
                Ti stiamo reindirizzando...
              </p>
            </div>
          </div>

          <div className="text-sm text-cemento/70 space-y-2">
            <p>Ora puoi tornare alla pagina precedente per accedere al tuo account.</p>
            <p>Se non vieni reindirizzato automaticamente, puoi chiudere questa finestra.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
