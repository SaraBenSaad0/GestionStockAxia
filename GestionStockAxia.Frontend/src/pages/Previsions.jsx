import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import api from "../services/api";

const TendanceIcon = ({ t }) => t === "hausse" ? <TrendingUp size={15} color="#e11d48" /> : t === "baisse" ? <TrendingDown size={15} color="#16a34a" /> : <Minus size={15} color="#9ca3af" />;

function Previsions() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/data/previsions").then(r => setData(r.data)).catch(() => setError("Impossible de charger les prévisions."));
  }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="loading">Calcul des prévisions...</div>;

  const filtered = data.produits.filter(p => `${p.reference} ${p.designation} ${p.categorieNom}`.toLowerCase().includes(search.toLowerCase()));
  const filteredVehicules = data.vehicules.filter(v => `${v.marque} ${v.modele}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Prévisions d'achat</h1><p>Estimation pour {data.moisPrevu}, basée sur les 3 derniers mois de commandes</p></div>
        <Sparkles size={28} />
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon"><Sparkles size={25} /></div><div><span>Quantité totale prévue</span><strong>{data.totalQuantitePrevue}</strong><small>unités, tous produits confondus</small></div></div>
        <div className="stat-card warning"><div className="stat-icon"><TrendingUp size={25} /></div><div><span>Achat recommandé</span><strong>{data.totalAchatRecommande}</strong><small>unités à commander ce mois-ci</small></div></div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div><h3>Détail par produit</h3><p>Triés par priorité d'achat — 50% du poids sur le mois dernier, 30% sur le mois précédent, 20% avant</p></div>
        </div>
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} produit(s) avec historique</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><Sparkles size={40} /><h3>Pas encore assez de données</h3><p>Les prévisions apparaîtront une fois que des commandes auront été passées.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Produit</th><th>Catégorie</th><th>Stock</th>
                  <th>Il y a 3 mois</th><th>Mois précédent</th><th>Mois dernier</th>
                  <th>Tendance</th><th>Prévu ce mois</th><th>À acheter</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.idProduit}>
                    <td><strong>{p.designation}</strong><br /><small style={{ color: "#9ca3af" }}>{p.reference}</small></td>
                    <td>{p.categorieNom}</td>
                    <td>{p.quantiteStock}</td>
                    <td>{p.quantiteMoisAnterieur}</td>
                    <td>{p.quantiteMoisPrecedent}</td>
                    <td>{p.quantiteMoisDernier}</td>
                    <td><TendanceIcon t={p.tendance} /></td>
                    <td><strong>{p.quantitePrevue}</strong></td>
                    <td>{p.achatRecommande > 0 ? <span className="status-badge danger">{p.achatRecommande}</span> : <span className="status-badge success">0</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div><h3>Véhicules — demande prévue</h3><p>{data.totalQuantitePrevueVehicules} unité(s) prévues ce mois-ci, tous véhicules confondus</p></div>
        </div>

        {filteredVehicules.length === 0 ? (
          <div className="empty-state"><Sparkles size={40} /><h3>Pas encore de commandes de véhicules</h3><p>Les prévisions apparaîtront une fois que des véhicules auront été commandés.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Véhicule</th><th>Années</th>
                  <th>Il y a 3 mois</th><th>Mois précédent</th><th>Mois dernier</th>
                  <th>Tendance</th><th>Prévu ce mois</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicules.map(v => (
                  <tr key={v.idVehicule}>
                    <td><strong>{v.marque} {v.modele}</strong></td>
                    <td>{v.anneeDebut} – {v.anneeFin}</td>
                    <td>{v.quantiteMoisAnterieur}</td>
                    <td>{v.quantiteMoisPrecedent}</td>
                    <td>{v.quantiteMoisDernier}</td>
                    <td><TendanceIcon t={v.tendance} /></td>
                    <td><strong>{v.quantitePrevue}</strong></td>
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

export default Previsions;
