"use client";

import styles from "./errormessage.module.css";

export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <span className={styles.errorText}>{message}</span>
    </div>
  );
};
