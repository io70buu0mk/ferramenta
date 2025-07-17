
export type LoginMethod = "email" | "phone";

export interface RegisterFormData {
  nome: string;
  cognome: string;
  email: string;
  nomeUtente: string;
  numeroTelefono: string;
  password: string;
}

export interface UserData {
  uid: string;
  email: string;
  nome: string;
  cognome: string;
  nomeUtente: string;
  numeroTelefono: string | null;
  ruolo: string;
}
