
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LoginMethod = "email" | "phone";

interface LoginFormProps {
  onLogin: (identifier: string, password: string, method: LoginMethod) => Promise<void>;
  onResetPassword: (email: string) => Promise<{success: boolean, error: string | null}>;
  loading: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, loading, error, onResetPassword }: LoginFormProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginIdentifier, password, loginMethod);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Errore",
        description: "Inserisci la tua email",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    const result = await onResetPassword(resetEmail);
    
    if (result.success) {
      toast({
        title: "Email inviata!",
        description: "Controlla la tua casella di posta per reimpostare la password",
      });
      setShowResetForm(false);
      setResetEmail("");
    } else {
      toast({
        title: "Errore",
        description: result.error || "Errore durante l'invio dell'email",
        variant: "destructive",
      });
    }
    setResetLoading(false);
  };

  if (showResetForm) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-antracite">Reimposta Password</h3>
          <p className="text-sm text-gray-600 mt-1">
            Inserisci la tua email per ricevere le istruzioni
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="resetEmail">Email</Label>
            <Input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="la-tua-email@esempio.com"
              required
              disabled={resetLoading}
            />
          </div>

          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-senape hover:bg-senape/90 text-antracite font-semibold"
              disabled={resetLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              {resetLoading ? "Invio..." : "Invia Email"}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowResetForm(false)}
              disabled={resetLoading}
            >
              Torna al Login
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Metodo di login */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => setLoginMethod("email")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
            loginMethod === "email" 
              ? "bg-white text-antracite shadow-sm" 
              : "text-gray-600"
          }`}
        >
          Email/Username
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod("phone")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
            loginMethod === "phone" 
              ? "bg-white text-antracite shadow-sm" 
              : "text-gray-600"
          }`}
        >
          Telefono
        </button>
      </div>

      <div>
        <Label htmlFor="loginIdentifier">
          {loginMethod === "phone" ? "Numero di telefono" : "Email o Nome utente"}
        </Label>
        <Input
          id="loginIdentifier"
          type={loginMethod === "phone" ? "tel" : "text"}
          value={loginIdentifier}
          onChange={(e) => setLoginIdentifier(e.target.value)}
          placeholder={
            loginMethod === "phone" 
              ? "+39 123 456 7890" 
              : "email@esempio.com o nomeutente"
          }
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Button 
          type="submit" 
          className="w-full bg-senape hover:bg-senape/90 text-antracite font-semibold"
          disabled={loading}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loading ? "Accesso..." : "Accedi"}
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full text-sm text-gray-600 hover:text-antracite"
          onClick={() => setShowResetForm(true)}
          disabled={loading}
        >
          Password dimenticata?
        </Button>
      </div>
    </form>
  );
}
