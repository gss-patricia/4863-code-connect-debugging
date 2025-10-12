import { database } from "../../../../lib/database";
import { remark } from "remark";
import html from "remark-html";
import { createClient } from "../../../../utils/supabase/server";

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
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    userId = user.id;
    const resolvedParams = await params;
    slug = resolvedParams.slug;

    const post = await database.getPostBySlug(slug);

    if (!post) {
      console.log("Post not found:", slug);
      return Response.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Processar markdown
    const processedContent = await remark().use(html).process(post.markdown);
    const contentHtml = processedContent.toString();
    post.markdown = contentHtml;

    return Response.json(post);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
