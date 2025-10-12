"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgotpassword.module.css";
import { Input } from "../Input";
import { Button } from "../Button";
import { Link } from "../Link";
import { Spinner } from "../Spinner";
import { ErrorMessage } from "../ErrorMessage";

export const ForgotPassword = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Email é obrigatório");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log("Enviando email de recuperação para:", email);

      // Simular envio de email
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccessMessage(
        "Email de recuperação enviado! Verifique sua caixa de entrada."
      );
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      setErrorMessage("Erro ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotCard}>
        <div className={styles.forgotContent}>
          <h1 className={styles.heading}>Esqueci minha senha</h1>
          <p className={styles.subtitle}>
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!email ? "Campo obrigatório" : null}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!email || isLoading}
            >
              {isLoading ? <Spinner /> : "Enviar Email"}
            </Button>
          </form>

          {errorMessage && <ErrorMessage message={errorMessage} />}
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          <div className={styles.backToLogin}>
            <Link href="/login" variant="light">
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
