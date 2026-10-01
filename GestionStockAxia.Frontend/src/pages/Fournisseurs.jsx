import { useEffect, useState } from "react";
import { Plus, Trash2, Truck, Search, X } from "lucide-react";
import api from "../services/api";

function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/data/fournisseurs").then(r => setFournisseurs(r.data)).catch(() => setError("Impossible de charger les fournisseurs.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm({ nom: "", prenom: "", email: "", motDePasse: "" }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.post("/Utilisateurs", { ...form, typeUtilisateur: "FOURNISSEUR" });
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de la création."); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce fournisseur ? Son compte sera définitivement supprimé.")) return;
    try { await api.delete(`/Utilisateurs/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Impossible de supprimer ce fournisseur (des commandes y sont liées)."); }
  };

  const filtered = fournisseurs.filter(f => `${f.nom} ${f.prenom} ${f.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Fournisseurs</h1><p>Comptes fournisseurs et suivi de leurs commandes</p></div>
        <button className="primary-button category-add-button" onClick={openCreate}><Plus size={18} />Ajouter un fournisseur</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>Nouveau fournisseur</h3><p>Créer un compte fournisseur</p></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Nom</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required /></div>
              <div className="form-group"><label>Prénom</label><input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="form-group"><label>Mot de passe</label><input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} placeholder="6 caractères minimum" required /></div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Création..." : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher un fournisseur..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} fournisseur(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><Truck size={40} /><h3>Aucun fournisseur</h3><p>Ajoutez votre premier fournisseur pour commencer.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Nom</th><th>Email</th><th>Commandes</th><th>Montant total</th><th>Membre depuis</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.idUtilisateur}>
                    <td><strong>{f.nom} {f.prenom}</strong></td>
                    <td>{f.email}</td>
                    <td>{f.nombreCommandes}</td>
                    <td>{Number(f.montantTotal).toFixed(2)} DT</td>
                    <td>{new Date(f.dateCreation).toLocaleDateString("fr-FR")}</td>
                    <td><div className="table-actions">
                      <button className="icon-button delete" onClick={() => remove(f.idUtilisateur)}><Trash2 size={17} /></button>
                    </div></td>
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

export default Fournisseurs;
