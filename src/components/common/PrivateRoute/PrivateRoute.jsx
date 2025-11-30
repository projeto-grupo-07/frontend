import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

export function PrivateRoute({ allowedRoles }) {
  const { signed, user, loading } = useContext(AuthContext);

  // console.log("--- DEBUG PRIVATE ROUTE ---");
  // console.log("Loading:", loading);
  // console.log("Signed:", signed);
  // console.log("User Completo:", user);
  // console.log("Perfil do User:", user?.perfil); 
  // console.log("Roles Permitidas:", allowedRoles);

  if (loading) {
    return <div className="loading-spinner">A carregar permissões...</div>; 
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.perfil)) {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
}