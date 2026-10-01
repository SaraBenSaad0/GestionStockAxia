import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Tags,
  Package,
  Car,
  Truck,
  ShoppingCart,
  Bell,
  UserCircle,
  LogOut,
  BarChart3,
  Sparkles,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  // Get the currently connected user
  const storedUser = localStorage.getItem("gestionStockUser");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Erreur lecture utilisateur :", error);
    user = null;
  }

  const role = user?.typeUtilisateur;

  // -----------------------------
  // MENU ADMIN
  // -----------------------------

  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Utilisateurs",
      path: "/utilisateurs",
      icon: Users,
    },
    {
      name: "Catégories",
      path: "/categories",
      icon: Tags,
    },
    {
      name: "Produits",
      path: "/produits",
      icon: Package,
    },
    {
      name: "Véhicules",
      path: "/vehicules",
      icon: Car,
    },
    {
      name: "Fournisseurs",
      path: "/fournisseurs",
      icon: Truck,
    },
    {
      name: "Commandes",
      path: "/commandes",
      icon: ShoppingCart,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      name: "Statistiques",
      path: "/statistiques",
      icon: BarChart3,
    },
    {
      name: "Prévisions",
      path: "/previsions",
      icon: Sparkles,
    },
  ];

  // -----------------------------
  // MENU FOURNISSEUR
  // -----------------------------

  const fournisseurMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Mes commandes",
      path: "/mes-commandes",
      icon: ShoppingCart,
    },
    {
      name: "Mes notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      name: "Mon profil",
      path: "/mon-profil",
      icon: UserCircle,
    },
  ];

  // Choose menu according to role
  const menuItems =
    role === "ADMIN"
      ? adminMenuItems
      : fournisseurMenuItems;

  // -----------------------------
  // LOGOUT
  // -----------------------------

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment vous déconnecter ?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem("gestionStockUser");
    localStorage.removeItem("gestionStockToken");

    navigate("/login");
  };

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">

        <div className="logo-icon">
          A
        </div>

        <div>
          <h2>GestionStock</h2>
          <span>AXIA</span>
        </div>

      </div>

      {/* MENU TITLE */}
      <div className="sidebar-section-title">
        MENU PRINCIPAL
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              <Icon size={20} />

              <span>
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* LOGOUT */}
      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={20} />

          <span>
            Déconnexion
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;