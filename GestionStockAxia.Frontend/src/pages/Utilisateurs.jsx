import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users, Search, X } from "lucide-react";
import api from "../services/api";

function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "", typeUtilisateur: "FOURNISSEUR" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/Utilisateurs").then(r => setUsers(r.data)).catch(() => setError("Impossible de charger les utilisateurs.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm({ nom: "", prenom: "", email: "", motDePasse: "", typeUtilisateur: "FOURNISSEUR" }); setShowForm(true); };
  const openEdit = (u) => { setEditingId(u.idUtilisateur); setForm({ nom: u.nom, prenom: u.prenom, email: u.email, motDePasse: "", typeUtilisateur: u.typeUtilisateur }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.motDePasse) delete payload.motDePasse;
        await api.put(`/Utilisateurs/${editingId}`, payload);
      } else {
        if (!form.motDePasse) { setError("Le mot de passe est obligatoire."); setSaving(false); return; }
        await api.post("/Utilisateurs", form);
      }
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try { await api.delete(`/Utilisateurs/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Impossible de supprimer cet utilisateur."); }
  };

  const filtered = users.filter(u => `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div><h1>Utilisateurs</h1><p>Comptes administrateurs et fournisseurs</p></div>
        <button className="primary-button category-add-button" onClick={openCreate}><Plus size={18} />Ajouter un utilisateur</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="dashboard-card category-form-card">
          <div className="card-header">
            <div><h3>{editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3></div>
            <button className="close-button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Nom</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required /></div>
              <div className="form-group"><label>Prénom</label><input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Rôle</label>
                <select value={form.typeUtilisateur} onChange={e => setForm({ ...form, typeUtilisateur: e.target.value })}>
                  <option value="FOURNISSEUR">Fournisseur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Mot de passe {editingId && "(laisser vide pour ne pas changer)"}</label><input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} /></div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Annuler</button>
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-card">
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <span>{filtered.length} utilisateur(s)</span>
        </div>

        {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
          <div className="empty-state"><Users size={40} /><h3>Aucun utilisateur</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Créé le</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.idUtilisateur}>
                    <td><strong>{u.nom} {u.prenom}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={u.typeUtilisateur === "ADMIN" ? "status-badge success" : "status-badge warning"}>{u.typeUtilisateur === "ADMIN" ? "Administrateur" : "Fournisseur"}</span></td>
                    <td>{new Date(u.dateCreation).toLocaleDateString("fr-FR")}</td>
                    <td><div className="table-actions">
                      <button className="icon-button edit" onClick={() => openEdit(u)}><Pencil size={17} /></button>
                      <button className="icon-button delete" onClick={() => remove(u.idUtilisateur)}><Trash2 size={17} /></button>
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

export default Utilisateurs;
