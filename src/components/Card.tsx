import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  accentTop?: boolean;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  accentTop = false,
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 ${
        accentTop ? "border-t-2 border-t-amber-500" : ""
      } ${
        hover ? "hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
