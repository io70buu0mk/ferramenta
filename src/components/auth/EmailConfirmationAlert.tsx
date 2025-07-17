
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";

interface EmailConfirmationAlertProps {
  userId: string;
}

export default function EmailConfirmationAlert({ userId }: EmailConfirmationAlertProps) {
  const { isEmailConfirmed, daysRemaining, loading, resendConfirmationEmail } = useEmailConfirmation(userId);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (loading || isEmailConfirmed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);
    
    const result = await resendConfirmationEmail();
    
    if (result.success) {
      setResendMessage("Email di conferma inviata con successo!");
    } else {
      setResendMessage(`Errore: ${result.error}`);
    }
    
    setIsResending(false);
  };

  const getAlertVariant = () => {
    if (daysRemaining <= 3) return "destructive";
    return "default";
  };

  const getUrgencyText = () => {
    if (daysRemaining === 0) return "oggi";
    if (daysRemaining === 1) return "entro domani";
    return `entro ${daysRemaining} giorni`;
  };

  return (
    <Alert variant={getAlertVariant()} className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Mail size={16} />
        Conferma la tua email
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Devi confermare la tua email <strong>{getUrgencyText()}</strong> altrimenti 
          il tuo account verrà chiuso e perderai tutti i dati.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleResendEmail}
            disabled={isResending}
            size="sm"
            variant={daysRemaining <= 3 ? "destructive" : "default"}
          >
            {isResending ? "Invio..." : "Reinvia email di conferma"}
          </Button>
        </div>
        
        {resendMessage && (
          <p className={`mt-2 text-sm ${resendMessage.includes("successo") ? "text-green-600" : "text-red-600"}`}>
            {resendMessage}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
