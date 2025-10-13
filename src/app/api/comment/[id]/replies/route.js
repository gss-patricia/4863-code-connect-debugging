import { database } from "../../../../../lib/database";
import { createClient } from "../../../../../utils/supabase/server";

export async function GET(_request, { params }) {
  let userId = null;
  let commentId = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("API: unauthorized");
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    userId = user.id;
    const resolvedParams = await params;
    commentId = parseInt(resolvedParams.id);

    const replies = await database.getCommentReplies(commentId);

    console.log("Replies fetched:", commentId);
    return Response.json(replies);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Erro ao buscar respostas" },
      { status: 500 }
    );
  }
}
