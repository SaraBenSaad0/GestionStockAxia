import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags, Search, X } from "lucide-react";
import api from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/Categories").then(r => setCategories(r.data)).catch(() => setError("Impossible de charger les catégories.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setNom(""); setDescription(""); setShowForm(true); };
  const openEdit = (c) => { setEditingId(c.idCategorie); setNom(c.nomCategorie); setDescription(c.description); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await api.put(`/Categories/${editingId}`, { idCategorie: editingId, nomCategorie: nom, description });
      else await api.post("/Categories", { nomCategorie: nom, description });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Erreur lors de l'enregistrement.");
    } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try { await api.delete(`/Categories/${id}`); load(); }
    catch { setError("Impossible de supprimer cette catégorie (des produits y sont peut-être liés)."); }
  };

  const filtered = categories.filter(c => `${c.nomCategorie} ${c.description}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Catégories</h1><p>Organisez vos pièces automobiles par catégorie</p></div>
        <button className="primary-button category-add-button" onClick={openCreate}><Plus size={18} />Ajouter une catégorie</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3><p>{editingId ? "Mettre à jour les informations" : "Ajouter une catégorie au catalogue"}</p></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            <div className="form-group"><label>Nom</label><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Freinage" required /></div>
            <div className="form-group"><label>Description</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de la catégorie" required /></div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher une catégorie..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} catégorie(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><Tags size={40} /><h3>Aucune catégorie</h3><p>Ajoutez votre première catégorie pour commencer.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Nom</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.idCategorie}>
                    <td><strong>{c.nomCategorie}</strong></td>
                    <td>{c.description}</td>
                    <td><div className="table-actions">
                      <button className="icon-button edit" onClick={() => openEdit(c)}><Pencil size={17} /></button>
                      <button className="icon-button delete" onClick={() => remove(c.idCategorie)}><Trash2 size={17} /></button>
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

export default Categories;
