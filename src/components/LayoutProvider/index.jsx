"use client";

import { usePathname } from "next/navigation";
import { Aside } from "../Aside";
import { SearchForm } from "../SearchForm";
import { LogoutButton } from "../LogoutButton";
import { TimezoneDetector } from "../TimezoneDetector";

export function LayoutProvider({ children }) {
  const pathname = usePathname();

  // Se for página de login, register ou forgot-password, renderizar sem layout
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    return (
      <>
        <TimezoneDetector />
        {children}
      </>
    );
  }

  // Para outras páginas, renderizar com layout completo
  return (
    <>
      <TimezoneDetector />
      <div className="app-container">
        <div>
          <Aside />
        </div>
        <div className="main-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "600px" }}>
              <SearchForm />
            </div>
            <div style={{ flexShrink: 0 }}>
              <LogoutButton />
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
