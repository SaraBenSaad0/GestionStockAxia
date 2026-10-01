import { useEffect, useState } from "react";
import { Package, Car, Truck, ShoppingCart, AlertTriangle, Bell, LayoutDashboard } from "lucide-react";
import api from "../services/api";

const badgeClass = (s) => s === "Livrée" ? "status-badge success" : s === "Refusée" ? "status-badge danger" : "status-badge warning";

function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api.get("/data/dashboard").then(r => setD(r.data)).catch(() => setError("Impossible de charger le tableau de bord.")); }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!d) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <div className="page-header"><div><h1>Tableau de bord</h1><p>{d.role === "ADMIN" ? "Vue d'ensemble de l'activité AXIA" : "Vue d'ensemble de votre activité"}</p></div><LayoutDashboard size={28} /></div>

      {d.role === "ADMIN" ? (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><Package size={25} /></div><div><span>Produits</span><strong>{d.totalProduits}</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><Car size={25} /></div><div><span>Véhicules</span><strong>{d.totalVehicules}</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><Truck size={25} /></div><div><span>Fournisseurs</span><strong>{d.totalFournisseurs}</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><ShoppingCart size={25} /></div><div><span>Commandes</span><strong>{d.totalCommandes}</strong><small>{d.commandesEnAttente} en attente</small></div></div>
          <div className="stat-card warning"><div className="stat-icon"><AlertTriangle size={25} /></div><div><span>Stock faible</span><strong>{d.produitsStockFaible}</strong></div></div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon"><ShoppingCart size={25} /></div><div><span>Mes commandes</span><strong>{d.totalCommandes}</strong><small>{d.commandesEnAttente} en attente</small></div></div>
          <div className="stat-card"><div className="stat-icon"><Package size={25} /></div><div><span>Montant total</span><strong>{Number(d.montantTotal).toFixed(2)} DT</strong></div></div>
          <div className="stat-card"><div className="stat-icon"><Bell size={25} /></div><div><span>Notifications</span><strong>{d.notificationsNonLues}</strong><small>non lue(s)</small></div></div>
        </div>
      )}

      <div className="dashboard-card">
        <div className="card-header"><div><h3>Dernières commandes</h3></div></div>
        {d.dernieresCommandes.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={40} /><h3>Aucune commande</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th>{d.role === "ADMIN" && <th>Fournisseur</th>}<th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {d.dernieresCommandes.map(c => (
                  <tr key={c.idCommande}>
                    <td><strong>#{c.idCommande}</strong></td>
                    {d.role === "ADMIN" && <td>{c.fournisseurNom}</td>}
                    <td>{new Date(c.dateCommande).toLocaleDateString("fr-FR")}</td>
                    <td>{Number(c.montantTotal).toFixed(2)} DT</td>
                    <td><span className={badgeClass(c.statut)}>{c.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
