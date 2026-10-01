import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("gestionStockToken");
  const storedUser = localStorage.getItem("gestionStockUser");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("gestionStockToken");
    localStorage.removeItem("gestionStockUser");
    return <Navigate to="/login" replace />;
  }

  if (!user.typeUtilisateur || !["ADMIN", "FOURNISSEUR"].includes(user.typeUtilisateur)) {
    localStorage.removeItem("gestionStockToken");
    localStorage.removeItem("gestionStockUser");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.typeUtilisateur)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
