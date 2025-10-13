import { database } from "../../../../lib/database";
import { remark } from "remark";
import html from "remark-html";
import { createClient } from "../../../../utils/supabase/server";
import {
  logEvent,
  logEventWarning,
  logEventError,
  EVENT_STEPS,
  EVENT_OPERATIONS,
} from "../../../../lib/eventLogger";

export async function GET(_request, { params }) {
  let userId = null;
  let slug = null;

  try {
    // ✅ PROTEÇÃO: Validar autenticação antes de processar
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logEventWarning(
        EVENT_STEPS.API,
        EVENT_OPERATIONS.API_UNAUTHORIZED,
        null,
        "Acesso sem auth a /api/posts/[slug]"
      );
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    userId = user.id;
    const resolvedParams = await params;
    slug = resolvedParams.slug;

    // 🐛 SIMULAÇÃO DE ERRO - Remover depois!
    throw new Error("Simulação de erro no servidor para teste de logs");

    const post = await database.getPostBySlug(slug);

    if (!post) {
      console.log("Post not found:", slug);
      return Response.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Processar markdown
    const processedContent = await remark().use(html).process(post.markdown);
    const contentHtml = processedContent.toString();
    post.markdown = contentHtml;

    // ✅ Log de visualização do post via API
    logEvent(EVENT_STEPS.API, EVENT_OPERATIONS.API_GET_POST, userId, {
      slug,
      postId: post.id,
      statusCode: 200,
    });

    return Response.json(post);
  } catch (error) {
    // ✅ Log estruturado de erro
    logEventError(
      EVENT_STEPS.API,
      EVENT_OPERATIONS.API_GET_POST,
      userId,
      error,
      { slug }
    );

    console.error("API error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
