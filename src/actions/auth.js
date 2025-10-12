"use server";

import { createClient } from "../utils/supabase/server";
import { log } from "../lib/logger";
import { eventLogger } from "../lib/eventLogger";
import { redirect } from "next/navigation";

export async function signUp(email, password, userData = {}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      await log.error("Erro no signup", {
        error: error.message,
        action: "signUp",
      });

      // 🎯 EVENT LOG - Sem PII
      eventLogger.logRegister(null, false, error);

      return { success: false, error: error.message };
    }

    await log.info("Usuário criado com sucesso", {
      user_id: data.user?.id,
      action: "signUp",
    });

    // 🎯 EVENT LOG - Apenas userId
    eventLogger.logRegister(data.user?.id, true);

    return { success: true, data };
  } catch (err) {
    await log.error("Erro inesperado no signup", {
      error: err.message,
      action: "signUp",
    });

    // 🎯 EVENT LOG - Sem PII
    eventLogger.logRegister(null, false, err);

    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function signIn(email, password) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await log.warn("Tentativa de login falhou", {
        error: error.message,
        action: "signIn",
      });

      // 🎯 EVENT LOG - Sem PII
      eventLogger.logLogin(null, false, error);

      return { success: false, error: error.message };
    }

    await log.info("Login realizado com sucesso", {
      user_id: data.user?.id,
      action: "signIn",
    });

    // 🎯 EVENT LOG - Apenas userId
    eventLogger.logLogin(data.user?.id, true);

    return { success: true, data };
  } catch (err) {
    await log.error("Erro inesperado no login", {
      error: err.message,
      action: "signIn",
    });

    // 🎯 EVENT LOG - Sem PII
    eventLogger.logLogin(null, false, err);

    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();

    // Pegar user antes de fazer logout
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    const { error } = await supabase.auth.signOut();

    if (error) {
      await log.error("Erro no logout", {
        error: error.message,
        action: "signOut",
      });
      return { success: false, error: error.message };
    }

    await log.info("Logout realizado com sucesso", {
      action: "signOut",
    });

    // 🎯 USER JOURNEY LOG
    if (userId) {
      eventLogger.logLogout(userId);
    }

    return { success: true };
  } catch (err) {
    await log.error("Erro inesperado no logout", {
      error: err.message,
      action: "signOut",
    });
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();

    // ✅ SEMPRE usar getUser() em server code - revalida o token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      await log.warn("Erro ao buscar usuário atual", {
        error: error.message,
        action: "getCurrentUser",
      });
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (err) {
    await log.error("Erro inesperado ao buscar usuário", {
      error: err.message,
      action: "getCurrentUser",
    });
    return { success: false, error: "Erro interno do servidor" };
  }
}
