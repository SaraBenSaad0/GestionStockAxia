import { useEffect, useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import api from "../services/api";

const STATUTS = ["En attente", "Validée", "Refusée", "Livrée"];
const badgeClass = (s) => s === "Livrée" ? "status-badge success" : s === "Refusée" ? "status-badge danger" : "status-badge warning";

function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/data/commandes").then(r => setCommandes(r.data)).catch(() => setError("Impossible de charger les commandes.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changerStatut = async (id, statut) => {
    try {
      await api.put(`/data/commandes/${id}/statut`, { statut });
      setCommandes(cs => cs.map(c => c.idCommande === id ? { ...c, statut } : c));
    } catch { setError("Impossible de mettre à jour le statut."); }
  };

  const filtered = commandes.filter(c => `${c.fournisseurNom} ${c.statut}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Commandes</h1><p>Suivi des commandes passées par les fournisseurs</p></div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher une commande..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} commande(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={40} /><h3>Aucune commande</h3><p>Les commandes passées par vos fournisseurs apparaîtront ici.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Fournisseur</th><th>Date</th><th>Lignes</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.idCommande}>
                    <td><strong>#{c.idCommande}</strong></td>
                    <td>{c.fournisseurNom}</td>
                    <td>{new Date(c.dateCommande).toLocaleDateString("fr-FR")}</td>
                    <td>{c.nombreLignes}</td>
                    <td>{Number(c.montantTotal).toFixed(2)} DT</td>
                    <td>
                      <select className={badgeClass(c.statut)} style={{ border: "none", cursor: "pointer" }} value={c.statut} onChange={e => changerStatut(c.idCommande, e.target.value)}>
                        {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
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

export default Commandes;
