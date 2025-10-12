"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./register.module.css";
import { Input } from "../Input";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Link } from "../Link";
import { Spinner } from "../Spinner";
import { ErrorMessage } from "../ErrorMessage";
import { SocialLogin } from "../SocialLogin";
import { signUp } from "../../actions/auth";

export const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("Todos os campos são obrigatórios");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Tentando registro:", formData.email);

      const result = await signUp(formData.email, formData.password, {
        name: formData.name,
      });

      if (result.success) {
        console.log("Registro realizado com sucesso");
        router.push("/login?message=Conta criada com sucesso! Faça login.");
      } else {
        setErrorMessage(result.error || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setErrorMessage("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    console.log("GitHub login");
    setErrorMessage("GitHub login não implementado");
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    setErrorMessage("Google login não implementado");
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerCardContent}>
          <div className={styles.registerImage}>
            <Image
              width={407}
              height={628}
              src="/assets/createAccountProfile.png"
              alt="Code Connect"
              className={styles.mainImage}
            />
          </div>

          <div className={styles.registerForm}>
            <h1 className={styles.heading}>Cadastro</h1>
            <p className={styles.subtitle}>Olá! Preencha seus dados.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Input
                  label="Nome"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Senha"
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>

              <div className={styles.formOptions}>
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    handleInputChange("rememberMe", e.target.checked)
                  }
                >
                  Lembrar-me
                </Checkbox>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.password ||
                  isLoading
                }
              >
                {isLoading ? <Spinner /> : "Cadastrar →"}
              </Button>
            </form>

            {errorMessage && <ErrorMessage message={errorMessage} />}

            <SocialLogin
              onGithubLogin={handleGithubLogin}
              onGoogleLogin={handleGoogleLogin}
              loading={isLoading}
            />

            <p className={styles.loginLink}>
              Já tem conta?{" "}
              <Link href="/login" variant="highlight">
                <span className={styles.loginText}>Faça seu login! →</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
