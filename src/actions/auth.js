"use server";

import { logEvent, logEventError } from "../eventLogger";
import { createClient } from "../utils/supabase/server";

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
        'AUTH',
        'REGISTER_FAILED',
        null,
        error
      )

      return { success: false, error: error.message };
    }

    logEvent(
      'AUTH',
      'REGISTER_SUCCESS',
      data.user?.id
    )
    return { success: true, data };
  } catch (err) {
    logEventError(
      'AUTH',
      'REGISTER_FAILED',
      null,
      error
    )
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
        'AUTH',
        'LOGIN_FAILED',
        null,
        error
      )

      return { success: false, error: error.message };
    }

    logEvent('AUTH',
      'LOGIN_SUCCESS',
      data.user?.id
    )
    return { success: true, data };
  } catch (err) {
    logEventError(
      'AUTH',
      'LOGIN_FAILED',
      null,
      error
    )
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
      logEventError('AUTH', 'LOGOUT_FAILED', userId, error)
      return { success: false, error: error.message };
    }

    logEvent('AUTH', 'LOGOUT_SUCCESS', userId)
    return { success: true };
  } catch (err) {
    logEventError('AUTH', 'LOGOUT_FAILED', userId, error)

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
