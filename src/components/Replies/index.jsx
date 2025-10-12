"use client";

import { useEffect, useState } from "react";
import styles from "./replies.module.css";
import { Comment } from "../Comment";
import { ReplyModal } from "../ModalReply";

export const Replies = ({ comment, onReplyAdded }) => {
  const [showReplies, setShowReplies] = useState(false);

  const [replies, setReplies] = useState([]);

  async function fetchData() {
    console.log("🔄 Replies: buscando respostas para comentário", comment.id);
    const response = await fetch(`/api/comment/${comment.id}/replies`);
    const data = await response.json();
    setReplies(data);
    console.log("✅ Replies: respostas carregadas:", data.length);
  }

  useEffect(() => {
    if (showReplies) {
      fetchData();
    }
  }, [showReplies]);

  // ✅ Recarregar respostas quando uma nova for adicionada
  useEffect(() => {
    if (onReplyAdded && showReplies) {
      console.log("🔄 Replies: nova resposta adicionada, recarregando...");
      fetchData();
    }
  }, [onReplyAdded]);

  return (
    <div className={styles.container}>
      <div className={styles.replies}>
        <button
          className={styles.btn}
          onClick={() => setShowReplies(!showReplies)}
        >
          {showReplies ? "Ocultar" : "Ver"} respostas
        </button>
        {showReplies && (
          <ul>
            {replies.map((reply) => (
              <li key={reply.id}>
                <Comment comment={reply} />
                <ReplyModal comment={reply} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
