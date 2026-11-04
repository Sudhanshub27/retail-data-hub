import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function Card({
  children,
  className = "",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`${
        interactive ? "slate-card-interactive" : "slate-card"
      } p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
