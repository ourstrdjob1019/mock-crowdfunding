import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "success";
  size?: "sm" | "md";
  hasPulseDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  hasPulseDot = false,
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3.5 py-1 text-xs gap-2",
  };

  const variantStyles = {
    primary: "border border-blue-500/30 bg-blue-50/80 text-blue-700",
    secondary: "border border-slate-200 bg-slate-100 text-slate-700",
    outline: "border border-slate-300 bg-white text-slate-700 shadow-sm",
    success: "border border-emerald-500/30 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-wider font-semibold rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {hasPulseDot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
        </span>
      )}
      {children}
    </span>
  );
};
