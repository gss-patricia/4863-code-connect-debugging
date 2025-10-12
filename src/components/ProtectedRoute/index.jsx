"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../Spinner";

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "🔍 ProtectedRoute: loading =",
      loading,
      "isAuthenticated =",
      isAuthenticated,
      "user =",
      user?.email
    );

    if (!loading && !isAuthenticated) {
      console.log("❌ Usuário não autenticado, redirecionando para login");
      router.push(
        "/login?message=Você precisa fazer login para acessar esta página"
      );
    } else if (!loading && isAuthenticated) {
      console.log("✅ Usuário autenticado, renderizando conteúdo");
    }
  }, [loading, isAuthenticated, router, user]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--cinza-escuro)",
        }}
      >
        <Spinner />
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Se estiver autenticado, renderizar o conteúdo
  return <>{children}</>;
};
