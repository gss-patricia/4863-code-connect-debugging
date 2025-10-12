import { database } from "../../../../../lib/database";
import { createClient } from "../../../../../utils/supabase/server";
import {
  eventLogger,
  EVENT_STEPS,
  EVENT_OPERATIONS,
} from "../../../../../lib/eventLogger";

export async function GET(_request, { params }) {
  let userId = null;
  let commentId = null;

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
        "Tentativa de acesso sem autenticação a /api/comment/[id]/replies",
        { path: "/api/comment/[id]/replies" }
      );
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    userId = user.id;
    const resolvedParams = await params;
    commentId = parseInt(resolvedParams.id);

    const replies = await database.getCommentReplies(commentId);

    eventLogger.logEvent(
      EVENT_STEPS.API,
      EVENT_OPERATIONS.API_GET_REPLIES,
      userId,
      {
        commentId,
        repliesCount: replies.length,
        statusCode: 200,
      }
    );

    return Response.json(replies);
  } catch (error) {
    eventLogger.logEventError(
      EVENT_STEPS.API,
      EVENT_OPERATIONS.API_GET_REPLIES_FAILED,
      userId,
      error,
      {
        commentId,
        statusCode: 500,
      }
    );
    return Response.json(
      { error: "Erro ao buscar respostas" },
      { status: 500 }
    );
  }
}
