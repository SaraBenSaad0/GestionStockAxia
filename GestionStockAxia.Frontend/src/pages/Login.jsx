import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, AlertCircle } from "lucide-react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/Utilisateurs/login", { email: email.trim(), motDePasse: password });
      localStorage.setItem("gestionStockToken", data.token);
      localStorage.setItem("gestionStockUser", JSON.stringify(data.user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response) setError(err.response.data?.message || "Email ou mot de passe incorrect.");
      else if (err.request) setError("Impossible de contacter le serveur. Vérifiez que l'API tourne sur http://localhost:5219.");
      else setError("Une erreur inattendue est survenue.");
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
          <h2>Bienvenue</h2>
          <p>Connectez-vous à votre espace de gestion</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="login-register">
          <p>Vous n'avez pas encore de compte ?</p>
          <button type="button" onClick={() => navigate("/register")}>Créer un compte</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
