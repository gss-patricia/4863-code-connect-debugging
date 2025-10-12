"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "../Modal";

import styles from "./replymodal.module.css";
import { Textarea } from "../Textarea";
import { SubmitButton } from "../SubmitButton";
import { Comment } from "../Comment";
import { postReply } from "../../actions";

export const ReplyModal = ({ comment, post, onReplyAdded }) => {
  const modalRef = useRef(null);
  const router = useRouter();

  const openModal = () => {
    modalRef.current.openModal();
  };

  const handleSubmit = async (formData) => {
    await postReply(comment, formData);
    modalRef.current.closeModal();

    // ✅ Notificar componente pai para atualizar respostas
    if (onReplyAdded) {
      onReplyAdded(comment.id);
    }
  };

  return (
    <>
      <Modal ref={modalRef}>
        <form action={handleSubmit}>
          <div className={styles.body}>
            <Comment comment={comment} />
          </div>
          <div className={styles.divider}></div>
          <Textarea
            required
            rows={8}
            name="text"
            placeholder="Digite aqui..."
          />
          <div className={styles.footer}>
            <SubmitButton>Responder</SubmitButton>
          </div>
        </form>
      </Modal>
      <button className={styles.btn} onClick={openModal}>
        Responder
      </button>
    </>
  );
};
