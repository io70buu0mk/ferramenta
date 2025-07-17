
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoginMethod } from "@/types/auth";
import { processEmailForSupabase } from "@/utils/authHelpers";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginIdentifier: string, password: string, loginMethod: LoginMethod) => {
    setLoading(true);
    setError(null);

    console.log("🔄 Inizio login utente");
    console.log("🔑 Metodo:", loginMethod);
    console.log("📧 Identificatore:", loginIdentifier);

    if (!loginIdentifier || !password) {
      setError("Inserisci le credenziali");
      setLoading(false);
      return;
    }

    try {
      // Pulisci eventuali sessioni precedenti
      await supabase.auth.signOut();
      
      // Aspetta un momento per assicurarsi che la sessione sia pulita
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let signInData;
      
      if (loginMethod === "phone") {
        console.log("📱 Login con telefono");
        signInData = await supabase.auth.signInWithPassword({
          phone: loginIdentifier,
          password,
        });
      } else {
        // Login con email o nome utente
        if (loginIdentifier.includes("@")) {
          console.log("📧 Login con email");
          // Processa l'email per rimuovere .admin se presente
          const emailPulita = processEmailForSupabase(loginIdentifier);
          console.log("📧 Email processata:", emailPulita);
          
          signInData = await supabase.auth.signInWithPassword({
            email: emailPulita,
            password,
          });
        } else {
          console.log("👤 Login con nome utente");
          // Cerca nella tabella user_profiles per nome_utente
          const { data: profiles, error: profileErr } = await supabase
            .from("user_profiles")
            .select("email")
            .eq("nome_utente", loginIdentifier);
          
          if (profileErr) {
            console.error("Errore ricerca profilo:", profileErr);
            throw new Error("Errore durante la ricerca del nome utente");
          }
          
          if (!profiles || profiles.length === 0) {
            throw new Error("Nome utente non trovato");
          }
          
          if (profiles.length > 1) {
            throw new Error("Errore: nome utente duplicato nel database");
          }
          
          const email = profiles[0].email;
          console.log("Nome utente trovato con email:", email);
          
          signInData = await supabase.auth.signInWithPassword({
            email: email,
            password,
          });
        }
      }

      console.log("Risposta login:", signInData);
      if (signInData.error) throw signInData.error;
      
      if (signInData.data.user && signInData.data.session) {
        console.log("✅ Login completato:", signInData.data.user.id);
        
        // Aspetta un momento per assicurarsi che la sessione sia stabilita
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verifica che la sessione sia effettivamente attiva
        const { data: currentSession } = await supabase.auth.getSession();
        if (currentSession.session) {
          console.log("✅ Sessione verificata, reindirizzamento...");
          window.location.replace(`/cliente/${signInData.data.user.id}`);
        } else {
          throw new Error("Sessione non stabilita correttamente");
        }
      } else {
        throw new Error("Login completato ma dati utente mancanti");
      }
    } catch (error: any) {
      console.error("💥 Errore login:", error);
      let errorMessage = error.message;
      
      // Personalizza i messaggi di errore
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Credenziali non valide. Verifica email/nome utente e password.";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Devi confermare la tua email prima di accedere. Controlla la tua casella di posta.";
      } else if (errorMessage.includes("Too many requests")) {
        errorMessage = "Troppi tentativi di accesso. Attendi un momento prima di riprovare.";
      }
      
      setError(errorMessage);
    }
    
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      // Processa l'email per rimuovere .admin se presente
      const emailPulita = processEmailForSupabase(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(emailPulita, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    error,
    handleLogin,
    resetPassword,
    setError
  };
}
