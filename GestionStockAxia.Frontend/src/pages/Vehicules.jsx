import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Car, Search, X } from "lucide-react";
import api from "../services/api";

function Vehicules() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ marque: "", modele: "", anneeDebut: "", anneeFin: "", prixUnitaire: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/data/vehicules").then(r => setVehicules(r.data)).catch(() => setError("Impossible de charger les véhicules.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm({ marque: "", modele: "", anneeDebut: "", anneeFin: "", prixUnitaire: "" }); setShowForm(true); };
  const openEdit = (v) => { setEditingId(v.idVehicule); setForm({ marque: v.marque, modele: v.modele, anneeDebut: v.anneeDebut, anneeFin: v.anneeFin, prixUnitaire: v.prixUnitaire }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const payload = { marque: form.marque, modele: form.modele, anneeDebut: Number(form.anneeDebut), anneeFin: Number(form.anneeFin), prixUnitaire: Number(form.prixUnitaire) };
    try {
      if (editingId) await api.put(`/data/vehicules/${editingId}`, payload);
      else await api.post("/data/vehicules", payload);
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce véhicule ?")) return;
    try { await api.delete(`/data/vehicules/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Impossible de supprimer ce véhicule."); }
  };

  const filtered = vehicules.filter(v => `${v.marque} ${v.modele}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Véhicules</h1><p>Gestion des marques et modèles compatibles</p></div>
        <button className="primary-button category-add-button" onClick={openCreate}><Plus size={18} />Ajouter un véhicule</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>{editingId ? "Modifier le véhicule" : "Nouveau véhicule"}</h3><p>{editingId ? "Mettre à jour la fiche" : "Ajouter un véhicule compatible"}</p></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Marque</label><input value={form.marque} onChange={e => setForm({ ...form, marque: e.target.value })} placeholder="Ex: Peugeot" required /></div>
              <div className="form-group"><label>Modèle</label><input value={form.modele} onChange={e => setForm({ ...form, modele: e.target.value })} placeholder="Ex: 208" required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Année début</label><input type="number" value={form.anneeDebut} onChange={e => setForm({ ...form, anneeDebut: e.target.value })} placeholder="Ex: 2012" required /></div>
              <div className="form-group"><label>Année fin</label><input type="number" value={form.anneeFin} onChange={e => setForm({ ...form, anneeFin: e.target.value })} placeholder="Ex: 2019" required /></div>
            </div>
            <div className="form-group"><label>Prix de vente (DT)</label><input type="number" step="0.01" value={form.prixUnitaire} onChange={e => setForm({ ...form, prixUnitaire: e.target.value })} required /></div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher un véhicule..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} véhicule(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><Car size={40} /><h3>Aucun véhicule</h3><p>Ajoutez votre premier véhicule pour commencer.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Marque</th><th>Modèle</th><th>Années</th><th>Prix</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.idVehicule}>
                    <td><strong>{v.marque}</strong></td>
                    <td>{v.modele}</td>
                    <td>{v.anneeDebut} – {v.anneeFin}</td>
                    <td>{Number(v.prixUnitaire).toFixed(2)} DT</td>
                    <td><div className="table-actions">
                      <button className="icon-button edit" onClick={() => openEdit(v)}><Pencil size={17} /></button>
                      <button className="icon-button delete" onClick={() => remove(v.idVehicule)}><Trash2 size={17} /></button>
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

export default Vehicules;
