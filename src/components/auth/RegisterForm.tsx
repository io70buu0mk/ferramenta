
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface RegisterFormData {
  nome: string;
  cognome: string;
  email: string;
  nomeUtente: string;
  numeroTelefono: string;
  password: string;
}

interface RegisterFormProps {
  onRegister: (data: RegisterFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function RegisterForm({ onRegister, loading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: "",
    cognome: "",
    email: "",
    nomeUtente: "",
    numeroTelefono: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegister(formData);
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange("nome", e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="cognome">Cognome *</Label>
          <Input
            id="cognome"
            value={formData.cognome}
            onChange={(e) => handleInputChange("cognome", e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="nomeUtente">Nome utente *</Label>
        <Input
          id="nomeUtente"
          value={formData.nomeUtente}
          onChange={(e) => handleInputChange("nomeUtente", e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="numeroTelefono">Numero di telefono</Label>
        <Input
          id="numeroTelefono"
          type="tel"
          value={formData.numeroTelefono}
          onChange={(e) => handleInputChange("numeroTelefono", e.target.value)}
          placeholder="+39 123 456 7890"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-senape hover:bg-senape/90 text-antracite font-semibold"
        disabled={loading}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? "Registrazione..." : "Registrati"}
      </Button>
    </form>
  );
}
