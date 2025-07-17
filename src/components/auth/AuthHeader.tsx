
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface AuthHeaderProps {
  isLogin: boolean;
}

export default function AuthHeader({ isLogin }: AuthHeaderProps) {
  return (
    <CardHeader className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <a 
          href="/"
          className="text-cemento hover:text-antracite transition-colors"
          title="Torna alla home"
        >
          <ArrowLeft size={24} />
        </a>
        <h1 className="text-2xl font-oswald font-bold text-antracite tracking-wide">
          Ferramenta Lucini
        </h1>
      </div>
      <CardTitle className="text-xl text-antracite">
        {isLogin ? "Accedi al tuo account" : "Crea un nuovo account"}
      </CardTitle>
      <CardDescription>
        {isLogin 
          ? "Inserisci le tue credenziali per accedere"
          : "Compila i dati per registrarti"
        }
      </CardDescription>
    </CardHeader>
  );
}
