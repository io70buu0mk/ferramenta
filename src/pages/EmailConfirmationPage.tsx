
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Clock, RefreshCw } from "lucide-react";

export default function EmailConfirmationPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Controlla sessione iniziale
    checkSession();

    // Listener per cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Email confermata! Avvia animazione e reindirizza
        handleEmailConfirmed(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Utente già loggato, reindirizza
      window.location.replace('/');
    }
  };

  const handleEmailConfirmed = (user: any) => {
    setUser(user);
    // Dopo 3 secondi reindirizza alla home
    setTimeout(() => {
      window.location.replace('/');
    }, 3000);
  };

  const resendConfirmation = async () => {
    setIsChecking(true);
    try {
      // Ottieni l'email dall'ultimo tentativo di registrazione (se disponibile)
      // Questo è un workaround - in produzione potresti voler salvare l'email in localStorage
      const email = prompt("Inserisci la tua email per rinviare la conferma:");
      if (email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        
        if (error) throw error;
        alert("Email di conferma inviata!");
      }
    } catch (error: any) {
      alert("Errore nell'invio dell'email: " + error.message);
    }
    setIsChecking(false);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia to-cemento/20 px-4">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-antracite">Email Confermata!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-cemento mb-6">
              Benvenuto! La tua email è stata confermata con successo.
            </p>
            <div className="animate-pulse">
              <p className="text-senape font-semibold">
                Reindirizzamento alla home page...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sabbia to-cemento/20 px-4">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-senape/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-senape animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-antracite">Conferma la tua Email</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-cemento">
              Ti abbiamo inviato un'email di conferma. Clicca sul link nell'email per confermare il tuo account.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-senape">
              <Clock className="w-5 h-5" />
              <span className="text-sm">In attesa di conferma...</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={resendConfirmation}
              disabled={isChecking}
              variant="outline"
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Invio...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reinvia Email di Conferma
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => window.location.replace('/auth')}
              variant="ghost"
              className="w-full"
            >
              Torna al Login
            </Button>
          </div>

          <div className="text-xs text-cemento/70">
            <p>Non hai ricevuto l'email? Controlla la cartella spam o clicca "Reinvia"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
