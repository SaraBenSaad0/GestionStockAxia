import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, Search, X } from "lucide-react";
import api from "../services/api";

function Produits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ reference: "", designation: "", description: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "", idCategorie: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/data/produits"), api.get("/Categories")])
      .then(([p, c]) => { setProduits(p.data); setCategories(c.data); })
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm({ reference: "", designation: "", description: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "", idCategorie: categories[0]?.idCategorie || "" }); setShowForm(true); };
  const openEdit = (p) => { setEditingId(p.idProduit); setForm({ reference: p.reference, designation: p.designation, description: p.description || "", prixUnitaire: p.prixUnitaire, quantiteStock: p.quantiteStock, seuilAlerte: p.seuilAlerte, idCategorie: p.idCategorie }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const payload = { reference: form.reference, designation: form.designation, description: form.description, prixUnitaire: Number(form.prixUnitaire), quantiteStock: Number(form.quantiteStock), seuilAlerte: Number(form.seuilAlerte), idCategorie: Number(form.idCategorie) };
    try {
      if (editingId) await api.put(`/data/produits/${editingId}`, payload);
      else await api.post("/data/produits", payload);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try { await api.delete(`/data/produits/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Impossible de supprimer ce produit."); }
  };

  const filtered = produits.filter(p => `${p.reference} ${p.designation} ${p.categorieNom}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Produits</h1><p>Gestion des pièces automobiles et du stock</p></div>
        <button className="primary-button category-add-button" onClick={openCreate}><Plus size={18} />Ajouter un produit</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>{editingId ? "Modifier le produit" : "Nouveau produit"}</h3><p>{editingId ? "Mettre à jour la fiche produit" : "Ajouter une pièce au catalogue"}</p></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Référence</label><input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Ex: PF-2201" required /></div>
              <div className="form-group"><label>Désignation</label><input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Ex: Plaquettes de frein" required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Catégorie</label>
                <select value={form.idCategorie} onChange={e => setForm({ ...form, idCategorie: e.target.value })} required>
                  <option value="" disabled>Choisir...</option>
                  {categories.map(c => <option key={c.idCategorie} value={c.idCategorie}>{c.nomCategorie}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optionnel" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Prix unitaire (DT)</label><input type="number" step="0.01" value={form.prixUnitaire} onChange={e => setForm({ ...form, prixUnitaire: e.target.value })} required /></div>
              <div className="form-group"><label>Stock actuel</label><input type="number" value={form.quantiteStock} onChange={e => setForm({ ...form, quantiteStock: e.target.value })} required /></div>
              <div className="form-group"><label>Seuil d'alerte</label><input type="number" value={form.seuilAlerte} onChange={e => setForm({ ...form, seuilAlerte: e.target.value })} required /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} produit(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><Package size={40} /><h3>Aucun produit</h3><p>Ajoutez votre premier produit pour commencer.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Référence</th><th>Désignation</th><th>Catégorie</th><th>Stock</th><th>Seuil</th><th>Prix</th><th>État</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.idProduit}>
                    <td>{p.reference}</td>
                    <td><strong>{p.designation}</strong></td>
                    <td>{p.categorieNom}</td>
                    <td>{p.quantiteStock}</td>
                    <td>{p.seuilAlerte}</td>
                    <td>{Number(p.prixUnitaire).toFixed(2)} DT</td>
                    <td><span className={p.stockFaible ? "status-badge danger" : "status-badge success"}>{p.stockFaible ? "Stock faible" : "Disponible"}</span></td>
                    <td><div className="table-actions">
                      <button className="icon-button edit" onClick={() => openEdit(p)}><Pencil size={17} /></button>
                      <button className="icon-button delete" onClick={() => remove(p.idProduit)}><Trash2 size={17} /></button>
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

export default Produits;
