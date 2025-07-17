
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { loading, error, handleRegister, handleLogin, resetPassword, setError } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        // Controlla la sessione corrente
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Errore controllo sessione:", sessionError);
          // Pulisci eventuale sessione corrotta
          await supabase.auth.signOut();
        }
        
        if (mounted && session?.user) {
          console.log("✅ Sessione attiva trovata, reindirizzamento...");
          window.location.replace(`/cliente/${session.user.id}`);
          return;
        }
      } catch (error) {
        console.error("Errore durante il controllo della sessione:", error);
        // In caso di errore, pulisci la sessione
        await supabase.auth.signOut();
      } finally {
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    // Listener per cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (mounted && event === 'SIGNED_IN' && session?.user) {
        console.log("✅ Utente autenticato, reindirizzamento...");
        // Breve delay per assicurarsi che tutto sia settato
        setTimeout(() => {
          window.location.replace(`/cliente/${session.user.id}`);
        }, 100);
      }
      
      if (mounted && event === 'SIGNED_OUT') {
        console.log("📤 Utente disconnesso");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Mostra loading mentre controlla la sessione
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-amber-50/30">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Controllo sessione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-amber-50/30 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <AuthHeader isLogin={authMode === "login"} />
          
          <CardContent>
            {authMode === "login" ? (
              <LoginForm 
                onLogin={handleLogin}
                onResetPassword={resetPassword}
                loading={loading}
                error={error}
              />
            ) : (
              <RegisterForm 
                onRegister={handleRegister}
                loading={loading}
                error={error}
              />
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
                disabled={loading}
              >
                {authMode === "login" 
                  ? "Non hai un account? Registrati qui" 
                  : "Hai già un account? Accedi qui"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
