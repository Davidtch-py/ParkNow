import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthProtectedProps {
  children: ReactNode;
}

const AuthProtected: React.FC<AuthProtectedProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando la autenticación, mostrar spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Usar el contexto de autenticación en lugar de localStorage directamente
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default AuthProtected;
