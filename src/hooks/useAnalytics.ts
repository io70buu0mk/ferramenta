import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AnalyticsData = {
  userGrowth: Array<{
    date: string;
    users: number;
    newUsers: number;
  }>;
  productStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  messageStats: {
    totalMessages: number;
    unreadMessages: number;
    responseTime: number;
  };
  systemHealth: {
    uptime: number;
    performance: number;
    errors: number;
  };
};

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    productStats: [],
    messageStats: {
      totalMessages: 0,
      unreadMessages: 0,
      responseTime: 0
    },
    systemHealth: {
      uptime: 99.9,
      performance: 95,
      errors: 2
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Analisi crescita utenti (ultimi 7 giorni)
      const { data: users } = await supabase
        .from('user_profiles')
        .select('created_at')
        .order('created_at', { ascending: false });

      // Statistiche prodotti per categoria
      const { data: products } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      // Statistiche messaggi
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Genera dati per crescita utenti (ultimi 7 giorni)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const userGrowth = last7Days.map(date => {
        const usersOnDate = users?.filter(user => 
          user.created_at.split('T')[0] <= date
        ).length || 0;
        
        const newUsersOnDate = users?.filter(user => 
          user.created_at.split('T')[0] === date
        ).length || 0;

        return {
          date,
          users: usersOnDate,
          newUsers: newUsersOnDate
        };
      });

      // Statistiche prodotti per categoria
      const categoryStats = products?.reduce((acc: Record<string, number>, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalProducts = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
      const productStats = Object.entries(categoryStats).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalProducts) * 100)
      }));

      setAnalytics({
        userGrowth,
        productStats,
        messageStats: {
          totalMessages: totalMessages || 0,
          unreadMessages: unreadMessages || 0,
          responseTime: Math.random() * 10 + 5 // Simulated response time
        },
        systemHealth: {
          uptime: 99.9,
          performance: Math.random() * 10 + 90,
          errors: Math.floor(Math.random() * 5)
        }
      });

    } catch (error) {
      console.error('Errore caricamento analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    refetch: fetchAnalytics
  };
}