"use client";

import styles from "./sociallogin.module.css";

export const SocialLogin = ({ onGithubLogin, onGoogleLogin, loading }) => {
  return (
    <div className={styles.socialLogin}>
      <div className={styles.divider}>
        <span>ou</span>
      </div>

      <div className={styles.socialButtons}>
        <button
          type="button"
          onClick={onGithubLogin}
          disabled={loading}
          className={styles.socialButton}
        >
          <img src="/assets/github.svg" alt="GitHub" width="20" height="20" />
          GitHub
        </button>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={loading}
          className={styles.socialButton}
        >
          <img src="/assets/google.svg" alt="Google" width="20" height="20" />
          Google
        </button>
      </div>
    </div>
  );
};
