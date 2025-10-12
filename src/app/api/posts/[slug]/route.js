import { database } from "../../../../lib/database";
import { remark } from "remark";
import html from "remark-html";
import { createClient } from "../../../../utils/supabase/server";
import {
  eventLogger,
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
      eventLogger.logEventWarning(
        EVENT_STEPS.API,
        EVENT_OPERATIONS.API_UNAUTHORIZED,
        null,
        "Tentativa de acesso sem autenticação a /api/posts/[slug]",
        { path: "/api/posts/[slug]" }
      );
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    userId = user.id;
    const resolvedParams = await params;
    slug = resolvedParams.slug;

    const post = await database.getPostBySlug(slug);

    if (!post) {
      eventLogger.logEventWarning(
        EVENT_STEPS.API,
        EVENT_OPERATIONS.API_GET_POST_FAILED,
        userId,
        "Post não encontrado",
        { slug, statusCode: 404 }
      );
      return Response.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Processar markdown
    const processedContent = await remark().use(html).process(post.markdown);
    const contentHtml = processedContent.toString();
    post.markdown = contentHtml;

    eventLogger.logEvent(
      EVENT_STEPS.API,
      EVENT_OPERATIONS.API_GET_POST,
      userId,
      {
        slug,
        postId: post.id,
        statusCode: 200,
      }
    );

    return Response.json(post);
  } catch (error) {
    eventLogger.logEventError(
      EVENT_STEPS.API,
      EVENT_OPERATIONS.API_GET_POST_FAILED,
      userId,
      error,
      {
        slug,
        statusCode: 500,
      }
    );
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
