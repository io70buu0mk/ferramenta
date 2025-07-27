
import { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface Props {
  userId: string;
  onClose: () => void;
}

const Notifications = ({ userId, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<string>("sistema");
  const { notifications, loading, markAsRead, refetch } = useNotifications();
  const [displayed, setDisplayed] = useState<any[]>([]);
  const prevNotifications = useRef<any[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);

  // Polling ogni secondo, aggiorna solo se cambiano i dati
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetch = async () => {
      await refetch(userId);
      setFirstLoad(false);
    };
    fetch();
    interval = setInterval(fetch, 1000);
    return () => clearInterval(interval);
  }, [userId, refetch]);

  // Aggiorna solo se le notifiche sono cambiate (evita flicker)
  useEffect(() => {
    const prev = JSON.stringify(prevNotifications.current);
    const next = JSON.stringify(notifications);
    if (prev !== next) {
      setDisplayed(notifications);
      prevNotifications.current = notifications;
    }
    // Se uguali, non aggiorna lo stato (evita scatti)
  }, [notifications]);

  // Log delle notifiche caricate
  console.log('[DEBUG] Notifiche caricate:', notifications);

  // Raggruppa le notifiche per notification_id
  const notificationIdCount: Record<string, number> = {};
  displayed.forEach(n => {
    notificationIdCount[n.notification_id] = (notificationIdCount[n.notification_id] || 0) + 1;
  });

  // Filtra notifiche di sistema/personali
  let filtered: typeof displayed = [];
  if (activeTab === "sistema") {
    // Notifiche di sistema: notification_id presente per più utenti (>=2)
    filtered = displayed.filter(n => notificationIdCount[n.notification_id] > 1);
  } else {
    // Notifiche personali: notification_id presente solo per questo utente
    filtered = displayed.filter(n => notificationIdCount[n.notification_id] === 1);
  }
  // Se il filtro è vuoto, mostra tutte le notifiche per debug
  const toShow = filtered.length > 0 ? filtered : displayed;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto p-8 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <div className="flex gap-4 mb-4">
          <button
            className={`px-3 py-1 rounded ${activeTab === "sistema" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("sistema")}
          >
            Sistema
          </button>
          <button
            className={`px-3 py-1 rounded ${activeTab === "personale" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("personale")}
          >
            Personale
          </button>
        </div>
        {firstLoad && loading ? (
          <div className="text-center py-8">Caricamento...</div>
        ) : toShow.length === 0 ? (
          <div className="text-center py-8">Nessuna notifica</div>
        ) : (
          <ul>
            {toShow.map(n => (
              <li key={n.id} className={`mb-3 p-3 rounded border ${n.is_read ? "bg-gray-100" : "bg-yellow-50 border-yellow-300"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{n.title}</strong>
                    <div className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.is_read && (
                    <button className="text-xs text-blue-600" onClick={() => markAsRead(n.id)}>Segna come letto</button>
                  )}
                </div>
                <div className="mt-2 text-gray-700">{n.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
