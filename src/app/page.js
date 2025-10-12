import { CardPost } from "../components/CardPost";
import { database } from "../lib/database";
import { createClient } from "../utils/supabase/server";
import { eventLogger } from "../lib/eventLogger";
import { redirect } from "next/navigation";

import styles from "./page.module.css";
import Link from "next/link";

// ✅ Desabilitar cache para páginas protegidas
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllPosts(page, searchTerm) {
  return await database.getAllPosts(page, searchTerm);
}

export default async function Home({ searchParams }) {
  // ✅ PROTEÇÃO DE PÁGINA: Sempre usar getUser() em Server Components
  // Nunca confiar em getSession() - cookies podem ser falsificados
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Se não houver usuário autenticado, redireciona para login
  if (error || !user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page || 1);
  const searchTerm = resolvedSearchParams?.q;
  const {
    data: posts,
    prev,
    next,
  } = await getAllPosts(currentPage, searchTerm);

  // 🎯 USER JOURNEY LOG - View Home Page
  eventLogger.logViewHome(user.id, {
    page: currentPage,
    searchTerm: searchTerm || null,
    postsCount: posts.length,
  });

  return (
    <main className={styles.grid}>
      {posts.map((post) => (
        <CardPost key={post.id} post={post} />
      ))}
      <div className={styles.links}>
        {prev && (
          <Link href={{ pathname: "/", query: { page: prev, q: searchTerm } }}>
            Página anterior
          </Link>
        )}
        {next && (
          <Link href={{ pathname: "/", query: { page: next, q: searchTerm } }}>
            Próxima página
          </Link>
        )}
      </div>
    </main>
  );
}
