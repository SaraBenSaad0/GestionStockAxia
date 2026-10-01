import { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import api from "../services/api";

function MonProfil() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/Utilisateurs/me")
      .then(r => setForm({ nom: r.data.nom, prenom: r.data.prenom, email: r.data.email, motDePasse: "" }))
      .catch(() => setError("Impossible de charger votre profil."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const stored = JSON.parse(localStorage.getItem("gestionStockUser"));
      const payload = { nom: form.nom, prenom: form.prenom, email: form.email, typeUtilisateur: "FOURNISSEUR" };
      if (form.motDePasse) payload.motDePasse = form.motDePasse;
      await api.put(`/Utilisateurs/${stored.idUtilisateur}`, payload);
      localStorage.setItem("gestionStockUser", JSON.stringify({ ...stored, nom: form.nom, prenom: form.prenom, email: form.email }));
      setSuccess("Profil mis à jour avec succès.");
      setForm({ ...form, motDePasse: "" });
    } catch (err) { setError(err.response?.data?.message || "Erreur lors de la mise à jour."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <div className="page-header"><div><h1>Mon profil</h1><p>Gérez vos informations personnelles</p></div><UserCircle size={28} /></div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="login-success">{success}</div>}

      <div className="dashboard-card category-form-card" style={{ maxWidth: 480 }}>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group"><label>Nom</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required /></div>
            <div className="form-group"><label>Prénom</label><input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group"><label>Nouveau mot de passe (optionnel)</label><input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} placeholder="Laisser vide pour ne pas changer" /></div>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MonProfil;
