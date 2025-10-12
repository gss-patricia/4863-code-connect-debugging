import styles from "./button.module.css";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const buttonClass =
    variant === "secondary" ? styles.btnSecondary : styles.btn;

  // Aplicar fullWidth via style ao invés de passar como prop
  const buttonStyle = fullWidth ? { ...style, width: "100%" } : style;

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={buttonStyle}
      {...props}
    >
      {children}
    </button>
  );
};
