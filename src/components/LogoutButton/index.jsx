"use client";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../Button";

export const LogoutButton = () => {
  const { signOut, user } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    if (signOut) {
      signOut();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 16px",
        background: "var(--cinza-escuro)",
        borderRadius: "8px",
        border: "1px solid var(--cinza)",
      }}
    >
      <span style={{ color: "var(--branco)", fontSize: "14px" }}>
        Olá, {user.email}
      </span>
      <Button
        variant="secondary"
        onClick={handleLogout}
        style={{ padding: "4px 12px", fontSize: "12px" }}
      >
        Sair
      </Button>
    </div>
  );
};
