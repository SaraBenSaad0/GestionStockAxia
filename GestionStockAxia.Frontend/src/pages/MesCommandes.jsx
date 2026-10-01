import { useEffect, useState } from "react";
import { Plus, ShoppingCart, X, Trash2 } from "lucide-react";
import api from "../services/api";

const badgeClass = (s) => s === "Livrée" ? "status-badge success" : s === "Refusée" ? "status-badge danger" : "status-badge warning";

function MesCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [lignes, setLignes] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/data/commandes/mes-commandes"), api.get("/data/produits"), api.get("/data/vehicules")])
      .then(([c, p, v]) => { setCommandes(c.data); setProduits(p.data); setVehicules(v.data); })
      .catch(() => setError("Impossible de charger vos commandes."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openForm = () => { setLignes([{ type: "PRODUIT", id: produits[0]?.idProduit || "", quantite: 1 }]); setShowForm(true); };
  const addLigne = () => setLignes([...lignes, { type: "PRODUIT", id: produits[0]?.idProduit || "", quantite: 1 }]);
  const removeLigne = (i) => setLignes(lignes.filter((_, idx) => idx !== i));
  const updateLigne = (i, field, value) => setLignes(lignes.map((l, idx) => {
    if (idx !== i) return l;
    if (field === "type") return { ...l, type: value, id: value === "PRODUIT" ? (produits[0]?.idProduit || "") : (vehicules[0]?.idVehicule || "") };
    return { ...l, [field]: value };
  }));

  const prixDe = (l) => l.type === "PRODUIT"
    ? (produits.find(p => p.idProduit === Number(l.id))?.prixUnitaire || 0)
    : (vehicules.find(v => v.idVehicule === Number(l.id))?.prixUnitaire || 0);

  const total = lignes.reduce((sum, l) => sum + prixDe(l) * Number(l.quantite || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        lignes: lignes.map(l => ({
          idProduit: l.type === "PRODUIT" ? Number(l.id) : null,
          idVehicule: l.type === "VEHICULE" ? Number(l.id) : null,
          quantite: Number(l.quantite),
        })),
      };
      await api.post("/data/commandes", payload);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de la commande."); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Mes commandes</h1><p>Passez et suivez vos commandes de produits et de véhicules auprès d'AXIA</p></div>
        <button className="primary-button category-add-button" onClick={openForm}><Plus size={18} />Nouvelle commande</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>Nouvelle commande</h3><p>Choisissez des produits et/ou des véhicules, avec leurs quantités</p></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            {lignes.map((l, i) => (
              <div className="form-row" key={i}>
                <div className="form-group">
                  <label>Type</label>
                  <select value={l.type} onChange={e => updateLigne(i, "type", e.target.value)}>
                    <option value="PRODUIT">Produit</option>
                    <option value="VEHICULE">Véhicule</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{l.type === "PRODUIT" ? "Produit" : "Véhicule"}</label>
                  {l.type === "PRODUIT" ? (
                    <select value={l.id} onChange={e => updateLigne(i, "id", e.target.value)} required>
                      {produits.map(p => <option key={p.idProduit} value={p.idProduit}>{p.designation} — {Number(p.prixUnitaire).toFixed(2)} DT</option>)}
                    </select>
                  ) : (
                    <select value={l.id} onChange={e => updateLigne(i, "id", e.target.value)} required>
                      {vehicules.map(v => <option key={v.idVehicule} value={v.idVehicule}>{v.marque} {v.modele} ({v.anneeDebut}-{v.anneeFin}) — {Number(v.prixUnitaire).toFixed(2)} DT</option>)}
                    </select>
                  )}
                </div>
                <div className="form-group"><label>Quantité</label><input type="number" min="1" value={l.quantite} onChange={e => updateLigne(i, "quantite", e.target.value)} required /></div>
                {lignes.length > 1 && <button type="button" className="icon-button delete" onClick={() => removeLigne(i)} style={{ marginTop: 22 }}><Trash2 size={17} /></button>}
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={addLigne} style={{ marginBottom: 18 }}>+ Ajouter une ligne</button>
            <p style={{ marginBottom: 14, fontWeight: "bold" }}>Total estimé : {total.toFixed(2)} DT</p>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Envoi..." : "Passer la commande"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar"><span>{commandes.length} commande(s)</span></div>
        {loading ? <div className="loading">Chargement...</div> : commandes.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={40} /><h3>Aucune commande</h3><p>Passez votre première commande auprès d'AXIA.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Date</th><th>Détail</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {commandes.map(c => (
                  <tr key={c.idCommande}>
                    <td><strong>#{c.idCommande}</strong></td>
                    <td>{new Date(c.dateCommande).toLocaleDateString("fr-FR")}</td>
                    <td>{c.lignes.map(l => `${l.nom} x${l.quantite}`).join(", ")}</td>
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

export default MesCommandes;
