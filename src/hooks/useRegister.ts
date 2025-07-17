
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RegisterFormData } from "@/types/auth";
import { cleanAndValidateUserData, determineUserRole, processEmailForSupabase } from "@/utils/authHelpers";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    // Validazione campi base
    if (!data.nome || !data.cognome || !data.email || !data.password || !data.nomeUtente) {
      const missingFields = [];
      if (!data.nome) missingFields.push("Nome");
      if (!data.cognome) missingFields.push("Cognome");
      if (!data.email) missingFields.push("Email");
      if (!data.password) missingFields.push("Password");
      if (!data.nomeUtente) missingFields.push("Nome utente");
      const errorMsg = `Campi mancanti: ${missingFields.join(", ")}`;
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Inizio registrazione per:", data.email);

      // Determina il ruolo basato sull'email ORIGINALE
      const ruolo = determineUserRole(data.email);
      console.log("👤 Ruolo assegnato:", ruolo);

      // Processa l'email: rimuove ".admin" se presente
      const emailPerSupabase = processEmailForSupabase(data.email);
      console.log("📧 Email processata per Supabase:", emailPerSupabase);

      // Determina il redirect URL corretto per la conferma email
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/email-confirmed`;
      
      console.log("🔗 Redirect URL:", redirectUrl);

      // FASE 1: Registra l'utente in auth con display_name
      console.log("📝 FASE 1: Registrazione utente in auth...");
      const { data: signupData, error: signupErr } = await supabase.auth.signUp({
        email: emailPerSupabase,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: data.nomeUtente,
            full_name: `${data.nome} ${data.cognome}`,
            nome: data.nome,
            cognome: data.cognome,
            nome_utente: data.nomeUtente,
            numero_telefono: data.numeroTelefono || '',
            role: ruolo
          }
        }
      });

      if (signupErr) throw signupErr;
      if (!signupData.user?.id) {
        throw new Error("Registrazione fallita: nessun ID utente ricevuto");
      }

      console.log("✅ Utente auth creato con UID:", signupData.user.id);

      // Ora il profilo viene creato automaticamente dal trigger Supabase. Nessun salvataggio manuale necessario.
      console.log("🎉 Registrazione completata con successo!");
      

      toast({
        title: "Registrazione completata!",
        description: `Benvenuto ${data.nome}! Controlla la tua email per confermare l'account.`,
      });

      // Reindirizza alla pagina di attesa conferma email
      setTimeout(() => {
        window.location.replace("/email-confirmation");
      }, 2000);

    } catch (error: any) {
      console.error("💥 Errore registrazione:", error);
      const errorMessage = error?.message ?? "Errore sconosciuto durante la registrazione";
      setError(`Errore durante la registrazione: ${errorMessage}`);
      toast({
        title: "Errore durante la registrazione",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return {
    loading,
    error,
    handleRegister,
    setError
  };
}
