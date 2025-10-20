"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";
import { Input } from "../Input";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Link } from "../Link";
import { Spinner } from "../Spinner";
import { ErrorMessage } from "../ErrorMessage";
import { SocialLogin } from "../SocialLogin";
import { signIn } from "../../actions/auth";

export const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
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

  // ✅ AUTENTICAÇÃO REAL COM SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Todos os campos são obrigatórios");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Tentando login:", formData.email);

      // ✅ Usar autenticação real do Supabase
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        console.log("Login realizado com sucesso");
        // ✅ FORÇAR REDIRECIONAMENTO CLIENT-SIDE
        window.location.href = "/";
      } else {
        setErrorMessage(result.error || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro no login:", error);
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
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginCardContent}>
          <div className={styles.loginImage}>
            <Image
              width={407}
              height={628}
              src="/assets/loginBanner.png"
              alt="Code Connect"
              className={styles.mainImage}
            />
          </div>

          <div className={styles.loginForm}>
            <h1 className={styles.heading}>Login</h1>
            <p className={styles.subtitle}>Boas-vindas! Faça seu login.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Input
                  label="Email ou usuário"
                  type="text"
                  placeholder="usuario123"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!formData.email ? "Campo obrigatório" : null}
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
                  error={!formData.password ? "Campo obrigatório" : null}
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
                <Link href="/forgot-password" variant="light">
                  Esqueci a senha
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={!formData.email || !formData.password || isLoading}
              >
                {isLoading ? <Spinner /> : "Login"}
              </Button>
            </form>

            {errorMessage && <ErrorMessage message={errorMessage} />}

            <SocialLogin
              onGithubLogin={handleGithubLogin}
              onGoogleLogin={handleGoogleLogin}
              loading={isLoading}
            />

            <p className={styles.signupLink}>
              Ainda não tem conta?
              <Link href="/register" variant="highlight">
                <span className={styles.signupText}>
                  Crie seu cadastro!
                  <img
                    src="/assets/assignment.svg"
                    alt="Cadastro"
                    width="24"
                    height="24"
                  />
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
