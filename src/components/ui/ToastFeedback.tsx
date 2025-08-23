import { useToast } from '@/hooks/use-toast';

export function showToastFeedback(type: 'success' | 'error' | 'info', title: string, description?: string) {
  const { toast } = useToast();
  toast({
    title,
    description,
    variant: type === 'error' ? 'destructive' : 'default',
  });
}
