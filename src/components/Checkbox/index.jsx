"use client";

import styles from "./checkbox.module.css";

export const Checkbox = ({ children, checked, onChange, ...props }) => {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={styles.checkbox}
        {...props}
      />
      <span className={styles.checkmark}></span>
      {children}
    </label>
  );
};
