import db from "../../supabase/db";
import logger from '../logger'

// Data layer para centralizar todas as consultas do Supabase
export class DatabaseService {
  // ===== POSTS =====

  async getAllPosts(page = 1, searchTerm = null) {
    try {
      const perPage = 4;
      const skip = (page - 1) * perPage;

      // Construir query base
      let query = db
        .from("Post")
        .select(
          `
          *,
          author:User(*),
          comments:Comment(*)
        `
        )
        .order("id", { ascending: false })
        .range(skip, skip + perPage - 1);

      // Adicionar filtro de busca se necessário
      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { data: posts, error, count } = await query;

      if (error) {
        logger.error("DB:getAllPosts error", {
          step: "DATABASE",
          operation: "LIST_POSTS",
          page,
          searchTerm,
          perPage,
          error
        })
        throw error;
      }

      // Calcular paginação
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / perPage);
      const prev = page > 1 ? page - 1 : null;
      const next = page < totalPages ? page + 1 : null;

      logger.info("DB:getAllPosts success", {
        step: "DATABASE",
        operation: "LIST_POSTS",
        page,
        searchTerm,
        perPage,
      })

      return { data: posts || [], prev, next };
    } catch (error) {
      logger.error("DB:getAllPosts unexpected error", {
        step: "DATABASE",
        operation: "LIST_POSTS",
        page,
        searchTerm,
        perPage,
        error
      })
      return { data: [], prev: null, next: null };
    }
  }

  async getPostBySlug(slug) {
    try {
      const { data: post, error } = await db
        .from("Post")
        .select(
          `
          *,
          author:User(*),
          comments:Comment(
            *,
            author:User(*),
            children:Comment(
              *,
              author:User(*)
            )
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error) {
        logger.error("DB:getPostBySlug", {
          step: "DATABASE",
          operation: "GET_POST_BY_SLUG",
          slug,
          error
        })

        throw error;
      }

      if (!post) {
        logger.warn("DB:getPostBySlug not_found", {
          step: "DATABASE",
          operation: "GET_POST_BY_SLUG",
          slug
        })

        const notFoundError = new Error(
          `Post com o slug ${slug} não foi encontrado`
        );

        throw notFoundError;
      }

      // Filtrar apenas comentários principais (parentId = null)
      const mainComments =
        post.comments?.filter((comment) => comment.parentId === null) || [];
      post.comments = mainComments;

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getPostById(postId) {
    try {
      const { data: post, error } = await db
        .from("Post")
        .select("id, slug, title")
        .eq("id", postId)
        .single();

      if (error) {
        throw error;
      }

      if (!post) {
        const notFoundError = new Error(
          `Post com ID ${postId} não foi encontrado`
        );

        throw notFoundError;
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  async incrementPostLikes(postId) {
    try {
      // Primeiro buscar o post atual para pegar o número de likes
      const { data: currentPost, error: fetchError } = await db
        .from("Post")
        .select("likes")
        .eq("id", postId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Incrementar likes
      const { data, error } = await db
        .from("Post")
        .update({ likes: (currentPost.likes || 0) + 1 })
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // ===== COMMENTS =====

  async createComment(text, authorId, postId, parentId = null) {
    try {
      const { data, error } = await db
        .from("Comment")
        .insert({
          text,
          authorId,
          postId,
          parentId,
        })
        .select(
          `
          *,
          author:User(*)
        `
        )
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCommentReplies(parentId) {
    try {
      const { data: replies, error } = await db
        .from("Comment")
        .select(
          `
          *,
          author:User(*)
        `
        )
        .eq("parentId", parentId)
        .order("createdAt", { ascending: true });

      if (error) {
        throw error;
      }

      return replies || [];
    } catch (error) {
      return [];
    }
  }

  // ===== USERS =====

  async getOrCreateUser(username) {
    try {
      // Tentar buscar o usuário primeiro
      const { data: existingUser, error: fetchError } = await db
        .from("User")
        .select("*")
        .eq("username", username)
        .maybeSingle(); // ✅ maybeSingle() não dá erro se não encontrar

      if (existingUser) {
        return existingUser;
      }

      // Se não existe, criar
      const { data: newUser, error: createError } = await db
        .from("User")
        .insert({
          username,
          name: username,
          avatar:
            "https://raw.githubusercontent.com/gss-patricia/code-connect-assets/main/authors/anabeatriz_dev.png",
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const { data: user, error } = await db
        .from("User")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // ===== UTILS =====

  async getPostCount(searchTerm = null) {
    try {
      let query = db.from("Post").select("*", { count: "exact", head: true });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      return 0;
    }
  }
}

// Instância singleton
export const database = new DatabaseService();
export default database;
