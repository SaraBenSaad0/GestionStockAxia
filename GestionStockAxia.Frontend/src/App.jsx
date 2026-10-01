import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main pages
import Dashboard from "./pages/Dashboard";
import Utilisateurs from "./pages/Utilisateurs";
import Categories from "./pages/Categories";
import Produits from "./pages/Produits";
import Vehicules from "./pages/Vehicules";
import Fournisseurs from "./pages/Fournisseurs";
import Commandes from "./pages/Commandes";
import Notifications from "./pages/Notifications";
import Statistiques from "./pages/Statistiques";
import Previsions from "./pages/Previsions";

// Fournisseur pages
import MesCommandes from "./pages/MesCommandes";
import MonProfil from "./pages/MonProfil";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            AUTHENTIFICATION
        ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            APPLICATION PRINCIPALE
        ====================================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* / → /dashboard */}
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* =================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "FOURNISSEUR"]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />


          {/* =================================================
              ADMIN UNIQUEMENT
          ================================================== */}

          <Route
            path="utilisateurs"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Utilisateurs />
              </ProtectedRoute>
            }
          />

          <Route
            path="categories"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Categories />
              </ProtectedRoute>
            }
          />

          <Route
            path="produits"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Produits />
              </ProtectedRoute>
            }
          />

          <Route
            path="vehicules"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Vehicules />
              </ProtectedRoute>
            }
          />

          <Route
            path="fournisseurs"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Fournisseurs />
              </ProtectedRoute>
            }
          />

          <Route
            path="commandes"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Commandes />
              </ProtectedRoute>
            }
          />

          <Route
            path="statistiques"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Statistiques />
              </ProtectedRoute>
            }
          />

          <Route
            path="previsions"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN"]}
              >
                <Previsions />
              </ProtectedRoute>
            }
          />


          {/* =================================================
              NOTIFICATIONS
              ADMIN + FOURNISSEUR
          ================================================== */}

          <Route
            path="notifications"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "FOURNISSEUR"]}
              >
                <Notifications />
              </ProtectedRoute>
            }
          />


          {/* =================================================
              FOURNISSEUR UNIQUEMENT
          ================================================== */}

          <Route
            path="mes-commandes"
            element={
              <ProtectedRoute
                allowedRoles={["FOURNISSEUR"]}
              >
                <MesCommandes />
              </ProtectedRoute>
            }
          />

          <Route
            path="mon-profil"
            element={
              <ProtectedRoute
                allowedRoles={["FOURNISSEUR"]}
              >
                <MonProfil />
              </ProtectedRoute>
            }
          />

        </Route>


        {/* =====================================================
            ROUTE INCONNUE
        ====================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;