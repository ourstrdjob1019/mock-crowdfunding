"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isFullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isFullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-xl transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs h-9",
    md: "px-5 py-2.5 text-sm h-11",
    lg: "px-7 py-3.5 text-base h-13",
  };

  const variantStyles = {
    primary:
      "bg-accent-gradient text-white shadow-accent hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-105",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:-translate-y-0.5",
    outline:
      "bg-white text-slate-800 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 hover:-translate-y-0.5 shadow-sm",
    ghost:
      "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:-translate-y-0.5",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        isFullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
