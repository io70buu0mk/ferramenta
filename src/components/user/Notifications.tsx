
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
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
      <div className="bg-white rounded-3xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto p-0 relative border border-[#f8e8e3]">
        {/* Testata */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#f8e8e3] bg-gradient-to-br from-[#f8e8e3] to-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Bell size={28} className="text-[#b43434]" />
            <span className="text-xl font-bold text-[#b43434]">Notifiche</span>
          </div>
          <button className="text-2xl text-[#b43434] hover:bg-[#f8e8e3] rounded-full w-10 h-10 flex items-center justify-center transition" onClick={onClose} title="Chiudi">×</button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-8 pt-5 pb-2">
          <button
            className={`px-4 py-1 rounded-full font-semibold transition ${activeTab === "sistema" ? "bg-[#b43434] text-white shadow" : "bg-neutral-100 text-[#b43434] hover:bg-neutral-200"}`}
            onClick={() => setActiveTab("sistema")}
          >
            Sistema
          </button>
          <button
            className={`px-4 py-1 rounded-full font-semibold transition ${activeTab === "personale" ? "bg-[#b43434] text-white shadow" : "bg-neutral-100 text-[#b43434] hover:bg-neutral-200"}`}
            onClick={() => setActiveTab("personale")}
          >
            Personale
          </button>
        </div>
        {/* Corpo notifiche */}
        <div className="px-8 pb-8 pt-2">
          {firstLoad && loading ? (
            <div className="text-center py-12 text-[#b43434] font-semibold">Caricamento...</div>
          ) : toShow.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">Nessuna notifica</div>
          ) : (
            <ul>
              {toShow.map(n => (
                <li key={n.id} className={`mb-5 p-5 rounded-2xl border shadow-sm transition flex flex-col gap-2 ${n.is_read ? "bg-neutral-50 border-neutral-200" : "bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200"}`}>
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#b43434] text-base flex items-center gap-2">
                        {n.title}
                        {!n.is_read && <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-900 text-xs font-bold">NUOVA</span>}
                      </span>
                      <span className="text-xs text-neutral-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    {!n.is_read && (
                      <button className="text-xs text-[#b43434] border border-[#b43434] rounded px-3 py-1 hover:bg-[#f8e8e3] transition font-semibold" onClick={() => markAsRead(n.id)}>Segna come letto</button>
                    )}
                  </div>
                  <div className="text-neutral-700 text-sm mt-1 whitespace-pre-line">{n.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
