"use client";

import NextLink from "next/link";
import styles from "./link.module.css";

export const Link = ({ href, children, variant = "default", ...props }) => {
  const variantClass = styles[variant] || styles.default;

  return (
    <NextLink
      href={href}
      className={`${styles.link} ${variantClass}`}
      {...props}
    >
      {children}
    </NextLink>
  );
};
