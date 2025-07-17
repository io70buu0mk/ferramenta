import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminStats = {
  totalUsers: number;
  totalProducts: number;
  unreadMessages: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    unreadMessages: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Conta utenti totali
      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Conta prodotti totali
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Conta messaggi non letti
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Attività recenti (ultimi utenti registrati)
      const { data: recentUsers } = await supabase
        .from('user_profiles')
        .select('nome, cognome, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Prodotti aggiunti di recente
      const { data: recentProducts } = await supabase
        .from('products')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      const activities = [
        ...(recentUsers || []).map(user => ({
          id: `user-${user.created_at}`,
          type: 'user',
          description: `Nuovo utente registrato: ${user.nome} ${user.cognome}`,
          timestamp: user.created_at
        })),
        ...(recentProducts || []).map(product => ({
          id: `product-${product.created_at}`,
          type: 'product',
          description: `Nuovo prodotto aggiunto: ${product.name}`,
          timestamp: product.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        unreadMessages: unreadCount || 0,
        recentActivities: activities
      });

    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
}