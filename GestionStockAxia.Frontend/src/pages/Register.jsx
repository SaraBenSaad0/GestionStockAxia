import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, AlertCircle } from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nom || !prenom || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/Utilisateurs/register", { nom, prenom, email: email.trim(), motDePasse: password });
      setSuccess("Votre compte a été créé avec succès !");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon"><Package size={30} /></div>
          <h1>GestionStock</h1>
          <span>AXIA</span>
        </div>

        <div className="login-title">
          <h2>Créer un compte</h2>
          <p>Créez votre compte fournisseur</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom" />
          </div>
          <div className="form-group">
            <label>Prénom</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Votre prénom" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <div className="login-register">
          <p>Vous avez déjà un compte ?</p>
          <button type="button" onClick={() => navigate("/login")}>Se connecter</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
