import db from "../../supabase/db";

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
        console.error("DB error:", error);
        throw error;
      }

      // Calcular paginação
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / perPage);
      const prev = page > 1 ? page - 1 : null;
      const next = page < totalPages ? page + 1 : null;

      console.log("Posts fetched");

      return { data: posts || [], prev, next };
    } catch (error) {
      console.error("DB error:", error);
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
        log.error("Erro ao buscar post por slug", {
          slug,
          error: error.message,
          operation: "getPostBySlug",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_QUERY_FAILED,
          null,
          error,
          { slug, operation: "getPostBySlug" }
        );
        throw error;
      }

      if (!post) {
        const notFoundError = new Error(
          `Post com o slug ${slug} não foi encontrado`
        );
        log.warn("Post não encontrado por slug", {
          slug,
          operation: "getPostBySlug",
        });
        throw notFoundError;
      }

      // Filtrar apenas comentários principais (parentId = null)
      const mainComments =
        post.comments?.filter((comment) => comment.parentId === null) || [];
      post.comments = mainComments;

      log.info("Post encontrado por slug", {
        slug,
        post_id: post.id,
        comments_count: mainComments.length,
        operation: "getPostBySlug",
      });

      return post;
    } catch (error) {
      log.error("Falha ao obter post por slug", {
        slug,
        error: error.message,
        operation: "getPostBySlug",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_QUERY_FAILED,
        null,
        error,
        { slug, operation: "getPostBySlug" }
      );
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
        log.error("Erro ao buscar post por ID", {
          postId,
          error: error.message,
          operation: "getPostById",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_QUERY_FAILED,
          null,
          error,
          { postId, operation: "getPostById" }
        );
        throw error;
      }

      if (!post) {
        const notFoundError = new Error(
          `Post com ID ${postId} não foi encontrado`
        );
        log.warn("Post não encontrado por ID", {
          postId,
          operation: "getPostById",
        });
        throw notFoundError;
      }

      log.info("Post encontrado por ID", {
        postId,
        slug: post.slug,
        title: post.title,
        operation: "getPostById",
      });

      return post;
    } catch (error) {
      log.error("Falha ao obter post por ID", {
        postId,
        error: error.message,
        operation: "getPostById",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_QUERY_FAILED,
        null,
        error,
        { postId, operation: "getPostById" }
      );
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
        log.error("Erro ao buscar post para incrementar likes", {
          postId,
          error: fetchError.message,
          operation: "incrementPostLikes",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_MUTATION_FAILED,
          null,
          fetchError,
          { postId, operation: "incrementPostLikes" }
        );
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
        log.error("Erro ao incrementar likes", {
          postId,
          error: error.message,
          operation: "incrementPostLikes",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_MUTATION_FAILED,
          null,
          error,
          { postId, operation: "incrementPostLikes" }
        );
        throw error;
      }

      log.info("Likes incrementados com sucesso", {
        postId,
        new_likes: data.likes,
        operation: "incrementPostLikes",
      });
      eventLogger.logEvent(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_MUTATION_SUCCESS,
        null,
        { postId, new_likes: data.likes, operation: "incrementPostLikes" }
      );

      return data;
    } catch (error) {
      log.error("Falha ao incrementar likes", {
        postId,
        error: error.message,
        operation: "incrementPostLikes",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_MUTATION_FAILED,
        null,
        error,
        { postId, operation: "incrementPostLikes" }
      );
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
        log.error("Erro ao criar comentário", {
          error: error.message,
          postId,
          authorId,
          parentId,
          operation: "createComment",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_MUTATION_FAILED,
          authorId,
          error,
          { postId, parentId, operation: "createComment" }
        );
        throw error;
      }

      log.info("Comentário criado com sucesso", {
        comment_id: data.id,
        postId,
        authorId,
        parentId,
        operation: "createComment",
      });
      eventLogger.logEvent(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_MUTATION_SUCCESS,
        authorId,
        { comment_id: data.id, postId, parentId, operation: "createComment" }
      );

      return data;
    } catch (error) {
      log.error("Falha ao criar comentário", {
        error: error.message,
        postId,
        authorId,
        parentId,
        operation: "createComment",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_MUTATION_FAILED,
        authorId,
        error,
        { postId, parentId, operation: "createComment" }
      );
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
        log.error("Erro ao buscar respostas do comentário", {
          parentId,
          error: error.message,
          operation: "getCommentReplies",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_QUERY_FAILED,
          null,
          error,
          { parentId, operation: "getCommentReplies" }
        );
        throw error;
      }

      log.info("Respostas do comentário buscadas", {
        parentId,
        replies_count: replies?.length || 0,
        operation: "getCommentReplies",
      });

      return replies || [];
    } catch (error) {
      log.error("Falha ao buscar respostas do comentário", {
        parentId,
        error: error.message,
        operation: "getCommentReplies",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_QUERY_FAILED,
        null,
        error,
        { parentId, operation: "getCommentReplies" }
      );
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
        log.info("Usuário encontrado", {
          username,
          userId: existingUser.id,
          operation: "getOrCreateUser",
        });
        return existingUser;
      }

      // Se não existe, criar
      log.info("Criando novo usuário", {
        username,
        operation: "getOrCreateUser",
      });

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
        log.error("Erro ao criar usuário", {
          username,
          error: createError.message,
          operation: "getOrCreateUser",
        });
        throw createError;
      }

      log.info("Usuário criado com sucesso", {
        username,
        userId: newUser.id,
        operation: "getOrCreateUser",
      });

      return newUser;
    } catch (error) {
      log.error("Falha em getOrCreateUser", {
        username,
        error: error.message,
        operation: "getOrCreateUser",
      });
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
        log.error("Erro ao buscar usuário por username", {
          username,
          error: error.message,
          operation: "getUserByUsername",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_QUERY_FAILED,
          null,
          error,
          { username, operation: "getUserByUsername" }
        );
        throw error;
      }

      log.info("Usuário encontrado por username", {
        username,
        userId: user?.id,
        operation: "getUserByUsername",
      });

      return user;
    } catch (error) {
      log.error("Falha ao buscar usuário por username", {
        username,
        error: error.message,
        operation: "getUserByUsername",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_QUERY_FAILED,
        null,
        error,
        { username, operation: "getUserByUsername" }
      );
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
        log.error("Erro ao contar posts", {
          error: error.message,
          searchTerm,
          operation: "getPostCount",
        });
        eventLogger.logEventError(
          EVENT_STEPS.DATABASE,
          EVENT_OPERATIONS.DB_QUERY_FAILED,
          null,
          error,
          { searchTerm, operation: "getPostCount" }
        );
        throw error;
      }

      log.info("Posts contados com sucesso", {
        count: count || 0,
        searchTerm,
        operation: "getPostCount",
      });

      return count || 0;
    } catch (error) {
      log.error("Falha ao contar posts", {
        error: error.message,
        searchTerm,
        operation: "getPostCount",
      });
      eventLogger.logEventError(
        EVENT_STEPS.DATABASE,
        EVENT_OPERATIONS.DB_QUERY_FAILED,
        null,
        error,
        { searchTerm, operation: "getPostCount" }
      );
      return 0;
    }
  }
}

// Instância singleton
export const database = new DatabaseService();
export default database;
