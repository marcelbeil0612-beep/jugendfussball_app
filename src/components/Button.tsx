import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  disabled,
}: ButtonProps) {
  const className = `button button--${variant} ${
    disabled ? "button--disabled" : ""
  }`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
