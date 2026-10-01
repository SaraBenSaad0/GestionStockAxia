import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, ShoppingCart, Package } from "lucide-react";
import api from "../services/api";

const RANGES = [{ key: "1", label: "Ce mois", n: 1 }, { key: "6", label: "6 derniers mois", n: 6 }, { key: "12", label: "Cette année (12 mois)", n: 12 }];

function Statistiques() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState("6");

  useEffect(() => { api.get("/data/stats").then(r => setD(r.data)).catch(() => setError("Impossible de charger les statistiques.")); }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!d) return <div className="loading">Chargement des statistiques...</div>;

  const n = RANGES.find(r => r.key === range).n;
  const period = d.historique.slice(-n);
  const max = Math.max(...period.map(x => Number(x.montant)), 1);
  const totalCommandes = period.reduce((s, x) => s + x.commandes, 0);
  const totalMontant = period.reduce((s, x) => s + Number(x.montant), 0);

  return (
    <div>
      <div className="page-header"><div><h1>Statistiques</h1><p>Comparaison du mois actuel, du mois précédent et historique des commandes</p></div><BarChart3 size={28} /></div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon"><ShoppingCart size={25} /></div><div><span>Commandes — mois actuel</span><strong>{d.commandesMoisActuel}</strong><small>{d.moisActuel}</small></div></div>
        <div className="stat-card"><div className="stat-icon"><ShoppingCart size={25} /></div><div><span>Commandes — mois précédent</span><strong>{d.commandesMoisPrecedent}</strong><small>{d.moisPrecedent}</small></div></div>
        <div className="stat-card"><div className="stat-icon"><TrendingUp size={25} /></div><div><span>Montant actuel</span><strong>{Number(d.montantMoisActuel).toFixed(2)} DT</strong><small>vs {Number(d.montantMoisPrecedent).toFixed(2)} DT le mois précédent</small></div></div>
        <div className="stat-card warning"><div className="stat-icon"><Package size={25} /></div><div><span>Stock faible</span><strong>{d.produitsStockFaible}</strong><small>Produits à surveiller</small></div></div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div><h3>Historique des commandes</h3><p>{totalCommandes} commande(s) — {totalMontant.toFixed(2)} DT sur la période sélectionnée</p></div>
          <div className="table-toolbar" style={{ margin: 0 }}>
            {RANGES.map(r => <button key={r.key} type="button" className={r.key === range ? "primary-button" : "secondary-button"} style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => setRange(r.key)}>{r.label}</button>)}
          </div>
        </div>
        <div className="stats-history">
          {period.map(x => (
            <div className="history-row" key={x.mois}>
              <div><strong>{x.mois}</strong><span>{x.commandes} commande(s)</span></div>
              <div className="history-bar"><div style={{ width: `${Math.max(2, Number(x.montant) / max * 100)}%` }} /></div>
              <strong>{Number(x.montant).toFixed(2)} DT</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Statistiques;
