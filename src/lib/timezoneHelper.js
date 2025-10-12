/**
 * TIMEZONE HELPER - Versão Simplificada
 *
 * Detecta o timezone do usuário de forma simples e prática
 */

/**
 * Detecta o timezone do usuário
 * Prioridade: Cookie > Timezone do servidor
 *
 * @returns {string} Timezone (ex: "America/Sao_Paulo", "UTC")
 */
export function detectTimezone() {
  // 1. Tentar pegar do cookie (setado pelo TimezoneDetector no client)
  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_timezone="));

    if (cookie) {
      const timezone = cookie.split("=")[1];
      if (timezone) return timezone;
    }
  }

  // 2. Fallback: Timezone do servidor/client
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
