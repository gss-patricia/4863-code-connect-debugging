"use server";

import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import {
  logEvent,
  logEventError,
  EVENT_STEPS,
  EVENT_OPERATIONS,
} from "../lib/eventLogger";

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
      logEventError(
        EVENT_STEPS.AUTH,
        EVENT_OPERATIONS.REGISTER_FAILED,
        null,
        error
      );
      return { success: false, error: error.message };
    }

    logEvent(
      EVENT_STEPS.AUTH,
      EVENT_OPERATIONS.REGISTER_SUCCESS,
      data.user?.id
    );
    return { success: true, data };
  } catch (err) {
    logEventError(
      EVENT_STEPS.AUTH,
      EVENT_OPERATIONS.REGISTER_FAILED,
      null,
      err
    );
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
      logEventError(
        EVENT_STEPS.AUTH,
        EVENT_OPERATIONS.LOGIN_FAILED,
        null,
        error
      );
      return { success: false, error: error.message };
    }

    logEvent(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGIN_SUCCESS, data.user?.id);
    return { success: true, data };
  } catch (err) {
    logEventError(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGIN_FAILED, null, err);
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
      logEventError(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGOUT, userId, error);
      return { success: false, error: error.message };
    }

    logEvent(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGOUT, userId);
    return { success: true };
  } catch (err) {
    logEventError(EVENT_STEPS.AUTH, EVENT_OPERATIONS.LOGOUT, null, err);
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
      return { success: false, error: error.message };
    }

    return { success: true, user };
  } catch (err) {
    return { success: false, error: "Erro interno do servidor" };
  }
}
