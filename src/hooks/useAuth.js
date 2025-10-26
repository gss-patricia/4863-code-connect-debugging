"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { eventLogger, logEvent, logEventError } from '../eventLogger'

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Verificar se há usuário logado
    const checkUser = async () => {
      try {
        // ✅ OK usar getSession() em Client Components
        // O middleware já garante que o token está válido
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = () => {
    try {
      // Fire-and-forget: não esperamos pelo signOut
      supabase.auth.signOut().catch((error) => {
        logEventError('AUTH', 'LOGOUT_FAILED', user, error)
      });

      logEvent('AUTH', 'LOGOUT_SUCCESS', user)

      setUser(null);

      // Forçar redirecionamento usando window.location para garantir limpeza total
      window.location.href = "/login";
    } catch (error) {
      logEventError('AUTH', 'LOGOUT_FAILED', user, error)

      // Mesmo com erro, tenta redirecionar
      setUser(null);
      window.location.href = "/login";
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
