import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  primary:
    "bg-amber-500 text-slate-900 font-semibold hover:bg-amber-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300",
  outline:
    "border border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-colors duration-300",
  ghost: "text-slate-400 hover:text-slate-100 transition-colors duration-300",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  onClick,
}: ButtonProps) {
  const buttonClass = `inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ${
    variantStyles[variant]
  } ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass}>
      {children}
    </button>
  );
}
