import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AdvancedAnalytics() {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Caricamento analytics...
      </div>
    );
  }

  const getHealthColor = (value: number) => {
    if (value >= 95) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (value: number) => {
    if (value >= 95) return <CheckCircle size={16} className="text-green-600" />;
    if (value >= 80) return <AlertTriangle size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Metriche principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <Users size={16} />
              Crescita Utenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">
              +{analytics.userGrowth.reduce((sum, day) => sum + day.newUsers, 0)}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} />
              Ultimi 7 giorni
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <MessageSquare size={16} />
              Messaggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">
              {analytics.messageStats.totalMessages}
            </div>
            <p className="text-xs text-amber-600">
              {analytics.messageStats.unreadMessages} non letti
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <Activity size={16} />
              Tempo Risposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-800">
              {analytics.messageStats.responseTime.toFixed(1)}h
            </div>
            <p className="text-xs text-green-600">Media giornaliera</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici e statistiche dettagliate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Crescita utenti */}
        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Crescita Utenti (7 giorni)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.userGrowth.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-800">
                        {new Date(day.date).toLocaleDateString('it-IT', { 
                          weekday: 'short', 
                          day: 'numeric',
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {day.newUsers} nuovi utenti
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Totale: {day.users}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiche prodotti */}
        <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Prodotti per Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.productStats.length > 0 ? (
                analytics.productStats.map((stat) => (
                  <div key={stat.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-800">
                        {stat.category}
                      </span>
                      <span className="text-sm text-neutral-600">
                        {stat.count} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <BarChart3 size={40} className="mx-auto mb-4 text-neutral-300" />
                  <p className="text-sm">Nessun dato disponibile</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stato del sistema */}
      <Card className="bg-white/80 backdrop-blur-sm border border-neutral-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Stato del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getHealthIcon(analytics.systemHealth.uptime)}
                <span className="font-semibold">Uptime</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(analytics.systemHealth.uptime)}`}>
                {analytics.systemHealth.uptime}%
              </div>
              <p className="text-xs text-neutral-600">Disponibilità sistema</p>
            </div>

            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getHealthIcon(analytics.systemHealth.performance)}
                <span className="font-semibold">Performance</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthColor(analytics.systemHealth.performance)}`}>
                {analytics.systemHealth.performance.toFixed(1)}%
              </div>
              <p className="text-xs text-neutral-600">Prestazioni medie</p>
            </div>

            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle size={16} className="text-red-600" />
                <span className="font-semibold">Errori</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {analytics.systemHealth.errors}
              </div>
              <p className="text-xs text-neutral-600">Ultimi 24h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}