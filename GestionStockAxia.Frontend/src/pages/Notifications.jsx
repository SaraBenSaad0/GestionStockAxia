import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/data/notifications").then(r => setNotifications(r.data)).catch(() => setError("Impossible de charger les notifications.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (id) => {
    try { await api.put(`/data/notifications/${id}/lue`); setNotifications(ns => ns.map(n => n.idNotification === id ? { ...n, lue: true } : n)); }
    catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try { await api.put("/data/notifications/lire-tout"); setNotifications(ns => ns.map(n => ({ ...n, lue: true }))); }
    catch { /* ignore */ }
  };

  const nonLues = notifications.filter(n => !n.lue).length;

  return (
    <div>
      <div className="page-header">
        <div><h1>Notifications</h1><p>{nonLues > 0 ? `${nonLues} notification(s) non lue(s)` : "Vous êtes à jour"}</p></div>
        {nonLues > 0 && <button className="secondary-button" onClick={markAllRead}><CheckCheck size={18} style={{ marginRight: 6, verticalAlign: -3 }} />Tout marquer comme lu</button>}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-card">
        {loading ? <div className="loading">Chargement...</div> : notifications.length === 0 ? (
          <div className="empty-state"><Bell size={40} /><h3>Aucune notification</h3><p>Vous serez averti ici des nouveautés importantes.</p></div>
        ) : (
          <div className="notification-list">
            {notifications.map(n => (
              <div key={n.idNotification} className={n.lue ? "notification-item" : "notification-item unread"} onClick={() => !n.lue && markRead(n.idNotification)} style={{ cursor: n.lue ? "default" : "pointer" }}>
                <div className="notification-icon"><Bell size={18} /></div>
                <div className="notification-content">
                  <strong>{n.typeNotification === "STOCK" ? "Stock faible" : n.typeNotification === "COMMANDE" ? "Commande" : "Notification"}</strong>
                  <p>{n.message}</p>
                  <small>{new Date(n.dateEnvoi).toLocaleString("fr-FR")}</small>
                </div>
                {!n.lue && <div className="notification-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
