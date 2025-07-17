
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useEmailConfirmation(userId?: string) {
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(true);
  const [daysRemaining, setDaysRemaining] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    checkEmailConfirmationStatus();
  }, [userId]);

  const checkEmailConfirmationStatus = async () => {
    try {
      // Ottieni le informazioni dell'utente corrente
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setLoading(false);
        return;
      }

      // Controlla se l'email è confermata
      const emailConfirmed = user.email_confirmed_at !== null;
      setIsEmailConfirmed(emailConfirmed);

      if (!emailConfirmed && user.created_at) {
        // Calcola i giorni rimanenti
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, 30 - daysPassed);
        setDaysRemaining(remaining);
      }

    } catch (error) {
      console.error("Errore nel controllo conferma email:", error);
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await supabase.auth.getUser()).data.user?.email || ''
      });

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    isEmailConfirmed,
    daysRemaining,
    loading,
    resendConfirmationEmail,
    refreshStatus: checkEmailConfirmationStatus
  };
}
