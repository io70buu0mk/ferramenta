
import { RegisterFormData, UserData } from "@/types/auth";

export const cleanAndValidateUserData = (uid: string, formData: RegisterFormData, ruolo: string): UserData | null => {
  // Pulizia e validazione dei dati dal form
  const cleanData: UserData = {
    uid: uid.trim(),
    email: formData.email.trim().toLowerCase(),
    nome: formData.nome.trim(),
    cognome: formData.cognome.trim(),
    nomeUtente: formData.nomeUtente.trim(),
    numeroTelefono: formData.numeroTelefono?.trim() || null,
    ruolo: ruolo
  };

  // Validazione campi obbligatori
  if (!cleanData.uid || !cleanData.email || !cleanData.nome || !cleanData.cognome || !cleanData.nomeUtente) {
    return null;
  }

  return cleanData;
};

export const determineUserRole = (email: string): string => {
  return email.includes(".admin@") ? "amministratore" : "cliente";
};

export const processEmailForSupabase = (email: string): string => {
  return email.replace(".admin@", "@");
};
