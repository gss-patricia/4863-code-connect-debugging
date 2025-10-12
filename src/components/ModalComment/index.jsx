"use client";

import { useRef } from "react";
import { IconButton } from "../IconButton";
import { Modal } from "../Modal";
import { Chat } from "../icons/Chat";
import { Textarea } from "../Textarea";

import styles from "./commentmodal.module.css";
import { SubmitButton } from "../SubmitButton";
import { Subheading } from "../Subheading";

export const ModalComment = ({ action, onCommentAdded }) => {
  const modalRef = useRef(null);

  const handleSubmit = async (formData) => {
    try {
      await action(formData);

      modalRef.current.closeModal();

      // ✅ Notificar componente pai para atualizar comentários
      if (onCommentAdded) {
        await onCommentAdded();
      }
    } catch (error) {
      console.error("❌ ModalComment: erro no handleSubmit:", error);
    }
  };

  return (
    <>
      <Modal ref={modalRef}>
        <form action={handleSubmit}>
          <Subheading>Deixe seu comentário sobre o post:</Subheading>
          <Textarea
            required
            rows={8}
            name="text"
            placeholder="Digite aqui..."
          />
          <div className={styles.footer}>
            <SubmitButton>Comentar</SubmitButton>
          </div>
        </form>
      </Modal>
      <IconButton onClick={() => modalRef.current.openModal()}>
        <Chat />
      </IconButton>
    </>
  );
};
