import { Bell, Search, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function Header() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get("/data/notifications/non-lues-count").then(r => setUnread(r.data.count)).catch(() => {});
  }, []);

  // Get the connected user
  const storedUser = localStorage.getItem("gestionStockUser");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Erreur lecture utilisateur :", error);
  }

  // User information
  const firstName = user?.prenom || "";
  const lastName = user?.nom || "";
  const role = user?.typeUtilisateur || "";

  // Display role in French
  const roleLabel =
    role === "ADMIN"
      ? "Administrateur"
      : role === "FOURNISSEUR"
      ? "Fournisseur"
      : "Utilisateur";

  // Display name
  const fullName =
    `${firstName} ${lastName}`.trim() || "Utilisateur";

  // Notifications
  const handleNotifications = () => {
    navigate("/notifications");
  };

  return (
    <header className="header">

      {/* =========================
          SEARCH
      ========================= */}

      <div className="header-search">

        <Search size={19} />

        <input
          type="text"
          placeholder="Rechercher..."
        />

      </div>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="header-right">

        {/* NOTIFICATIONS */}

        <button
          className="notification-button"
          onClick={handleNotifications}
          title="Notifications"
        >

          <Bell size={21} />

          {/* Live unread count */}
          {unread > 0 && <span className="notification-badge">{unread}</span>}

        </button>


        {/* USER */}

        <div className="user-profile">

          <UserCircle size={38} />

          <div>

            <strong>
              {fullName}
            </strong>

            <span>
              {roleLabel}
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Header;