"use server";

import { createClient } from "../utils/supabase/server";
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
      console.log("Signup error");
      return { success: false, error: error.message };
    }

    console.log("Signup OK");
    return { success: true, data };
  } catch (err) {
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
      console.log("Login error");
      return { success: false, error: error.message };
    }

    console.log("Login OK");
    return { success: true, data };
  } catch (err) {
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
      console.log("Logout error");
      return { success: false, error: error.message };
    }

    console.log("Logout OK");
    return { success: true };
  } catch (err) {
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
