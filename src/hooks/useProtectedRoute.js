/**
 * useProtectedRoute
 *
 * Hook para proteger rotas client-side.
 * Redireciona para /login se o usuário não estiver autenticado.
 *
 * @returns {Object} { user, loading }
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("❌ Usuário não autenticado, redirecionando para /login");
      router.push("/login");
    }
  }, [loading, user, router]);

  return { user, loading };
}
