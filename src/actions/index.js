"use server";

import { revalidatePath } from "next/cache";
import { database } from "../lib/database";
import { createClient } from "../utils/supabase/server";
import { eventLogger } from "../lib/eventLogger";

export async function incrementThumbsUp(post) {
  try {
    // ✅ PROTEÇÃO: Verificar autenticação
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Não autenticado");
    }

    await database.incrementPostLikes(post.id);
    revalidatePath("/");
    revalidatePath(`/${post.slug}`);

    // 🎯 USER JOURNEY LOG - Like Post
    eventLogger.logLikePost(user.id, post.id);
  } catch (err) {
    throw err;
  }
}

export async function postComment(post, formData) {
  try {
    // ✅ PROTEÇÃO: Verificar autenticação e usar usuário real
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Não autenticado");
    }

    // ✅ USAR USUÁRIO AUTENTICADO ao invés de hardcoded
    // Buscar ou criar o usuário no banco usando o email do Supabase
    const username = user.email.split("@")[0];
    const author = await database.getOrCreateUser(username);

    await database.createComment(formData.get("text"), author.id, post.id);
    revalidatePath("/");
    revalidatePath(`/${post.slug}`);

    // 🎯 USER JOURNEY LOG - Submit Comment
    eventLogger.logSubmitComment(user.id, post.id, true);
  } catch (err) {
    // 🎯 USER JOURNEY LOG - Error
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      eventLogger.logSubmitComment(user.id, post?.id, false, err);
    }
    throw err;
  }
}

export async function postReply(parent, formData) {
  try {
    // ✅ PROTEÇÃO: Verificar autenticação e usar usuário real
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Não autenticado");
    }

    // ✅ USAR USUÁRIO AUTENTICADO ao invés de hardcoded
    const username = user.email.split("@")[0];
    const author = await database.getOrCreateUser(username);

    // Criar o comentário usando o postId do parent
    await database.createComment(
      formData.get("text"),
      author.id,
      parent.postId, // ✅ Usar postId do comment
      parent.parentId ?? parent.id // ✅ Parent ID (se for resposta à resposta)
    );

    // Buscar o post para pegar o slug para revalidate
    const post = await database.getPostById(parent.postId);
    revalidatePath(`/${post.slug}`);

    // 🎯 USER JOURNEY LOG - Submit Reply
    eventLogger.logSubmitReply(user.id, parent.id, parent.postId, true);
  } catch (err) {
    // 🎯 USER JOURNEY LOG - Error
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      eventLogger.logSubmitReply(
        user.id,
        parent?.id,
        parent?.postId,
        false,
        err
      );
    }
    throw err;
  }
}
